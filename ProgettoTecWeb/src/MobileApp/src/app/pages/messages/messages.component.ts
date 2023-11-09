// messages.component.ts

import { Component } from '@angular/core';

interface Message {
  text: string;
  read: boolean;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent {
  messages: Message[] = [
    { text: 'Nuovo messaggio 1', read: false },
    { text: 'Nuovo messaggio 2', read: true },
    { text: 'Nuovo messaggio 3', read: false },
    // Aggiungi altri messaggi secondo necessità
  ];

  markAllAsRead() {
    this.messages.forEach((message) => {
      message.read = true;
    });
  }
}
