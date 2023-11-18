import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Message, Chat, ChatPreview } from 'src/app/models/chat.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';
import { ChatsService } from 'src/app/services/api/chats.service';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  isGuest = true;
  chat = {
    partecipants: ['28347198730', '28347198731'],
    messages: [
      { sender: 0, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Come stai?', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Bene', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Tu?', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Bene', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Che fai?', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Niente', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Io sto andando a fare la spesa', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ok', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Ci vediamo dopo', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ok', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      {
        sender: 1,
        text: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA aaaaaaaaaaaa AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        timestamp: new Date('1970-01-01T00:00:00Z'),
      },
      {
        sender: 0,
        text: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA aaaaaaaaaaaa AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        timestamp: new Date('1970-01-01T00:00:00Z'),
      },
    ],
    last_modified: new Date('1970-01-01T00:00:00Z'),
  };
  reqSenderPosition = 0;
  chatId = '0';
  recipient = 'User';
  constructor(
    private route: ActivatedRoute,
    private chatsService: ChatsService,
    private userService: UserService,
    private usersService: UsersService,
    public timeService: TimeService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.chatId = params.get('id') || '0';
    });
  }

  ngOnInit() {
    this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.chatsService.getChat(this.chatId).subscribe((response) => {
          this.chat = response.chat;
          this.reqSenderPosition = response.reqSenderPosition;
          this.usersService
            .getUsername(this.chat.partecipants[1 - this.reqSenderPosition].toString())
            .subscribe((data) => {
              this.recipient = data.username;
            });
        });
      }
    });
  }
}
