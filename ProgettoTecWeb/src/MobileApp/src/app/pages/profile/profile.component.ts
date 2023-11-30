import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TimeService } from 'src/app/services/time.service';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { User, AccountType, ProfessionalType } from 'src/app/models/user.interface';
import { Subscription, last, forkJoin } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { SquealService } from 'src/app/services/api/squeals.service';
import { Squeal } from 'src/app/models/squeal.interface';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements AfterViewInit {
  MAX_SQUEALS = 5;
  lastSquealLoaded = -1;

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

  userSubscription: Subscription = new Subscription();
  usersSubscription: Subscription = new Subscription();
  isGuest = true;
  bannerClass = '';

  constructor(
    public timeService: TimeService,
    private usersService: UsersService,
    private userService: UserService,
    private squealsService: SquealService,
    public darkModeService: DarkModeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization'))
      this.isGuest = !localStorage.getItem('Authorization') && !sessionStorage.getItem('Authorization');
    else {
      this.router.navigate(['/login']);
    }
    this.userSubscription = this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.usersSubscription = this.usersService.getUser(userData.username).subscribe((user) => {
          this.user = user;
          this.lastSquealLoaded = user.squeals.posted.length > 0 ? user.squeals.posted.length - 1 : 0;
          const squealsRequests = [];
          for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS; i--) {
            squealsRequests.push(this.squealsService.getSqueal(user.squeals.posted[i]));
          }
          this.lastSquealLoaded -= this.MAX_SQUEALS;
          forkJoin(squealsRequests).subscribe((squeals) => {
            squeals.forEach((squeal) => {
              this.squeals.push(squeal[0]);
            });
          });
        });
      }
    });

    this.bannerClass = this.darkModeService.getBannerClass();
  }
  ngOnInit() {
    console.log('init');
    console.log(this.squeals);
  }

  ngAfterViewInit() {
    this.bannerClass = this.darkModeService.getBannerClass();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.usersSubscription.unsubscribe();
  }

  loadMoreSqueals() {
    const squealsRequests = [];
    for (let i = this.lastSquealLoaded; i > this.lastSquealLoaded - this.MAX_SQUEALS; i--) {
      const squeal_id = this.user?.squeals?.posted?.[i];
      if (squeal_id) squealsRequests.push(this.squealsService.getSqueal(squeal_id));
    }
    this.lastSquealLoaded -= this.MAX_SQUEALS;
    forkJoin(squealsRequests).subscribe((squeals) => {
      squeals.forEach((squeal) => {
        this.squeals.push(squeal[0]);
      });
    });
  }
}

/*
  account_type: { type: String, enum: ["standard", "verified", "professional", "moderator"], default: "standard" },
  professional_type: { type: String, enum: ["none", "VIP", "SMM"], default: "none" },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: new Date("1970-01-01T00:00:00Z") },
  squeals: {
    posted: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    scheduled: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    mentioned_in: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
    reacted_to: { type: [{ type: mongoose.Types.ObjectId, ref: "Squeal" }], default: [] },
  },
  char_quota: {
    daily: { type: Number, default: 100 },
    weekly: { type: Number, default: 500 },
    monthly: { type: Number, default: 1500 },
    extra_daily: { type: Number, default: 20 },
  },
  weekly_reaction_metrics: {
    positive_squeals: { type: Number, default: 0 },
    negative_squeals: { type: Number, default: 0 },
    controversial_squeals: { type: Number, default: 0 },
  },
  direct_chats: {
    type: [{ type: mongoose.Types.ObjectId, ref: "Chat" }],
    default: [],
  },
  subscribed_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  owned_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  editor_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  profile_info: { type: String, default: "Hi there! I'm using Squealer, my new favourite social network!" },
  profile_picture: { type: String, default: "" },
  smm: { type: mongoose.Types.ObjectId, ref: "User" },
  managed_accounts: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] },
  pending_requests: {
    SMM_requests: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] }, //SMM FIELD: requests recieved from VIPs
    VIP_requests: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], default: [] }, //VIP FIELD: requests sent to SMMs
  },
  preferences: {
    muted_channels: { type: [{ type: mongoose.Types.ObjectId, ref: "Channel" }], default: [] },
  },
  notifications: {
    type: [{ type: mongoose.Types.ObjectId, ref: "Notification" }],
    default: [],
  },
  is_active: { type: Boolean, default: true },
*/
