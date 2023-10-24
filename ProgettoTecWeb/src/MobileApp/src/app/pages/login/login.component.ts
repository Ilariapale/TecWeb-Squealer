import { Component } from '@angular/core';
import { AuthService } from '../../services/api/auth.service';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) {}
  onSubmit(): void {
    // Chiamare il servizio di autenticazione per fare il login
    this.authService
      .login(this.username, this.password, this.rememberMe)
      .subscribe(
        (response) => {
          // Gestisci la risposta dal servizio se necessario
          //console.log('Login successful', response);
          this.router.navigate(['/home']);
          // Reindirizza l'utente a un'altra pagina se il login è riuscito
        },
        (error) => {
          // Gestisci gli errori qui, ad esempio mostrando un messaggio all'utente
          this.errorMessage = error.error.error;
        }
      );
  }
}
