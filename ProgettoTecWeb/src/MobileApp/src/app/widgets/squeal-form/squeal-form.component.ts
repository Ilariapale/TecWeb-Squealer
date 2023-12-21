import { Component, Output, Input, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { User } from 'src/app/models/user.interface';
import { ContentType, Recipients } from 'src/app/models/squeal.interface';
import { TagInputComponent } from '../tag-input/tag-input.component';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { Router } from '@angular/router';
import { MediaService } from 'src/app/services/api/media.service';
import { MapComponent } from '../map/map.component';
import { PositionService } from 'src/app/services/position.service';
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

  @ViewChild(MapComponent) mapComponent: MapComponent | undefined;

  @Output()
  squealSubmitted: EventEmitter<any> = new EventEmitter();
  @Input() user!: User;
  userFromSessionStorage!: User;

  extra_chars: number = 0;

  request_outcome: boolean = true;

  showSquealPostResponse: boolean = false;
  postResponse: string = '';
  private socket: any;

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
    public userService: UserService,
    private squealsService: SquealsService,
    private darkModeService: DarkModeService,
    private router: Router,
    private mediaService: MediaService,
    private positionService: PositionService
  ) {
    this.userFromSessionStorage = this.userService.getUserData();
    if (this.userFromSessionStorage.account_type == 'guest') {
      this.isGuest = true;
    } else {
      if (['standard', 'moderator', 'professional', 'verified'].includes(this.userFromSessionStorage.account_type)) {
        this.isGuest = false;
        this.char_left.daily = this.userFromSessionStorage?.char_quota?.daily ?? 0;
        this.char_left.weekly = this.userFromSessionStorage?.char_quota?.weekly ?? 0;
        this.char_left.monthly = this.userFromSessionStorage?.char_quota?.monthly ?? 0;
        this.char_left.extra_daily = this.userFromSessionStorage?.char_quota?.extra_daily ?? 0;
        this.extra_chars = this.char_left.extra_daily;
      }
    }
  }

  ngOnInit() {
    this.squealForm = this.formBuilder.group({
      text: ['', Validators.required],
    });
    if (this.user && this.user.char_quota) {
      this.isGuest = false;
      this.char_left.daily = this.user.char_quota.daily;
      this.char_left.weekly = this.user.char_quota.weekly;
      this.char_left.monthly = this.user.char_quota.monthly;
      this.char_left.extra_daily = this.user.char_quota.extra_daily;
    }
  }

  onInput(value?: number) {
    this.adjustTextareaHeight();
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

    if (value) {
      this.char_left.extra_daily =
        -difference > this.extra_chars ? this.extra_chars : this.char_left.extra_daily + difference;
    }
    this.char_left.extra_daily = Math.min(this.char_left.extra_daily, this.extra_chars);
    if (this.user.char_quota) {
      this.user.char_quota.daily = Math.max(this.char_left.daily, 0);
      this.user.char_quota.weekly = Math.max(this.char_left.weekly, 0);
      this.user.char_quota.monthly = Math.max(this.char_left.monthly, 0);
      this.user.char_quota.extra_daily = Math.max(Math.min(this.char_left.extra_daily, this.extra_chars), 0);
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
      const squeal_content = this.squealForm.value.text;
      const schedule_options = {
        tick_rate: this.getTickRate(),
        repeat: this.getRepeat(),
        scheduled_date: this.getDate(),
      };
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
          this.request_outcome = true;
          this.extra_chars = this.char_left.extra_daily;
        })
        .catch((error: any) => {
          console.log(error);
          this.postResponse = error.error.error;
          this.request_outcome = false;
          this.showSquealPostResponse = true;
          // TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
          const element = document.querySelector('.squeal-form-text');
          if (element) {
            element.classList.add('vibrating-error');
            setTimeout(() => {
              element.classList.remove('vibrating-error');
            }, 500);
          }
        });
    } else {
      console.log('Form non valido');
    }
  }
  createImageSqueal() {
    this.getRecipients();

    const imageInputElement = this.imageInput.nativeElement;

    if (imageInputElement.files && imageInputElement.files[0]) {
      this.mediaService.postImage(imageInputElement.files[0]).subscribe({
        next: (response: any) => {
          imageInputElement.value = null;

          const imageName = response.name;
          this.squealsService
            .postSqueal(imageName, this.recipients, this.selectedType)
            .then((response: any) => {
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
              this.extra_chars = this.char_left.extra_daily;
            })
            .catch((error: any) => {
              // TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
              const element = document.querySelector('.squeal-form-text');
              if (element) {
                element.classList.add('vibrating-error');
                setTimeout(() => {
                  element.classList.remove('vibrating-error');
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
    const videoInputElement = this.videoInput.nativeElement;
    if (videoInputElement.files && videoInputElement.files[0]) {
      this.mediaService.postVideo(videoInputElement.files[0]).subscribe({
        next: (response: any) => {
          videoInputElement.value = null;
          const imageName = response.name;
          this.squealsService
            .postSqueal(imageName, this.recipients, this.selectedType)
            .then((response: any) => {
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
              this.extra_chars = this.char_left.extra_daily;
            })
            .catch((error: any) => {
              // TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
              const element = document.querySelector('.squeal-form-text');
              if (element) {
                element.classList.add('vibrating-error');
                setTimeout(() => {
                  element.classList.remove('vibrating-error');
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
  createPositionSqueal() {
    const content = `${this.mapComponent?.userPosition[0]} ${this.mapComponent?.userPosition[1]}`;

    if (content != '0 0') {
      this.getRecipients();
      const schedule_options = {
        tick_rate: this.getTickRate(),
        repeat: this.getRepeat(),
        scheduled_date: this.getDate(),
      };
      this.squealsService
        .postSqueal(
          content,
          this.recipients,
          ContentType.position,
          this.is_scheduled,
          this.selectedDelayedSquealTypeValue,
          schedule_options
        )
        .then((response: any) => {
          this.userService.setUserData(this.user);
          sessionStorage.getItem('user')
            ? sessionStorage.setItem('user', JSON.stringify(this.user))
            : localStorage.setItem('user', JSON.stringify(this.user));
          this.lastLength = 0;
          this.squealForm.reset();
          this.usersComponent.removeAllTags();
          this.channelsComponent.removeAllTags();
          this.keywordsComponent.removeAllTags();
          this.postResponse = 'Position squeal posted successfully!';
          this.showSquealPostResponse = true;
          this.positionService.connectWebSocket(this.user._id || '');
          this.extra_chars = this.char_left.extra_daily;
        })
        .catch((error: any) => {
          // TODO quando l'errore è nei recipients o nel testo, mandare un altro tipo di errore
          const element = document.querySelector('.squeal-form-text');
          if (element) {
            element.classList.add('vibrating-error');
            setTimeout(() => {
              element.classList.remove('vibrating-error');
            }, 500);
          }
        });
    } else {
      // Gestisci il caso in cui il form non sia valido
      console.log('Form non valido');
    }
  }

  uploadImage(): string {
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;

    if (fileInput.files && fileInput.files[0]) {
      this.mediaService.postImage(fileInput.files[0]).subscribe({
        next: (response: any) => {
          //rimuovo il file dall'input per evitare che venga caricato più volte
          this.imageInput.nativeElement.value = '';
          this.imageInput.nativeElement.files = null;
          this.imageInput.nativeElement.files = undefined;
          const fl = new FileList();
          fileInput.files = fl;

          return response;
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
      this.onInput(charNeeded);

      if (file.size > maxSize * 1024) {
      }
    } else {
      this.onInput(-charNeeded);
    }
  }

  selectedDelayedSquealType() {
    this.selectedDelayedSquealTypeValue = this.delayedSquealType.nativeElement.value;
  }

  selectedTab(type: string) {
    this.showSquealPostResponse = false;
    this.selectedType = type as ContentType;
    //this.squealForm.value.text = '';
    if (this.selectedType != ContentType.text) {
      this.onInput();
    }
    if (this.selectedType != ContentType.image) {
      if (this.imageInput.nativeElement.value != '') {
        this.imageInput.nativeElement.value = '';
        this.onInput(-this.sizeAndCost.cost.image);
      }
    }
    if (this.selectedType != ContentType.video) {
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
    if (this.selectedType == ContentType.position && this.lastSelectedTab != 'position') {
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
