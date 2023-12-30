// messages.component.ts
import { Component } from '@angular/core';
import { ChatPreview } from 'src/app/models/chat.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
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
  newChatUsername: string = '';
  chatsPreview: ChatPreview[] = [];

  isGuest: boolean = true;

  constructor(
    private usersService: UsersService,
    private userService: UserService,
    private chatsService: ChatsService,
    private darkModeService: DarkModeService,
    public timeService: TimeService,
    private router: Router
  ) {
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    } // Ask the server for the notifications with the specified ids
    const userData = this.userService.getUserData();
    if (userData.account_type === 'guest') {
      this.isGuest = true;
    } else {
      this.isGuest = false;
      this.chatsService.getChats().then((chats: any[]) => {
        this.chatsPreview = chats;
        this.chatsPreview.sort((a, b) => {
          if (a.last_modified > b.last_modified) return -1;
          if (a.last_modified < b.last_modified) return 1;
          return 0;
        });
        for (let i = 0; i < this.chatsPreview.length; i++) {
          this.chatsPreview[i].last_modified = new Date(this.chatsPreview[i].last_modified);
        }
      });
    }
  }

  newChat() {
    if (this.newChatUsername.trim() !== '') {
      //if the chat with this user already exists, open it
      const chatIndex = this.chatsPreview.findIndex((chat) => chat.recipient === this.newChatUsername);
      if (chatIndex !== -1) {
        const chat = this.chatsPreview[chatIndex];
        this.router.navigate(['/private-chats/user', chat._id, this.newChatUsername]);
        this.newChatUsername = '';
      } else {
        this.usersService
          .getUsername(this.newChatUsername)
          .then((response: any) => {
            this.router.navigate(['/private-chats/user', this.newChatUsername]);
          })
          .catch((error: any) => {
            console.log(error);
            this.newChatUsername = '';
          });
      }
    }
  }

  getDarkMode() {
    return this.darkModeService.getThemeClass();
  }

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
