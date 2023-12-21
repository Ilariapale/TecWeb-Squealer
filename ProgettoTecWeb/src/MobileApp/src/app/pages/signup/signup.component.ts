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
    this.authService.signup(this.user.email, this.user.username, this.user.password).subscribe({
      next: (response) => {
        this.successMessage = `Account created successfully! You'll be redirected to the login page in a few seconds.`;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error.error;
      },
    });
  }
  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
}
