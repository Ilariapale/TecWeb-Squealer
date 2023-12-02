import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Notification } from 'src/app/models/notification.interface';
import { UserQuery } from 'src/app/models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = '/users'; // Sostituisci con l'URL del tuo backend API
  private notificationUrl = '/notifications';

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

  getUsers(query?: UserQuery): Observable<any> {
    let url = `${this.apiUrl}`;
    if (query) {
      url += '?';
      if (query.username) url += `username=${query.username}&`;
      if (query.created_after) url += `created_after=${query.created_after}&`;
      if (query.created_before) url += `created_before=${query.created_before}&`;
      if (query.max_squeals) url += `max_squeals=${query.max_squeals}&`;
      if (query.min_squeals) url += `min_squeals=${query.min_squeals}&`;
      if (query.account_type) url += `account_type=${query.account_type}&`;
      if (query.professional_type) url += `professional_type=${query.professional_type}&`;
      if (query.sort_order) url += `sort_order=${query.sort_order}&`;
      if (query.sort_by) url += `sort_by=${query.sort_by}&`;
      if (query.pag_size) url += `pag_size=${query.pag_size}&`;
      if (query.last_loaded) url += `last_loaded=${query.last_loaded}&`;
      url = url.slice(0, -1);
    }
    console.log(url);
    return this.http.get(url, this.authenticatedHeadersGenerator());
  }

  postUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}`, {});
  }

  getNotifications(): Observable<Notification[]> {
    let url = `${this.apiUrl + this.notificationUrl}?`;
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
            id_code: notificationData.id_code,
            sender_ref: notificationData.sender_ref,
          };
          // Map other properties as needed
          return notification;
        });
      })
    );
  }

  setNotificationStatus(notification_ids: string[], value: boolean): Observable<any> {
    let url = `${this.apiUrl + this.notificationUrl}?value=${value}`;
    return this.http.patch(url, { notification_array: notification_ids }, this.authenticatedHeadersGenerator());
  }
}
