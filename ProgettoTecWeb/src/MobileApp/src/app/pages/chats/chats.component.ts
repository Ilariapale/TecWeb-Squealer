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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css'],
})
export class ChatsComponent {
  private chatSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  newChatUsername: string = '';
  chatsPreview: ChatPreview[] = [
    /* {
      last_message: '3-Loading...',
      recipient: '2-Loading...',
      sent_by_me: false,
      _id: '123',
      last_modified: new Date(),
    },*/
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
    if (localStorage.getItem('Authorization') || sessionStorage.getItem('Authorization')) this.isGuest = false;
    else if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      this.isGuest = true;
    } else {
      this.router.navigate(['/login']);
    } //richiedi al server le notifiche con gli id specificati
    this.userSubscription = this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.chatSubscription = this.chatsService.getChats().subscribe((chats) => {
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
    });
  }
  //TODO finire implementazione di messages
  onInit() {}

  markAllAsRead(/*_ids: string[]*/) {}
  markAsRead(_id: string) {}

  newChat() {
    if (this.newChatUsername.trim() !== '') {
      //if the chat with this user already exists, open it
      const chatIndex = this.chatsPreview.findIndex((chat) => chat.recipient === this.newChatUsername);
      if (chatIndex !== -1) {
        const chat = this.chatsPreview[chatIndex];
        this.router.navigate(['/private-chats/user', chat._id, this.newChatUsername]);
        this.newChatUsername = '';
      } else {
        this.usersService.getUsername(this.newChatUsername).subscribe({
          next: (response: any) => {
            //user does not exist
            this.router.navigate(['/private-chats/user', this.newChatUsername]);
            console.log('user exists');
          },
          error: (error) => {
            console.log('user does not exist');
            this.newChatUsername = '';
          },
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

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.chatSubscription.unsubscribe();
  }
}

/*
[routerLink]="['/private-chat']" [queryParams]="{id: chat._id}"
*/
