//standalone login component 

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ViewEncapsulation  } from '@angular/core';

import { CommonModule } from '@angular/common'; //for basic Angular directives (*ngIf, *ngFor).
import { FormsModule } from '@angular/forms'; //two-way binding ([(ngModel)]).
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router'; 
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login', //HTML tag 
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  //input 
  email = '';
  password = '';

  //validation/server-side errors
  errors = {
    email: '',
    password: '',
    general: ''
  };

  //HttpClient: to send HTTP requests
  //Router: to navigate between routes/pages.
  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}


  //regex to validate email format.
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validateEmail() {
    if (!this.email.trim()) {
      this.errors.email = 'Email is required.';
    } else if (!this.isValidEmail(this.email)) {
      this.errors.email = 'Email must be valid.';
    } else {
      this.errors.email = '';
    }
  }
  

  validatePassword() {
    this.errors.password = this.password.trim() ? '' : 'Password is required.';
  }
  


 

  onSubmit() {

    sessionStorage.removeItem('lastViewedArtistId');
    
    this.errors = { email: '', password: '', general: '' };

    if (!this.email.trim()) {
      this.errors.email = 'Email is required.';
    } else if (!this.isValidEmail(this.email)) {
      this.errors.email = 'Email must be valid.';
    }

    if (!this.password.trim()) {
      this.errors.password = 'Password is required.';
    }

    if (this.errors.email || this.errors.password) return;

    //prepare login payload
    const body = {
      email: this.email,
      password: this.password
    };

    //send POST request to login API
    this.http.post('/api/auth/login', body).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);

        this.authService.setUser(response.user);


        //set session flag to show favorites in search
        sessionStorage.setItem('justLoggedin', 'true');

      
        localStorage.setItem('user', JSON.stringify(response.user));

        //go to search page
        this.router.navigate(['/search']);
      },
      error: (err) => {
        console.error(err);
        this.errors.general = err.error?.error || "Email and password don't match.";
      }
    });
  }

 
  ngOnInit() {
    console.log('LoginComponent loaded');
  }

}
