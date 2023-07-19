import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  constructor(private http: HttpClient) {}
  ngOnInit() {
    const forms = document.querySelectorAll('.needs-validation');

    Array.prototype.slice.call(forms).forEach((form: HTMLFormElement) => {
      form.addEventListener(
        'submit',
        (event: Event) => {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          }

          form.classList.add('was-validated');
        },
        false
      );
    });
  }

  createAccount() {
    this.http.post('/user/', this.user).subscribe(
      (response) => {
        console.log('Richiesta inviata con successo!', response);
        // Puoi fare altre azioni dopo l'invio del form, come reindirizzare l'utente o mostrare un messaggio di successo
      },
      (error) => {
        console.error("Errore durante l'invio della richiesta:", error);
        // Puoi gestire gli errori qui, ad esempio mostrando un messaggio di errore all'utente
      }
    );
  }
}
