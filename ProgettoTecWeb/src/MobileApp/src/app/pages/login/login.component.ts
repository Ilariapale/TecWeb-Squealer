import { Component } from '@angular/core';
import { AuthService } from '../../services/api/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { DarkModeService } from '../../services/dark-mode.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  rememberMe: boolean = true;
  guestMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private darkModeService: DarkModeService
  ) {}
  ngOnInit() {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) {
      this.router.navigate(['/home']);
    }
  }
  onSubmit(): void {
    if (this.guestMode) {
      localStorage.removeItem('Authorization');
      sessionStorage.removeItem('Authorization');

      localStorage.removeItem('user');
      sessionStorage.removeItem('user');

      this.userService.setUserData({ account_type: 'guest', username: 'user' });
      sessionStorage.setItem('user', JSON.stringify({ account_type: 'guest', username: 'user' }));

      const Guest_Authorization = localStorage.getItem('Guest_Authorization');

      this.authService.loginGuest(Guest_Authorization || undefined).then((response: boolean) => {
        this.router.navigate(['/home']);
      });
    } else {
      this.authService
        .login(this.username, this.password, this.rememberMe)
        .then((response: boolean) => {
          this.router.navigate(['/home']);
        })
        .catch((error: any) => {
          this.errorMessage = error;
        });
    }
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
}
