import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Notification } from 'src/app/models/notification.interface';
import { UserQuery } from 'src/app/models/user.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = '/users'; // Sostituisci con l'URL del tuo backend API
  private notificationUrl = '/notifications';

  constructor(private http: HttpClient) {}

  headersGenerator(authenticated: boolean) {
    if (!authenticated) {
      const headers = new HttpHeaders();
      const requestOptions = { headers: headers };
      return requestOptions;
    } else {
      const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
      // Crea un oggetto HttpHeaders e aggiungi l'header Authorization
      const headers = new HttpHeaders().set('Authorization', `${token}`);
      const requestOptions = { headers: headers };
      return requestOptions;
    }
  }

  getUsername(user_id: string): Promise<any> {
    let url = `${this.apiUrl}/username/${user_id}`;
    return firstValueFrom(this.http.get(url, this.headersGenerator(true)));
  }

  getUser(identifier: string): Promise<any> {
    let url = `${this.apiUrl}/${identifier}`;
    return firstValueFrom(this.http.get(url, this.headersGenerator(true)));
  }

  getUsers(query?: UserQuery): Promise<any> {
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
    return firstValueFrom(this.http.get(url, this.headersGenerator(true)));
  }

  getNotifications(): Promise<Notification[]> {
    let url = `${this.apiUrl + this.notificationUrl}?`;
    return firstValueFrom(this.http.get<Notification[]>(url, this.headersGenerator(true)));
  }

  setNotificationStatus(notification_ids: string[], value: boolean): Promise<any> {
    let url = `${this.apiUrl + this.notificationUrl}?value=${value}`;
    return firstValueFrom(this.http.patch(url, { notification_array: notification_ids }, this.headersGenerator(true)));
  }
}
