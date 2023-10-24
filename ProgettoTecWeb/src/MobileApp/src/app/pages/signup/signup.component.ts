import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/api/auth.service';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) {}
  onSubmit(): void {
    // Chiamare il servizio di autenticazione per fare il login
    this.authService
      .signup(this.user.email, this.user.username, this.user.password)
      .subscribe(
        (response) => {
          // Gestisci la risposta dal servizio se necessario
          //console.log('Login successful', response);
          this.router.navigate(['/login']);
          // Reindirizza l'utente a un'altra pagina se il login è riuscito
        },
        (error) => {
          // Gestisci gli errori qui, ad esempio mostrando un messaggio all'utente
          this.errorMessage = error.error.error;
        }
      );
  }
}
