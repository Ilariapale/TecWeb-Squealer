// notifications.component.ts

import { Component, OnInit } from '@angular/core';
import { Notification, IdCode } from 'src/app/models/notification.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  private notificationSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  notifications: Notification[] = [];
  isHovered: boolean = false;
  isGuest: boolean = true;
  constructor(
    private usersService: UsersService,
    private userService: UserService,
    private darkModeService: DarkModeService,
    public timeService: TimeService,
    private router: Router
  ) {
    //ottieni l'array degli id delle notifiche
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    } //richiedi al server le notifiche con gli id specificati
  }

  ngOnInit() {
    const userData = this.userService.getUserData();
    if (userData.account_type === 'guest') {
      this.isGuest = true;
    } else {
      this.isGuest = false;
      this.usersService.getNotifications().then((notifications) => {
        this.notifications = [...notifications].reverse();
      });
    }
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }
  markAllAsRead() {
    const notificationIds = this.notifications.map((notif) => notif._id).filter((id) => id !== undefined) as string[];
    this.usersService
      .setNotificationStatus(notificationIds, false)
      .then(() => {})
      .catch((err) => {});
    this.notifications.forEach((notif) => (notif.is_unseen = false));
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }

  getColor(source: Source) {
    if (source == Source.squeal) {
      return '#198754';
    } else if (source == Source.channel) {
      return '#ffc107';
    } else if (source == Source.system) {
      return '#dc3545';
    } else {
      return '#007aff';
    }
  }

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }

  notificationLink(notif: Notification) {
    //setta la notifica come letta
    console.log(notif);
    if (notif._id && notif.is_unseen) {
      this.usersService
        .setNotificationStatus([notif._id], false)
        .then(() => {})
        .catch((err) => {});
    }
    switch (notif.id_code) {
      case IdCode.welcomeSqueal:
      case IdCode.mentionedInSqueal:
      case IdCode.newComment:
      case IdCode.officialStatusUpdate:
        this.router.navigate([`squeal/${notif.squeal_ref}`]);
        break;
      case IdCode.newOwner:
        //this.router.navigate([`channel/${notif.channel_ref}`]);
        console.log(`channel/${notif.channel_ref}`);
        break;
      case IdCode.SMMaccepted:
        this.router.navigate([`profile/${notif.sender_ref}`]);
        break;
      case IdCode.banStatusUpdate:
      case IdCode.accountUpdate:
        this.router.navigate([`profile/${notif.user_ref}`]);
        break;
      case IdCode.SMMrequest:
        //this.router.navigate([`SMM/${notif.sender_ref}`]);
        console.log(`SMM/${notif.sender_ref}`);
        break;
      default:
        //case IdCode.SMMdeclined, IdCode.noMoreVipSMM, IdCode.noMoreSmmVIP
        break;
    }
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.notificationSubscription.unsubscribe();
  }
}
