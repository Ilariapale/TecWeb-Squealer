import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
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
    ],
    last_modified: new Date('1970-01-01T00:00:00Z'),
  };
}
