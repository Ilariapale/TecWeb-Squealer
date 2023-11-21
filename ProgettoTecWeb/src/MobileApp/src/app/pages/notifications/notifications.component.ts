// notifications.component.ts

import { Component } from '@angular/core';
import { Notification } from 'src/app/models/notification.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  private notificationSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  notifications: Notification[] = [
    {
      _id: '1313',
      is_unseen: true,
      created_at: new Date(),
      content: 'String1',
      squeal_ref: 'String',
      channel_ref: 'String',
      comment_ref: 'String',
      user_ref: 'String',
      reply: true,
      source: Source.squeal,
    },
    {
      _id: '1313',
      is_unseen: true,
      created_at: new Date(),
      content: 'String2',
      squeal_ref: 'String',
      channel_ref: 'String',
      comment_ref: 'String',
      user_ref: 'String',
      reply: true,
      source: Source.channel,
    },
    {
      _id: '1313',
      is_unseen: true,
      created_at: new Date(),
      content: 'String3',
      squeal_ref: 'String',
      channel_ref: 'String',
      comment_ref: 'String',
      user_ref: 'String',
      reply: true,
      source: Source.system,
    },
    {
      _id: '1313',
      is_unseen: true,
      created_at: new Date(),
      content: 'String4',
      squeal_ref: 'String',
      channel_ref: 'String',
      comment_ref: 'String',
      user_ref: 'String',
      reply: true,
      source: Source.user,
    },
  ];
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
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization'))
      this.isGuest = !localStorage.getItem('Authorization') && !sessionStorage.getItem('Authorization');
    else {
      this.router.navigate(['/login']);
    }
    //richiedi al server le notifiche con gli id specificati
    this.userSubscription = this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.notificationSubscription = this.usersService.getNotifications().subscribe((notifications) => {
          this.notifications = [...notifications].reverse();
        });
      }
    });
  }

  onInit() {}

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }
  markAllAsRead() {
    this.notifications.forEach((notification) => {
      //notification.read = true;
    });
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

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.notificationSubscription.unsubscribe();
  }
}
