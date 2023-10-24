import {
  Component,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.interface';

@Component({
  selector: 'app-squeal-form',
  templateUrl: './squeal-form.component.html',
  styleUrls: ['./squeal-form.component.css'],
})
export class SquealFormComponent {
  @ViewChild('textarea') textarea!: ElementRef;
  @Output() squealSubmitted: EventEmitter<any> = new EventEmitter();
  @Input() user!: User;
  squealForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService.getUserData().subscribe((userData) => {
      this.user = userData;
      console.log(this.user); // Verifica se ricevi correttamente i dati dell'utente
    });

    this.squealForm = this.formBuilder.group({
      text: ['', Validators.required],
    });
  }

  onInput() {
    this.adjustTextareaHeight();
  }

  adjustTextareaHeight() {
    const nativeElement = this.textarea.nativeElement;
    nativeElement.style.height = 'auto'; // Ripristina l'altezza predefinita
    nativeElement.style.height = nativeElement.scrollHeight + 'px'; // Imposta l'altezza in base allo scrollHeight
  }

  //text: string = '';

  getRowCount(): number {
    // Calcola il numero di righe necessarie in base alla lunghezza del testo
    const lineCount = this.squealForm.value.text.split('\n').length;
    return Math.max(lineCount, 1); // Assicurati che ci sia sempre almeno una riga
  }

  createSqueal() {
    if (this.squealForm.valid) {
      // Invia il nuovo squeal al tuo backend o a un servizio API
      const squealText = this.squealForm.value.text;
      //console.log('Nuovo squeal:', squealText);
      const squeal = { text: squealText };
      this.postSqueal(squeal);
      this.squealSubmitted.emit(squeal);
    } else {
      // Gestisci il caso in cui il form non sia valido
      console.log('Form non valido');
    }
  }

  async postSqueal(squeal: any, userId: String = '6471009fc6d59f541ad74776') {
    try {
      const url = `/user/${userId}/squeal`; // L'URL del tuo endpoint API
      const response = await this.http.post(url, { squeal }).subscribe();
      // Gestisci la risposta del server qui
      //console.log(response);
    } catch (error) {
      // Gestisci gli errori qui
      console.error(error);
    }
  }

  /*

  async  createUser() {
    const url = '/users';
    const data = { username: "ilapale", email: "ilaria.palestini@gmail.com", password: "password"};

    try {
      const response = await firstValueFrom(this.http.post(url, data));
      // Gestisci la risposta del server qui
      console.log(response);
    } catch (error) {
      // Gestisci gli errori qui
      console.error(error);
    }
  }


  async newUser() {
    const body = { username: 'john', email: 'john@example.com', password: 'secret' }; // Il corpo della richiesta

    // Imposta le intestazioni (se necessario)
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const url = "/users"
    // this.http.post(url, body, { headers }).subscribe(
    //   response => {
    //     console.log('Success:', response);
    //     // Gestisci la risposta dal server
    //   },
    //   error => {
    //     console.error('Error:', error);
    //     // Gestisci gli errori
    //   }
    // );
    console.log(body)
    const response = await firstValueFrom(this.http.post(url, body, { headers }));
    console.log(response );
  }



  async makeRequest(text: string) {
    try {
      const url = '/api/dati'; // L'URL del tuo endpoint API
      const response = await this.http.post(url, { text }).subscribe();
      // Gestisci la risposta del server qui
      console.log(response);
    } catch (error) {
      // Gestisci gli errori qui
      console.error(error);
    }
  }
  */
}
