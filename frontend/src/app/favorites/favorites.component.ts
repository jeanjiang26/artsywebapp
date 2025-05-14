import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})

export class FavoritesComponent {
  favorites: any[] = [];
  isLoading = true;

  alertMessage: string | null = null;
  alertType: 'success' | 'danger' = 'success';

  notifications: Array<{ id: string, message: string, type: 'success' | 'danger' }> = [];
  nextNotificationId = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {

    sessionStorage.removeItem('lastViewedArtistId');

    if (this.favorites.length === 0) {
      this.fetchFavorites();
    }

    // Auto-update relative timers every second
    interval(1000).subscribe(() => {
      this.favorites = this.favorites.map(fav => ({
        ...fav,
        relativeTime: this.getRelativeTime(fav.timestamp)
      }));
    });
  }

  fetchFavorites(): void {
    this.http.get('/api/favorites').subscribe((res: any) => {
      this.favorites = (res.favorites || []).map((fav: any) => ({
        ...fav,
        relativeTime: this.getRelativeTime(fav.timestamp)
      }));
      this.isLoading = false;
    });
  }

  

  removeFavorite(artistId: string): void {
    this.http.delete(`/api/favorites/${artistId}`).subscribe((res: any) => {
      this.favorites = (res.favorites || []).map((fav: any) => ({
        ...fav,
        relativeTime: this.getRelativeTime(fav.timestamp)
      }));
      this.showAlert('Removed from favorites', 'danger');
      
    });
  }

  showAlert(message: string, type: 'success' | 'danger') {
    const id = `notification-${this.nextNotificationId++}`;
    
    // Add new notification to the stack
    this.notifications.push({
      id,
      message,
      type
    });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      this.dismissNotification(id);
    }, 3000);
  }

  //handle dismissal
  dismissNotification(id: string): void {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
  }
  

  getRelativeTime(dateStr: string): string {
    const now = new Date();
    const then = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  goToArtistDetails(id: string): void {
    this.router.navigate(['/search', id]);
  }
  





}
