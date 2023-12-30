// notifications.component.ts

import { Component, OnInit } from '@angular/core';
import { Notification, IdCode } from 'src/app/models/notification.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [
    {
      _id: '123',
      user_ref: '123',
      sender_ref: '123',
      squeal_ref: '123',
      channel_ref: '123',
      id_code: IdCode.welcomeSqueal,
      is_unseen: true,
      created_at: new Date(),
      source: Source.squeal,
      content: 'content',
      reply: false,
    },
  ];
  isHovered: boolean = false;
  loading: boolean = false;
  isGuest: boolean = true;
  pageSize = 8;
  loadMoreButton: boolean = true;
  constructor(
    private usersService: UsersService,
    private userService: UserService,
    private darkModeService: DarkModeService,
    public timeService: TimeService,
    private router: Router
  ) {
    // Get the notifications ids array
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    const userData = this.userService.getUserData();
    if (userData.account_type === 'guest') {
      this.isGuest = true;
    } else {
      this.isGuest = false;
      this.usersService.getNotifications(this.pageSize).then((notifications) => {
        this.notifications = notifications;
        if (notifications.length < this.pageSize) this.loadMoreButton = false;
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
      .catch((err) => {
        console.log(err);
      });
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

  loadMoreSqueals() {
    this.loading = true;
    this.usersService
      .getNotifications(this.pageSize, this.notifications[this.notifications.length - 1]._id)
      .then((notifications) => {
        if (notifications.length < this.pageSize) this.loadMoreButton = false;
        this.notifications.push(...notifications);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  notificationLink(notif: Notification) {
    // Set the notification as read
    if (notif._id && notif.is_unseen) {
      this.usersService
        .setNotificationStatus([notif._id], false)
        .then(() => {})
        .catch((err) => {});
    }
    switch (notif.id_code) {
      case IdCode.welcomeSqueal:
      case IdCode.mentionedInSqueal:
      case IdCode.officialStatusUpdate:
      case IdCode.newComment:
        this.router.navigate([`squeal/${notif.squeal_ref}`]);
        break;
      case IdCode.newOwner:
      case IdCode.newEditor:
        this.router.navigate([`channel/${notif.channel_ref}`]);
        break;
      case IdCode.SMMaccepted:
        this.router.navigate([`profile/${notif.sender_ref}`]);
        break;
      case IdCode.banStatusUpdate:
      case IdCode.accountUpdate:
        this.router.navigate([`profile/${notif.user_ref}`]);
        break;
      default:
        break;
    }
  }
}
