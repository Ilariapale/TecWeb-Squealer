import { Component } from '@angular/core';
import { AuthService } from '../../services/api/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

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

  constructor(private authService: AuthService, private router: Router, private userService: UserService) {}
  ngOnInit() {
    console.log('LoginComponent ngOnInit');
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) {
      this.router.navigate(['/home']);
      console.log('already logged in');
    } else {
      console.log('not logged in');
    }

    //TODO check if the token is valid
  }
  onSubmit(): void {
    // Chiamare il servizio di autenticazione per fare il login
    if (this.guestMode) {
      localStorage.clear();
      sessionStorage.clear();
      this.userService.setUserData({ account_type: 'guest', username: 'user' });
      this.router.navigate(['/home']);
    } else
      this.authService.login(this.username, this.password, this.rememberMe).subscribe(
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
