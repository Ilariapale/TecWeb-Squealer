import { Component, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  user: string = '';
  @Output() textMode: string = 'Dark mode';
  constructor(
    public authService: AuthService,
    private darkModeService: DarkModeService,
    public router: Router,
    public userService: UserService
  ) {}

  logout() {
    this.authService.logout(); // Chiama il metodo di logout dal tuo servizio di autenticazione
  }

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
    this.textMode = this.darkModeService.darkMode ? 'Light mode' : 'Dark mode';
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }

  goToPage(page: string) {
    if (page === 'profile') {
      this.userService.getUserData().subscribe((user) => {
        this.user = user?.username || '';
        const destination = this.user ? `/${page}/${this.user}` : '/login';
        this.router.navigate([destination]);
      });
    } else {
      this.router.navigate([`/${page}`]);
    }
  }

  deleteProfile() {
    //TODO delete profile
  }
}
