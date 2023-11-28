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
import { io } from 'socket.io-client';
import { Router } from '@angular/router';

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
  chat: Chat = {} as Chat;
  reqSenderPosition = 0;
  chatId = '0';
  recipient = 'Recipient';
  user: any;
  chat_loaded = false;
  private socket: any; // Dichiarazione della variabile del socket

  constructor(
    private route: ActivatedRoute,
    private chatsService: ChatsService,
    private userService: UserService,
    private usersService: UsersService,
    public timeService: TimeService,
    public darkModeService: DarkModeService,
    private router: Router
  ) {
    this.route.paramMap.subscribe((params) => {
      this.recipient = params.get('recipient') || params.get('user') || '0';
      this.chatId = params.get('id') || '0';
    });

    this.userSubscription = this.userService.getUserData().subscribe((userData) => {
      if (userData.account_type === 'guest') {
        this.isGuest = true;
      } else {
        this.isGuest = false;
        this.user = userData;
        if (this.chatId !== '0') {
          console.log(this.chatId, 'this.chatId');
          console.log(this.recipient, 'this.recipient');

          this.chatsService.getChat(this.chatId).subscribe((response) => {
            this.chat = response.chat;
            this.chat_loaded = true;
            this.reqSenderPosition = response.reqSenderPosition;
          });
        }
        this.connectWebSocket(); // Chiamata alla funzione per connettersi al WebSocket
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
    if (this.socket) this.socket.disconnect(); // Disconnetti il socket quando il componente viene distrutto
  }

  private connectWebSocket(): void {
    this.socket = io(); // Sostituisci con l'URL del tuo server WebSocket
    this.socket.emit('authenticate', this.user.user_id);
    this.socket.on('new_message', (message: any) => {
      // Gestisci il messaggio ricevuto dal server
      this.chat.messages.push({
        sender: message.sender,
        text: message.text,
        timestamp: new Date(message.timestamp),
      });
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    });
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
  sendMessage() {
    //use the chatservice to send a message
    this.chatsService
      .sendMessage(
        this.chatId !== '0' ? this.chat.partecipants[1 - this.reqSenderPosition].toString() : this.recipient,
        this.message_text
      )
      .subscribe({
        next: (response) => {
          //TODO fixare il aN/NaN/NaN
          //console.log(response);
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
  //}

  goToPage(page: string) {
    this.router.navigate([`/${page}`]);
  }
  private scrollToBottom(): void {
    try {
      window.scrollTo(0, document.body.scrollHeight);
    } catch (err) {}
  }
}
