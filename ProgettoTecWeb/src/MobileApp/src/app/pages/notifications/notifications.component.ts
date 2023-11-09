// notifications.component.ts

import { Component } from '@angular/core';

interface Notification {
  message: string;
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  notifications: Notification[] = [
    { message: 'Nuova notifica 1', read: false },
    { message: 'Nuova notifica 2', read: true },
    { message: 'Nuova notifica 3', read: false },
    // Aggiungi altre notifiche secondo necessità
  ];

  markAllAsRead() {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
  }
}
