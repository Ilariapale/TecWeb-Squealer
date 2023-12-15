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
  rememberMe: boolean = false;
  guestMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private darkModeService: DarkModeService
  ) {}
  ngOnInit() {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) {
      //TODO possibile implementazione di una richiesta al server per verificare la validità del token
      this.router.navigate(['/home']);
    }
  }
  onSubmit(): void {
    // Chiamare il servizio di autenticazione per fare il login
    if (this.guestMode) {
      localStorage.removeItem('Authorization');
      sessionStorage.removeItem('Authorization');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      this.userService.setUserData({ account_type: 'guest', username: 'user' });
      sessionStorage.setItem('user', JSON.stringify({ account_type: 'guest', username: 'user' }));
      this.router.navigate(['/home']);
    } else {
      this.authService
        .login(this.username, this.password, this.rememberMe)
        .then((response: boolean) => {
          // Gestisci la risposta dal servizio se necessario
          this.router.navigate(['/home']);
          // Reindirizza l'utente a un'altra pagina se il login è riuscito
        })
        .catch((error: any) => {
          // Gestisci gli errori qui, ad esempio mostrando un messaggio all'utente
          this.errorMessage = error;
        });
    }
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }

  //TODO aggiungere il login del profilo
}
