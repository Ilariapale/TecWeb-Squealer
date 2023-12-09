import { Component, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { User } from 'src/app/models/user.interface';
import { ContentType, Recipients } from 'src/app/models/squeal.interface';
import { TagInputComponent } from '../tag-input/tag-input.component';
import { firstValueFrom } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { Router } from '@angular/router';
import { MediaService } from 'src/app/services/api/media.service';
import { View } from 'ol';
import { response } from 'express';
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

  @ViewChild('imageInput') imageInput!: ElementRef;
  @ViewChild('videoInput') videoInput!: ElementRef;

  @ViewChild('delayedSquealType') delayedSquealType!: ElementRef;
  @ViewChild('delayedSquealsTab') delayedSquealsTab!: ElementRef;

  @Output()
  squealSubmitted: EventEmitter<any> = new EventEmitter();
  @Input() user!: User;

  showSquealPostResponse: boolean = false;
  postResponse: string = '';

  recipients: Recipients = {
    users: [],
    channels: [],
    keywords: [],
  };

  sizeAndCost: {
    cost: {
      image: number;
      video: number;
      position: number;
    };
    size: {
      image: number;
      video: number;
      position: number;
    };
  } = {
    cost: {
      image: 125,
      video: 300,
      position: 150,
    },
    size: {
      image: 16,
      video: 20,
      position: 0,
    },
  };

  selectedDelayedSquealTypeValue: string = 'postPeriodicallyForLimitedTimes';
  dateNow: string = new Date().toISOString();
  selectedType: ContentType = ContentType.text;
  lastSelectedTab: string = 'text';
  is_scheduled: boolean = false;

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
    private squealsService: SquealsService,
    private darkModeService: DarkModeService,
    private router: Router,
    private mediaService: MediaService
  ) {
    firstValueFrom(this.userService.getUserData()).then((userData) => {
      this.user = userData;
      if (userData.account_type == 'guest') {
        this.isGuest = true;
      } else {
        if (['standard', 'moderator', 'professional', 'verified'].includes(userData.account_type)) {
          this.isGuest = false;
          this.char_left.daily = this.user?.char_quota?.daily ?? 0;
          this.char_left.weekly = this.user?.char_quota?.weekly ?? 0;
          this.char_left.monthly = this.user?.char_quota?.monthly ?? 0;
          this.char_left.extra_daily = this.user?.char_quota?.extra_daily ?? 0;
        }
      }
    });
  }

  ngOnInit() {
    this.squealForm = this.formBuilder.group({
      text: ['', Validators.required],
    });
  }

  onInput(value?: number) {
    this.adjustTextareaHeight();
    //TODO quando hai 0 caratteri in uno dei campi, non puoi più scrivere

    const currentLength = this.squealForm.value.text?.length ?? 0;
    const previousLength = this.lastLength;

    // Calculate the difference between the current length and the previous length
    const difference: number = value ? value : currentLength - previousLength;

    this.lastLength = currentLength; // Update the previous length

    // Update the quota based on the difference
    this.char_left.daily -= difference;
    this.char_left.weekly -= difference;
    this.char_left.monthly -= difference;

    if (
      ((this.char_left.daily < 0 || this.char_left.weekly < 0 || this.char_left.monthly < 0) && difference >= 0) ||
      ((this.char_left.daily <= 0 || this.char_left.weekly <= 0 || this.char_left.monthly <= 0) && difference <= 0)
    ) {
      this.char_left.extra_daily -= difference;
      if (this.char_left.extra_daily < 0) {
        this.enoughChars = false;
      } else {
        this.enoughChars = true;
      }
    } else {
      this.enoughChars = true;
    }

    if (this.user.char_quota) {
      this.user.char_quota.daily = Math.max(this.char_left.daily, 0);
      this.user.char_quota.weekly = Math.max(this.char_left.weekly, 0);
      this.user.char_quota.monthly = Math.max(this.char_left.monthly, 0);
      this.user.char_quota.extra_daily = Math.max(this.char_left.extra_daily, 0);
    }
  }

  getRecipients() {
    this.recipients.users = this.usersComponent.getTags();
    this.recipients.channels = this.channelsComponent.getTags();
    this.recipients.keywords = this.keywordsComponent.getTags();
  }

  adjustTextareaHeight() {
    const nativeElement = this.textarea.nativeElement;
    if (nativeElement != undefined && nativeElement.textContent != '') {
      nativeElement.style.height = 'auto'; // Restore default height
      nativeElement.style.height = `${nativeElement.scrollHeight}px`; // Set height based on scrollHeight
    }
  }

  getRowCount(): number {
    // Calculate the number of rows needed based on the text length
    const lineCount = this.squealForm.value.text.split('\n').length;
    return Math.max(lineCount, 1); // Make sure there is always at least one row
  }

  createSqueal() {
    switch (this.selectedType) {
      case ContentType.text:
        this.createTextSqueal();
        break;
      case ContentType.image:
        this.createImageSqueal();
        break;
      case ContentType.video:
        this.createVideoSqueal();
        break;
      case ContentType.position:
        this.createPositionSqueal();
        break;
    }
  }

  getTickRate() {
    const tick_value = (document.getElementById('tick') as HTMLInputElement)?.value;
    const rate_value = (document.getElementById('rate') as HTMLInputElement)?.value;
    return tick_value && rate_value ? `${tick_value} ${rate_value}` : null;
  }

  getRepeat() {
    const value = (document.getElementById('repeat') as HTMLInputElement)?.value;
    return value ? parseInt(value) : null;
  }

  getDate() {
    return (document.getElementById('date') as HTMLInputElement)?.value;
  }

  toggleScheduled() {
    this.is_scheduled = !document.getElementById('delayedSquealsTab')?.classList.contains('collapsed');
  }

  createTextSqueal() {
    if (this.squealForm.valid) {
      this.getRecipients();
      //console.log(this.recipients);
      // Invia il nuovo squeal al tuo backend o a un servizio API
      const squeal_content = this.squealForm.value.text;
      //console.log('Nuovo squeal:', squealText);
      console.log('is_scheduled = ', this.is_scheduled);
      console.log('this.selectedDelayedSquealTypeValue = ', this.selectedDelayedSquealTypeValue);
      const schedule_options = {
        tick_rate: this.getTickRate(),
        repeat: this.getRepeat(),
        scheduled_date: this.getDate(),
      };
      console.log(schedule_options, this.is_scheduled, this.selectedDelayedSquealTypeValue, schedule_options);
      this.squealsService
        .postSqueal(
          squeal_content,
          this.recipients,
          ContentType.text,
          this.is_scheduled,
          this.selectedDelayedSquealTypeValue,
          schedule_options
        )
        .then((response: any) => {
          console.log('Success:', response);
          //this.squealSubmitted.emit(response);
          this.userService.setUserData(this.user);
          sessionStorage.getItem('user')
            ? sessionStorage.setItem('user', JSON.stringify(this.user))
            : localStorage.setItem('user', JSON.stringify(this.user));
          this.lastLength = 0;
          this.squealForm.reset();
          this.usersComponent.removeAllTags();
          this.channelsComponent.removeAllTags();
          this.keywordsComponent.removeAllTags();
          this.postResponse = 'Text squeal posted successfully!';
          this.showSquealPostResponse = true;
        })
        .catch((error: any) => {
          // TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
          // Gestisci il caso in cui il form non sia valido
          const element = document.querySelector('.squeal-form-text'); // Selettore dell'elemento di testo, assicurati di aggiungere una classe appropriata all'elemento di testo nel tuo template
          if (element) {
            console.log(element);
            element.classList.add('vibrating-error'); // Aggiungi la classe di vibrante errore
            setTimeout(() => {
              element.classList.remove('vibrating-error'); // Rimuovi la classe dopo 0.5 secondi
            }, 500);
          }
        });
    } else {
      // Gestisci il caso in cui il form non sia valido
      console.log('Form non valido');
    }
  }
  createImageSqueal() {
    this.getRecipients();
    //console.log(this.recipients);

    const imageInputElement = this.imageInput.nativeElement;

    if (imageInputElement.files && imageInputElement.files[0]) {
      this.mediaService.postImage(imageInputElement.files[0]).subscribe({
        next: (response: any) => {
          imageInputElement.value = null;

          const imageName = response.name;
          //TODO
          console.log('Nuovo squeal:', imageName);
          this.squealsService
            .postSqueal(imageName, this.recipients, this.selectedType)
            .then((response: any) => {
              console.log('Success:', response);
              //this.squealSubmitted.emit(response);
              this.userService.setUserData(this.user);
              sessionStorage.getItem('user')
                ? sessionStorage.setItem('user', JSON.stringify(this.user))
                : localStorage.setItem('user', JSON.stringify(this.user));
              this.lastLength = 0;
              this.squealForm.reset();
              this.usersComponent.removeAllTags();
              this.channelsComponent.removeAllTags();
              this.keywordsComponent.removeAllTags();
              this.postResponse = 'Image squeal posted successfully!';
              this.showSquealPostResponse = true;
            })
            .catch((error: any) => {
              // TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
              // Gestisci il caso in cui il form non sia valido
              const element = document.querySelector('.squeal-form-text'); // Selettore dell'elemento di testo, assicurati di aggiungere una classe appropriata all'elemento di testo nel tuo template
              if (element) {
                console.log(element);
                element.classList.add('vibrating-error'); // Aggiungi la classe di vibrante errore
                setTimeout(() => {
                  element.classList.remove('vibrating-error'); // Rimuovi la classe dopo 0.5 secondi
                }, 500);
              }
            });
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      console.log('No file selected');
    }
    //Mando l'immagine al server e aspetto che mi restituisca il nome del file
  }
  createVideoSqueal() {
    this.getRecipients();
    //console.log(this.recipients);

    const videoInputElement = this.videoInput.nativeElement;
    if (videoInputElement.files && videoInputElement.files[0]) {
      this.mediaService.postVideo(videoInputElement.files[0]).subscribe({
        next: (response: any) => {
          console.log(response);
          videoInputElement.value = null;
          const imageName = response.name;
          console.log('Nuovo squeal:', imageName);
          this.squealsService
            .postSqueal(imageName, this.recipients, this.selectedType)
            .then((response: any) => {
              console.log('Success:', response);
              //this.squealSubmitted.emit(response);
              this.userService.setUserData(this.user);
              sessionStorage.getItem('user')
                ? sessionStorage.setItem('user', JSON.stringify(this.user))
                : localStorage.setItem('user', JSON.stringify(this.user));
              this.lastLength = 0;
              this.squealForm.reset();
              this.usersComponent.removeAllTags();
              this.channelsComponent.removeAllTags();
              this.keywordsComponent.removeAllTags();
              this.postResponse = 'Video squeal posted successfully!';
              this.showSquealPostResponse = true;
            })
            .catch((error: any) => {
              // TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
              // Gestisci il caso in cui il form non sia valido
              const element = document.querySelector('.squeal-form-text'); // Selettore dell'elemento di testo, assicurati di aggiungere una classe appropriata all'elemento di testo nel tuo template
              if (element) {
                console.log(element);
                element.classList.add('vibrating-error'); // Aggiungi la classe di vibrante errore
                setTimeout(() => {
                  element.classList.remove('vibrating-error'); // Rimuovi la classe dopo 0.5 secondi
                }, 500);
              }
            });
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      console.log('No file selected');
    }
    //Mando l'immagine al server e aspetto che mi restituisca il nome del file
  }
  createPositionSqueal() {}

  uploadImage(): string {
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      this.mediaService.postImage(fileInput.files[0]).subscribe({
        next: (response: any) => {
          console.log(response);
          //rimuovo il file dall'input per evitare che venga caricato più volte

          this.imageInput.nativeElement.value = '';
          this.imageInput.nativeElement.files = null;
          this.imageInput.nativeElement.files = undefined;
          const fl = new FileList();
          fileInput.files = fl;

          return response;
          //TODO
        },
        error: (error) => {
          console.log(error);
          return '';
        },
      });
    } else {
      return '';
    }
    return '';
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const type: string = event.target.accept;
    let charNeeded: number;
    let maxSize: number;
    switch (type) {
      case 'image/*':
        charNeeded = this.sizeAndCost.cost.image;
        maxSize = this.sizeAndCost.size.image;
        break;
      case 'video/*':
        charNeeded = this.sizeAndCost.cost.video;
        maxSize = this.sizeAndCost.size.video;
        break;
      default:
        console.log('Error: wrong type');
        return;
    }
    if (file) {
      //ha appena selezionato un file
      this.onInput(charNeeded);

      if (file.size > maxSize * 1024) {
        // TODO: Handle file size error
        console.log(
          'File is ',
          file.size / 1024,
          ' * 1024 = ',
          file.size,
          ' bytes, but max size is ',
          maxSize,
          ' * 1024 = ',
          maxSize * 1024,
          ' bytes'
        );
      }
    } else {
      //ha appena deselezionato il file
      this.onInput(-charNeeded);
    }
  }

  selectedDelayedSquealType() {
    this.selectedDelayedSquealTypeValue = this.delayedSquealType.nativeElement.value;
  }

  selectedTab(type: string) {
    this.showSquealPostResponse = false;
    this.selectedType = type as ContentType;
    if (this.selectedType != ContentType.text) {
      this.squealForm.value.text = '';
      this.onInput();
    }
    if (this.selectedType != ContentType.image) {
      //remove the image from the input
      //const fileInput = document.getElementById('imageInput') as HTMLInputElement;
      //if (fileInput.value != '') {
      //  fileInput.value = '';
      //  this.onInput(-this.sizeAndCost.cost.image);
      //}

      if (this.imageInput.nativeElement.value != '') {
        this.imageInput.nativeElement.value = '';
        this.onInput(-this.sizeAndCost.cost.image);
      }
    }
    if (this.selectedType != ContentType.video) {
      //remove the video from the input
      //const fileInput = document.getElementById('videoInput') as HTMLInputElement;
      //if (fileInput.value != '') {
      //  fileInput.value = '';
      //  this.onInput(-this.sizeAndCost.cost.video);
      //}
      if (this.videoInput.nativeElement.value != '') {
        this.videoInput.nativeElement.value = '';
        this.onInput(-this.sizeAndCost.cost.video);
      }
    }
    if (this.selectedType != ContentType.position) {
      if (this.lastSelectedTab == 'position') {
        this.onInput(-this.sizeAndCost.cost.position);
      }
    }
    if (this.selectedType == ContentType.position) {
      this.onInput(this.sizeAndCost.cost.position);
    }
    this.lastSelectedTab = type;
  }

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }
}
