import { Component, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { User } from 'src/app/models/user.interface';
import { Recipients } from 'src/app/models/squeal.interface';
import { TagInputComponent } from '../tag-input/tag-input.component';
import { firstValueFrom } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { Router } from '@angular/router';
//TODOfare in modo che quando scrivo un recipient nel form questo si stilizzi
@Component({
  selector: 'app-squeal-form',
  templateUrl: './squeal-form.component.html',
  styleUrls: ['./squeal-form.component.css'],
})
export class SquealFormComponent {
  @ViewChild('textarea') textarea!: ElementRef;
  @ViewChild('usersInput') usersComponent!: TagInputComponent;
  @ViewChild('channelsInput') channelsComponent!: TagInputComponent;
  @ViewChild('keywordsInput') keywordsComponent!: TagInputComponent;

  @Output() squealSubmitted: EventEmitter<any> = new EventEmitter();
  @Input() user!: User;

  recipients: Recipients = {
    users: [],
    channels: [],
    keywords: [],
  };

  squealForm!: FormGroup;
  lastLength: number = 0;
  enoughChars: boolean = true;
  isGuest: boolean = true;
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
    public userService: UserService,
    private squealService: SquealsService,
    private darkModeService: DarkModeService,
    private router: Router
  ) {
    firstValueFrom(this.userService.getUserData()).then((userData) => {
      this.user = userData;
      if (userData.account_type == 'guest') {
        this.isGuest = true;
      } else {
        if (['standard', 'moderator', 'professional', 'verified'].includes(userData.account_type)) {
          this.isGuest = false;
          this.char_left.daily = this.user.char_quota.daily;
          this.char_left.weekly = this.user.char_quota.weekly;
          this.char_left.monthly = this.user.char_quota.monthly;
          this.char_left.extra_daily = this.user.char_quota.extra_daily;
        }
      }
    });
  }

  ngOnInit() {
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

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }

  getRecipients() {
    this.recipients.users = this.usersComponent.getTags();
    this.recipients.channels = this.channelsComponent.getTags();
    this.recipients.keywords = this.keywordsComponent.getTags();
  }

  adjustTextareaHeight() {
    const nativeElement = this.textarea.nativeElement;
    nativeElement.style.height = 'auto'; // Ripristina l'altezza predefinita
    nativeElement.style.height = nativeElement.scrollHeight + 'px'; // Imposta l'altezza in base allo scrollHeight
  }

  getRowCount(): number {
    // Calcola il numero di righe necessarie in base alla lunghezza del testo
    const lineCount = this.squealForm.value.text.split('\n').length;
    return Math.max(lineCount, 1); // Assicurati che ci sia sempre almeno una riga
  }

  createSqueal() {
    if (this.squealForm.valid) {
      this.getRecipients();
      console.log(this.recipients);
      // Invia il nuovo squeal al tuo backend o a un servizio API
      const squeal_content = this.squealForm.value.text;
      //console.log('Nuovo squeal:', squealText);
      this.squealService.postSqueal(squeal_content, this.recipients).subscribe(
        (response: any) => {
          console.log('Success:', response);
          this.squealSubmitted.emit(squeal_content);
          this.userService.setUserData(this.user);
          sessionStorage.getItem('user')
            ? sessionStorage.setItem('user', JSON.stringify(this.user))
            : localStorage.setItem('user', JSON.stringify(this.user));
          this.lastLength = 0;
          this.squealForm.reset();
          this.usersComponent.removeAllTags();
          this.channelsComponent.removeAllTags();
          this.keywordsComponent.removeAllTags();
        },
        (error) => {
          //TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
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
    } else {
      // Gestisci il caso in cui il form non sia valido
      console.log('Form non valido');
    }
  }

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
