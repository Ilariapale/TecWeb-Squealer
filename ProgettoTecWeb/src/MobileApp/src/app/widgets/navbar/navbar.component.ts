import { Component, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { UserService } from 'src/app/services/user.service';
import { UsersService } from 'src/app/services/api/users.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  user: string = '';
  log_button: string = 'Login';
  @Output() textMode: string = 'Dark mode';
  constructor(
    public authService: AuthService,
    private darkModeService: DarkModeService,
    public router: Router,
    public userService: UserService,
    private usersService: UsersService
  ) {
    const user = userService.getUserData();
    if (!user) {
      this.log_button = 'Login';
    } else {
      this.log_button = user.account_type == 'guest' || user.account_type == undefined ? 'Login' : 'Logout';
    }
  }

  log() {
    if (this.log_button == 'Login') {
      this.router.navigate(['/login']);
    } else {
      this.authService.logout();
    }
    // Chiama il metodo di logout dal tuo servizio di autenticazione
  }

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
    this.textMode = this.darkModeService.darkMode ? 'Light mode' : 'Dark mode';
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }

  goToPage(page: string) {
    //TODO controllare
    if (page === 'profile') {
      this.user = this.userService.getUserData()?.username || '';
      const destination = this.user ? `/${page}/${this.user}` : '/login';
      this.router.navigate([destination]);
    } else {
      this.router.navigate([`/${page}`]);
    }
  }

  deleteProfile() {
    this.usersService
      .deleteUser(this.userService.getUserData()?.username || '')
      .then((res) => {
        this.authService.logout();
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
