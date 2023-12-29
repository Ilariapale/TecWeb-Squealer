import {
  Component,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { TimeService } from 'src/app/services/time.service';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { User, AccountType, ProfessionalType } from 'src/app/models/user.interface';
import { Subscription, firstValueFrom } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { SquealsService } from 'src/app/services/api/squeals.service';
import { Squeal, ContentType } from 'src/app/models/squeal.interface';
import { MediaService } from 'src/app/services/api/media.service';
//TODO fixare quando si è in un altro profilo e si seleziona il proprio profilo
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('imageInput') imageInput!: ElementRef;

  MAX_SQUEALS = 5;
  lastSquealLoaded = -1;

  loading: boolean = false;

  identifier: string = '';

  mySelf: boolean = false;

  alreadyGotSMM: boolean = false;

  isMySMM: boolean = false;

  amVip: boolean = false;

  alreadyRequestedSMM: boolean = false;

  listenerSet: boolean = false;

  vipAccountRequested: boolean = false;
  smmAccountRequested: boolean = false;
  verifiedAccountRequested: boolean = false;
  standardAccountRequested: boolean = false;

  vipRequestSuccess: boolean = false;
  smmRequestSuccess: boolean = false;
  verifiedRequestSuccess: boolean = false;
  standardRequestSuccess: boolean = false;

  showAccountRequestError: boolean = false;
  accountRequestError: string = '';

  user: User = {
    _id: '0',
    profile_picture: '',
    account_type: AccountType.standard,
    professional_type: ProfessionalType.none,
    email: 'email@email.com',
    username: 'Username',
    profile_info: 'I am a boring person',
    created_at: new Date(),
    is_active: true,
    char_quota: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      extra_daily: 0,
    },
  };

  squeals: Squeal[] = [];

  subscription: Subscription[] = [];
  isGuest = false;
  bannerClass = '';
  squealToDelete = '';
  old_password = '';
  new_password = '';
  new_password_confirm = '';
  new_bio = '';
  new_pic = '';

  constructor(
    private route: ActivatedRoute,
    public timeService: TimeService,
    private usersService: UsersService,
    public userService: UserService,
    private squealsService: SquealsService,
    public darkModeService: DarkModeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private mediaService: MediaService
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) this.isGuest = true;
    else this.router.navigate(['/login']);
  }

  async ngOnInit() {
    if (!this.isGuest) {
      const params: ParamMap | undefined = await firstValueFrom(this.route.paramMap);
      this.identifier = params?.get('identifier') || '';

      if (this.identifier && !this.isGuest) {
        try {
          const user = await this.usersService.getUser(this.identifier);
          this.mySelf = this.userService.isMyself(user._id);
          this.amVip = this.userService.isVIP();
          this.loading = true;
          this.user = user;
          this.alreadyRequestedSMM = this.userService.alreadySentSMMRequest(user._id);
          this.alreadyGotSMM = this.userService.alreadyGotSMM();
          this.isMySMM = this.userService.isMySMM(user._id);
          this.lastSquealLoaded =
            user.squeals && user.squeals.posted && user.squeals.posted.length > 0 ? user.squeals.posted.length - 1 : -1;

          const squealsPromises = [];

          for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS && i >= 0; i--) {
            squealsPromises.push(this.squealsService.getSqueal(user.squeals.posted[i], this.isGuest));
          }

          const squeals = await Promise.all(squealsPromises);
          squeals.forEach((squeal) => {
            this.squeals.push(squeal[0]); // Add the new squeal at the beginning of the array
          });
          this.lastSquealLoaded -= this.MAX_SQUEALS;
          this.loading = false;
        } catch (error) {
          // Handle error
          console.log(error);
          this.loading = false;
        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  requestAccountChange(type: 'SMM' | 'VIP' | 'standard' | 'verified') {
    this.usersService
      .accountChangeRequest(type)
      .then((response) => {
        switch (type) {
          case 'SMM':
            this.smmAccountRequested = true;
            this.smmRequestSuccess = true;
            break;
          case 'VIP':
            this.vipAccountRequested = true;
            this.vipRequestSuccess = true;
            break;
          case 'standard':
            this.standardAccountRequested = true;
            this.standardRequestSuccess = true;
            break;
          case 'verified':
            this.verifiedAccountRequested = true;
            this.verifiedRequestSuccess = true;
            break;
          default:
            break;
        }
      })
      .catch((error) => {
        this.showAccountRequestError = true;
        this.accountRequestError = error.error.error;
        switch (type) {
          case 'SMM':
            this.smmAccountRequested = true;
            this.smmRequestSuccess = false;
            break;
          case 'VIP':
            this.vipAccountRequested = true;
            this.vipRequestSuccess = false;
            break;
          case 'standard':
            this.standardAccountRequested = true;
            this.standardRequestSuccess = false;
            break;
          case 'verified':
            this.verifiedAccountRequested = true;
            this.verifiedRequestSuccess = false;
            break;
          default:
            break;
        }
      });
  }

  ngAfterViewInit() {
    this.bannerClass = this.darkModeService.getBannerClass();
    this.cdr.detectChanges();
  }
  ngAfterViewChecked() {
    if (!this.listenerSet) {
      const exampleModal = document.getElementById('deleteConfirm') as HTMLElement;

      exampleModal?.addEventListener('show.bs.modal', (event: any) => {
        const button = event.relatedTarget;
        const squealId = button.getAttribute('data-bs-squealId');
        this.squealToDelete = squealId;
      });
      this.listenerSet = true;
    }
  }

  loadMoreSqueals() {
    this.loading = true;
    const squealsRequests = [];
    for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS; i--) {
      const squeal_id = this.user?.squeals?.posted?.[i];
      if (squeal_id) squealsRequests.push(this.squealsService.getSqueal(squeal_id, this.isGuest));
    }
    this.lastSquealLoaded -= this.MAX_SQUEALS;

    Promise.all(squealsRequests).then((squeals) => {
      squeals.forEach((squeal) => {
        this.squeals.push(squeal[0]);
      });
    });

    this.loading = false;
  }

  deleteSqueal() {
    if (this.squealToDelete != '') {
      this.squealsService
        .deleteSqueal(this.squealToDelete)
        .then((response: any) => {
          const squeal = this.squeals.find((squeal) => squeal._id == this.squealToDelete);
          squeal ? (squeal.content_type = ContentType.deleted) : null;
          squeal ? (squeal.content = '[deleted squeal]') : null;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }
  goToPage(page: string) {
    this.router.navigate([page]);
  }

  onDestroy() {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }

  sendUpdate() {
    const imageInputElement = this.imageInput.nativeElement;
    if (!imageInputElement.files || !imageInputElement.files[0]) {
      this.updateProfileData();
      return;
    }
    this.updateImageFirst(imageInputElement.files[0]);
  }

  updateProfileData(image?: string) {
    if (this.new_password != '' && this.new_password_confirm != '' && this.new_password === this.new_password_confirm) {
      this.usersService
        .updatePassword(this.identifier, this.old_password, this.new_password)
        .then((response) => {})
        .catch((error) => {
          console.log(error);
        });
    }
    if (this.new_bio != '' || image) {
      let body: any = {};
      if (this.new_bio != '') body['profile_info'] = this.new_bio;
      if (image != '') body['profile_picture'] = image;
      this.usersService
        .updateProfile(this.identifier, body)
        .then((response) => {})
        .catch((error) => {
          console.log(error);
        });
    }
  }

  sendRequestSMM(action: 'withdraw' | 'send') {
    this.usersService
      .sendSMMRequest(this.user._id as string, action)
      .then((response) => {
        this.alreadyRequestedSMM = action === 'send';
      })
      .catch((error) => {
        console.log(error);
      });
  }

  fireSMM() {
    this.usersService
      .fireSMMRequest()
      .then((response) => {
        this.alreadyGotSMM = false;
        this.isMySMM = false;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  updateImageFirst(image: any) {
    this.mediaService.loadPropic(image).subscribe({
      next: (response) => {
        this.updateProfileData(response.name);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
