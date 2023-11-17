import { Component, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/api/auth.service';
import { DarkModeService } from 'src/app/services/dark-mode.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Output() textMode: string = 'Dark mode';
  constructor(public authService: AuthService, private darkModeService: DarkModeService, public router: Router) {}

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
    this.router.navigate([`/${page}`]);
  }

  deleteProfile() {
    //TODO delete profile
  }
}
