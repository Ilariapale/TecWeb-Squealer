// messages.component.ts
//TODO implementare la richiesta al server
import { Component } from '@angular/core';
import { Message, Chat, ChatPreview } from 'src/app/models/chat.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';
import { ChatsService } from 'src/app/services/api/chats.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent {
  chatsPreview: ChatPreview[] = [
    {
      last_message: 'Ciao',
      recipient: 'paulpaccy',
      sent_by_me: true,
      _id: '123',
      last_modified: new Date('2023-10-23T15:20:06.470Z'),
    },
  ];

  // chats: Chat = {
  //   _id: '1313',
  //   partecipants: ['ilapale', 'paulpaccy'],
  //   messages: this.messages,
  //   last_modified: 'String',
  // };
  isGuest: boolean = true;
  //2023-10-23T15:20:06.470Z
  // Aggiungi altri messaggi secondo necessità
  constructor(
    private usersService: UsersService,
    private userService: UserService,
    private chatsService: ChatsService
  ) {
    this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.chatsService.getChats().subscribe((chats) => {
          console.log(chats);
          this.chatsPreview = chats;
          for (let i = 0; i < this.chatsPreview.length; i++) {
            console.log(this.chatsPreview[i].last_modified);
            this.chatsPreview[i].last_modified = new Date(this.chatsPreview[i].last_modified);
          }
          console.log(this.chatsPreview);
        });
      }
    });
  }
  //TODO finire implementazione di messages
  onInit() {}

  markAllAsRead(/*_ids: string[]*/) {}
  markAsRead(_id: string) {}

  scrollToAccordion(elementId: string) {
    const element = document.querySelector(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
}
