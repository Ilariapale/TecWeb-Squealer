import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Message, Chat } from 'src/app/models/chat.interface';
import { UserService } from 'src/app/services/user.service';
import { ChatsService } from 'src/app/services/api/chats.service';
import { DarkModeService } from 'src/app/services/dark-mode.service';
import { TimeService } from 'src/app/services/time.service';
import { io } from 'socket.io-client';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  @Input() message_text: string = '';
  @ViewChild('messageContainer') chatContainer: ElementRef | undefined;

  more_to_load = true;
  isGuest = true;
  chat: Chat = {} as Chat;
  reqSenderPosition = 0;
  chatId = '0';
  recipient = 'Recipient';
  user: any;
  chat_loaded = false;
  private socket: any;

  constructor(
    private route: ActivatedRoute,
    private chatsService: ChatsService,
    private userService: UserService,
    public timeService: TimeService,
    public darkModeService: DarkModeService,
    private router: Router
  ) {
    this.route.paramMap.subscribe((params) => {
      this.recipient = params.get('recipient') || params.get('user') || '0';
      this.chatId = params.get('id') || '0';
    });

    const userData = this.userService.getUserData();
    if (userData.account_type === 'guest') {
      this.isGuest = true;
    } else {
      this.isGuest = false;
      this.user = userData;
      if (this.chatId !== '0') {
        this.chatsService.getChat(this.chatId).then((response: any) => {
          this.chat = response.chat;
          this.chat_loaded = true;
          if (this.chat.messages.length < 6) this.more_to_load = false;
          this.reqSenderPosition = response.reqSenderPosition;
          setTimeout(() => {
            this.scrollToBottom();
          }, 10);
        });
      } else if (this.recipient !== '0') {
        this.chatsService
          .getChatByUser(this.recipient)
          .then((response: any) => {
            this.chat = response.chat;
            this.chat_loaded = true;
            this.chatId = response.chat._id ? response.chat._id : '0';
            if (this.chat.messages.length < 6) this.more_to_load = false;
            this.reqSenderPosition = response.reqSenderPosition;
            setTimeout(() => {
              this.scrollToBottom();
            }, 10);
          })
          .catch((error) => {});
      }

      this.connectWebSocket();
    }
  }

  ngOnDestroy() {
    if (this.socket) this.socket.disconnect(); // Disconnect the socket when the component is destroyed
  }

  private connectWebSocket(): void {
    this.socket = io();
    this.socket.emit('authenticate', this.user._id);
    this.socket.on('new_message', (message: Message) => {
      if (message.from != this.recipient) return;
      // Handle the message received from the server
      this.chat.messages.push({
        sender: message.sender,
        text: message.text,
        timestamp: new Date(message.timestamp),
      });
      this.scrollToBottom();
      setTimeout(() => {
        this.scrollToBottom();
      }, 50);
    });
  }

  loadMoreMessages() {
    if (this.chat.messages && this.chat.messages.length > 0) {
      this.chatsService
        .getChat(this.chatId, this.chat.messages[0]._id)
        .then((response: any) => {
          if (response.chat != undefined && response.chat.messages.length > 0)
            this.chat.messages?.unshift(...response.chat.messages);
          if (response.chat_length <= this.chat.messages.length) this.more_to_load = false;
          else this.more_to_load = true;
        })
        .catch((error) => {
          console.error(error);
          this.more_to_load = false;
        });
    }
  }

  getThemeClass() {
    return this.darkModeService.getThemeClass();
  }
  sendMessage() {
    // use the chatservice to send a message
    if (this.message_text.length <= 0) return;
    this.chatsService
      .sendMessage(
        this.chatId !== '0' ? this.chat.partecipants[1 - this.reqSenderPosition].toString() : this.recipient,
        this.message_text
      )
      .then((response) => {
        this.message_text = '';
        if (response.chat_id) this.router.navigate(['/private-chats/user', response.chat_id, this.recipient]);
        if (!this.chat.messages) this.chat.messages = [];
        this.chat.messages.push({
          sender: this.reqSenderPosition,
          text: response.text,
          timestamp: response.timestamp,
        });

        setTimeout(() => {
          this.scrollToBottom();
        }, 50);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private scrollToBottom(): void {
    try {
      const chatContainer = document.getElementById('chat-main'); //messageContainer
      if (chatContainer) {
        chatContainer.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
      }
    } catch (err) {
      console.error('Error during scroll:', err);
    }
  }
}
