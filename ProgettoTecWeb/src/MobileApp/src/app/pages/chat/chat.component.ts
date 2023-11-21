import { Component, Input } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Message, Chat, ChatPreview } from 'src/app/models/chat.interface';
import { UsersService } from 'src/app/services/api/users.service';
import { UserService } from 'src/app/services/user.service';
import { Source } from 'src/app/models/notification.interface';
import { ChatsService } from 'src/app/services/api/chats.service';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  @Input() message_text: string = '';
  private chatSubscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();
  isGuest = true;
  chat = {
    partecipants: ['28347198730', '28347198731'],
    messages: [
      { sender: 0, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 0, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
      { sender: 1, text: 'Ciao', timestamp: new Date('1970-01-01T00:00:00Z') },
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
    public timeService: TimeService,
    public darkModeService: DarkModeService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.chatId = params.get('id') || '0';
    });
    this.userSubscription = this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.chatsService.getChat(this.chatId).subscribe((response) => {
          this.chat = response.chat;
          this.reqSenderPosition = response.reqSenderPosition;
          this.chatSubscription = this.usersService
            .getUsername(this.chat.partecipants[1 - this.reqSenderPosition].toString())
            .subscribe((data) => {
              this.recipient = data.username;
            });
        });
      }
    });
  }

  ngOnInit() {
    // Scroll to the bottom of the page
    setTimeout(() => {
      this.scrollToBottom();
    }, 10);
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.chatSubscription.unsubscribe();
  }
  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
  sendMessage() {
    //use the chatservice to send a message
    this.chatsService
      .sendMessage(this.chat.partecipants[1 - this.reqSenderPosition].toString(), this.message_text)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.message_text = '';
          setTimeout(() => {
            this.chat.messages.push({
              sender: this.reqSenderPosition,
              text: response.text,
              timestamp: response.timestamp,
            });
          }, 0);

          setTimeout(() => {
            this.scrollToBottom();
          }, 0);
        },
        error: (error) => {
          // Gestisci gli errori qui, ad esempio mostrando un messaggio all'utente
        },
      });
  }
  private scrollToBottom(): void {
    try {
      window.scrollTo(0, document.body.scrollHeight);
    } catch (err) {}
  }
}
