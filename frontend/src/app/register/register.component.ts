import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { routes } from '../app.routes';
import { RouterModule } from '@angular/router';

import { Router } from '@angular/router';


import { AuthService } from '../auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  

  name = '';
  email = '';
  password = '';

  errors = {
    name: '',
    email: '',
    password: '',
    general: ''
  };

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  //constructor(private http: HttpClient) {}

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validateName() {
    this.errors.name = this.name.trim() ? '' : 'Full name is required.';
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
    // Reset errors
    this.errors = { name: '', email: '', password: '', general: '' };

    if (!this.name.trim()) {
      this.errors.name = 'Full name is required.';
    }

    if (!this.email.trim()) {
      this.errors.email = 'Email is required.';
    } else if (!this.isValidEmail(this.email)) {
      this.errors.email = 'Email must be valid.';
    }

    if (!this.password.trim()) {
      this.errors.password = 'Password is required.';
    }

    // If there are any errors, don't proceed
    if (this.errors.name || this.errors.email || this.errors.password) {
      return;
    }

    const body = {
      fullname: this.name,
      email: this.email,
      password: this.password
    };


    //submit
    this.http.post('/api/auth/register', body).subscribe({
      next: () => {
        // Fetch user details
        this.http.get('/api/auth/me').subscribe({
          next: (response: any) => {
            localStorage.setItem('user', JSON.stringify(response.user));
            sessionStorage.setItem('justRegistered', 'true');
            this.authService.setUser(response.user);

            this.router.navigate(['/search']);
          },
          error: () => {
            this.errors.general = 'Unable to fetch user details.';
          }
        });
      },
      error: (err) => {
        this.errors.general = err.error?.error || 'Registration failed. Please try again.';
      }
    });



    
    
  }
  
  hasErrors(): boolean {
    return !!(this.errors.name || this.errors.email || this.errors.password);
  }
  
  
  

  ngOnInit() {
    console.log('RegisterComponent loaded');
  }

 
}



