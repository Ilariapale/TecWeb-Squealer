import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TimeService } from 'src/app/services/time.service';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { User, AccountType, ProfessionalType } from 'src/app/models/user.interface';
import { Subscription, last, forkJoin } from 'rxjs';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { SquealsService } from 'src/app/services/api/squeals.service';
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
    private route: ActivatedRoute,
    public timeService: TimeService,
    private usersService: UsersService,
    private userService: UserService,
    private squealsService: SquealsService,
    public darkModeService: DarkModeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    //PER PRENDERE I PARAMETRI DALL'URL
    //this.route.paramMap.subscribe((params) => {
    //  this.recipient = params.get('recipient') || params.get('user') || '0';
    //  this.chatId = params.get('id') || '0';
    //});

    //PER EVITARE DI DOVER LOGGARE PER VEDERE LA PAGINA
    //if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization'))
    //  this.isGuest = !localStorage.getItem('Authorization') && !sessionStorage.getItem('Authorization');
    //else {
    //  this.router.navigate(['/login']);
    //}
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
