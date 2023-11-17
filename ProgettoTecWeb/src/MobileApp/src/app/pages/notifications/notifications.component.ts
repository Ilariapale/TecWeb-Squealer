// notifications.component.ts

import { Component } from '@angular/core';
import { Notification } from 'src/app/models/notification.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  notifications: Notification[] = [
    {
      _id: '1313',
      is_unseen: true,
      created_at: 'String1',
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
      created_at: 'String2',
      content: 'String2',
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
      created_at: 'String3',
      content: 'String3',
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
      created_at: 'String4',
      content: 'String4',
      squeal_ref: 'String',
      channel_ref: 'String',
      comment_ref: 'String',
      user_ref: 'String',
      reply: true,
      source: Source.squeal,
    },
  ];
  isHovered: boolean = false;
  isGuest: boolean = true;
  constructor(private usersService: UsersService, private userService: UserService) {
    //ottieni l'array degli id delle notifiche
    this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.usersService.getNotifications().subscribe((notifications) => {
          this.notifications = [...notifications].reverse();
        });
      }
    });
    //richiedi al server le notifiche con gli id specificati
  }

  onInit() {
    //ottieni l'array degli id delle notifiche
    this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        //TODO fix hereeeee
        console.log(userData.notifications);
        this.usersService.getNotifications().subscribe((notifications) => {
          this.notifications = [...notifications].reverse();
        });
      }
    });
    //richiedi al server le notifiche con gli id specificati
  }

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
}
