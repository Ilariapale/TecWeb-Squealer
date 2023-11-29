import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Notification } from 'src/app/models/notification.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = '/users'; // Sostituisci con l'URL del tuo backend API

  constructor(private http: HttpClient) {}

  authenticatedHeadersGenerator() {
    const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
    // Crea un oggetto HttpHeaders e aggiungi l'header Authorization
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    return requestOptions;
  }

  getUsername(user_id: string): Observable<any> {
    let url = `${this.apiUrl}/${user_id}`;
    return this.http.get(url, this.authenticatedHeadersGenerator());
  }

  getUser(identifier: string): Observable<any> {
    let url = `${this.apiUrl}/${identifier}`;
    return this.http.get(url, this.authenticatedHeadersGenerator());
  }

  postUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}`, {});
  }

  getNotifications(): Observable<Notification[]> {
    let url = `${this.apiUrl}/notifications?`;
    const notifications = this.http.get(url, this.authenticatedHeadersGenerator());

    return this.http.get<Notification[]>(url, this.authenticatedHeadersGenerator()).pipe(
      map((notificationsFromServer: any[]) => {
        return notificationsFromServer.map((notificationData: any) => {
          const notification: Notification = {
            _id: notificationData._id,
            content: notificationData.content,
            is_unseen: notificationData.is_unseen,
            created_at: notificationData.created_at,
            user_ref: notificationData.user_ref,
            squeal_ref: notificationData.squeal_ref,
            channel_ref: notificationData.channel_ref,
            comment_ref: notificationData.comment_ref,
            reply: notificationData.reply,
            source: notificationData.source,
          };
          // Map other properties as needed
          return notification;
        });
      })
    );
  }
}
