import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/api/auth.service';
import { Router } from '@angular/router';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  user = {
    email: '',
    username: '',
    password: '',
  };
  errorMessage: string = '';
  successMessage: string = '';
  constructor(private authService: AuthService, private router: Router, private darkModeService: DarkModeService) {}
  onSubmit(): void {
    // Call the authentication service to sign up
    this.authService.signup(this.user.email, this.user.username, this.user.password).subscribe({
      next: (response) => {
        // Handle the response from the service if needed
        //console.log('Login successful', response);
        this.successMessage = `Account created successfully! You'll be redirected to the login page in a few seconds.`;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 5000);
        // Redirect the user to another page if the signup is successful
      },
      error: (error) => {
        // Handle errors here, e.g. show an error message to the user
        this.errorMessage = error.error.error;
      },
    });
  }
  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
}
