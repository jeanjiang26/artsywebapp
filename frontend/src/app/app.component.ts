import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  user: any = null;

  notifications: Array<{ id: string, message: string, type: 'success' | 'danger' }> = [];
  nextNotificationId = 0;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    const notification = sessionStorage.getItem('postLogoutNotification');
    if (notification) {
      const { message, type } = JSON.parse(notification);
      this.showAlert(message, type);
      sessionStorage.removeItem('postLogoutNotification');
    }

    
  }

  // logout() {
  //   this.http.post('/api/auth/logout', {}).subscribe(() => {
  //     this.authService.clearUser();
  //     console.log('Removing artist details for ID:', sessionStorage.getItem('lastViewedArtistId'));
  //     sessionStorage.removeItem('lastViewedArtistId');
      
  //     this.showAlert('Logged out', 'success');
      
  //     window.location.href = '/search';

      

  //     // this.router.navigate(['/search']);

  //   });
  // }
  logout() {
    this.http.post('/api/auth/logout', {}).subscribe(() => {
      this.authService.clearUser();
      console.log('Removing artist details for ID:', sessionStorage.getItem('lastViewedArtistId'));
      sessionStorage.removeItem('lastViewedArtistId');
  
      sessionStorage.setItem('postLogoutNotification', JSON.stringify({ 
        message: 'Logged out', 
        type: 'success' 
      }));
  
      window.location.href = '/search';
    });
  }
  

  deleteAccount(): void {
    try {
  

      console.log("Sending delete request");
      this.http.delete('/api/auth/delete', { withCredentials: true }).subscribe({
        next: (response) => {
          console.log("Delete success:", response);
          this.authService.clearUser();
          sessionStorage.removeItem('lastViewedArtistId');

          // this.showAlert('Account deleted', 'danger');

          sessionStorage.setItem('postLogoutNotification', JSON.stringify({ 
            message: 'Account deleted', 
            type: 'danger' 
          }));
  

          window.location.href = '/search';
          // this.router.navigate(['/search']);

        },
        error: (err) => {
          console.error('Error deleting account:', err);
          alert(`Failed to delete account: ${err.status} ${err.statusText}`);
        }
      });
    } catch (error) {
      console.error("Uncaught error in deleteAccount:", error);
    }
  }

  showAlert(message: string, type: 'success' | 'danger') {
    const id = `notification-${this.nextNotificationId++}`;
    
    this.notifications.push({
      id,
      message,
      type
    });
    
    setTimeout(() => {
      this.dismissNotification(id);
    }, 2000);
  }

  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
  }
}
