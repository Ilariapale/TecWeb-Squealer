import { Component, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { SquealService } from 'src/app/services/api/squeals.service';
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
  lastLength: number = 0;
  enoughChars: boolean = true;
  char_left: {
    daily: number;
    weekly: number;
    monthly: number;
    extra_daily: number;
  } = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    extra_daily: 0,
  };

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private userService: UserService,
    private squealService: SquealService
  ) {}

  ngOnInit() {
    this.userService.getUserData().subscribe((userData) => {
      this.user = userData;
      console.log(this.user); // Verifica se ricevi correttamente i dati dell'utente
      this.char_left.daily = this.user.char_quota.daily;
      this.char_left.weekly = this.user.char_quota.weekly;
      this.char_left.monthly = this.user.char_quota.monthly;
      this.char_left.extra_daily = this.user.char_quota.extra_daily;
    });
    this.squealForm = this.formBuilder.group({
      text: ['', Validators.required],
    });
  }

  onInput() {
    this.adjustTextareaHeight();

    const currentLength = this.squealForm.value.text.length;
    const previousLength = this.lastLength;

    // Calcola la differenza tra la lunghezza attuale e quella precedente
    const difference: number = currentLength - previousLength;

    this.lastLength = currentLength; // Aggiorna la lunghezza precedente
    // Aggiorna la quota in base alla differenza

    this.char_left.daily -= difference;
    this.char_left.weekly -= difference;
    this.char_left.monthly -= difference;

    if (
      ((this.char_left.daily < 0 || this.char_left.weekly < 0 || this.char_left.monthly < 0) && difference >= 0) ||
      ((this.char_left.daily <= 0 || this.char_left.weekly <= 0 || this.char_left.monthly <= 0) && difference <= 0)
    ) {
      this.char_left.extra_daily -= difference;
      if (this.char_left.extra_daily < 0) this.enoughChars = false;
      else this.enoughChars = true;
    } else this.enoughChars = true;

    this.user.char_quota.daily = this.char_left.daily <= 0 ? 0 : this.char_left.daily;
    this.user.char_quota.weekly = this.char_left.weekly <= 0 ? 0 : this.char_left.weekly;
    this.user.char_quota.monthly = this.char_left.monthly <= 0 ? 0 : this.char_left.monthly;
    this.user.char_quota.extra_daily = this.char_left.extra_daily <= 0 ? 0 : this.char_left.extra_daily;
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
      const squeal_content = this.squealForm.value.text;
      //console.log('Nuovo squeal:', squealText);
      this.squealService.postSqueal(squeal_content).subscribe(
        (response: any) => {
          console.log('Success:', response);
          this.squealSubmitted.emit(squeal_content);
          this.userService.setUserData(this.user);
          sessionStorage.getItem('user')
            ? sessionStorage.setItem('user', JSON.stringify(this.user))
            : localStorage.setItem('user', JSON.stringify(this.user));
          this.lastLength = 0;
          this.squealForm.reset();
        },
        (error) => {
          // Gestisci il caso in cui il form non sia valido
          const element = document.querySelector('.squeal-form-text'); // Selettore dell'elemento di testo, assicurati di aggiungere una classe appropriata all'elemento di testo nel tuo template
          if (element) {
            console.log(element);
            element.classList.add('vibrating-error'); // Aggiungi la classe di vibrante errore
            setTimeout(() => {
              element.classList.remove('vibrating-error'); // Rimuovi la classe dopo 0.5 secondi
            }, 500);
          }
        }
      );

      console.log(this.user);
    } else {
      // Gestisci il caso in cui il form non sia valido
      console.log('Form non valido');
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
