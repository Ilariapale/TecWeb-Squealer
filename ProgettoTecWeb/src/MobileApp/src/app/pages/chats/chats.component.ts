// messages.component.ts
//TODO implementare la richiesta al server
import { Component } from '@angular/core';
import { Message, Chat, ChatPreview } from 'src/app/models/chat.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';
import { ChatsService } from 'src/app/services/api/chats.service';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css'],
})
export class ChatsComponent {
  chatsPreview: ChatPreview[] = [
    {
      last_message: 'Ciao',
      recipient: 'paulpaccy',
      sent_by_me: true,
      _id: '123',
      last_modified: new Date('2023-10-23T15:20:06.470Z'),
    },
  ];

  isGuest: boolean = true;

  constructor(
    private usersService: UsersService,
    private userService: UserService,
    private chatsService: ChatsService,
    private darkModeService: DarkModeService,
    public timeService: TimeService,
    private router: Router
  ) {
    this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.chatsService.getChats().subscribe((chats) => {
          this.chatsPreview = chats;
          for (let i = 0; i < this.chatsPreview.length; i++) {
            this.chatsPreview[i].last_modified = new Date(this.chatsPreview[i].last_modified);
          }
        });
      }
    });
  }
  //TODO finire implementazione di messages
  onInit() {}

  markAllAsRead(/*_ids: string[]*/) {}
  markAsRead(_id: string) {}

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }
}

/*
[routerLink]="['/private-chat']" [queryParams]="{id: chat._id}"
*/
