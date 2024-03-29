import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DarkModeService } from '../../services/dark-mode.service';
import { UsersService } from 'src/app/services/api/users.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  username: string = '';
  password: string = '';
  email: string = '';
  errorMessage: string = '';
  rememberMe: boolean = false;
  guestMode: boolean = false;

  constructor(private router: Router, private darkModeService: DarkModeService, private usersService: UsersService) {}

  ngOnInit(): void {
    const forms = document.querySelectorAll('form'); // Declare the 'forms' variable
    const form = forms[0] as HTMLFormElement;

    // Specify the type of 'form' parameter
    form.addEventListener(
      'submit',
      (event: Event) => {
        // Explicitly type the 'event' parameter
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add('was-validated');
      },

      false
    );
  }

  onSubmit(): void {
    this.usersService.resetPassword(this.username, this.email, this.password).then(
      (response) => {
        // The request went well
        this.router.navigate(['/login']);
      },
      (error) => {
        // The request went wrong
        this.errorMessage = error.error.error || 'Something went wrong';
      }
    );
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
}
