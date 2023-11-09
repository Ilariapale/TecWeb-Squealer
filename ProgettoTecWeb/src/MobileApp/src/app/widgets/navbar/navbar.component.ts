import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/api/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
  logout() {
    this.authService.logout(); // Chiama il metodo di logout dal tuo servizio di autenticazione
  }

  deleteProfile() {
    //TODO delete profile
  }
}
