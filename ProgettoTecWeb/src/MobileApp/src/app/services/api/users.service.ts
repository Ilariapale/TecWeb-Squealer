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
  private apiUrl = '/users';
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

  getUsername(identifier?: string): Promise<any> {
    let url = `${this.apiUrl}/username`;
    url += identifier ? `?identifier=${identifier}` : '';
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

  updateCharacters(tier: string, identifier?: string, options?: any): Promise<any> {
    let url = `${this.apiUrl}/characters`;
    let body: any = { tier };

    identifier ? (body['identifier'] = identifier) : null;
    options?.daily ? (body['char_quota_daily'] = options.daily) : null;
    options?.weekly ? (body['char_quota_weekly'] = options.weekly) : null;
    options?.monthly ? (body['char_quota_monthly'] = options.monthly) : null;
    return firstValueFrom(this.http.patch(url, body, this.headersGenerator(true)));
  }

  getNotifications(pag_size?: number, last_loaded?: string): Promise<Notification[]> {
    let url = `${this.apiUrl + this.notificationUrl}?`;
    if (pag_size) url += `pag_size=${pag_size}&`;
    if (last_loaded) url += `last_loaded=${last_loaded}&`;
    url = url.slice(0, -1);
    return firstValueFrom(this.http.get<Notification[]>(url, this.headersGenerator(true)));
  }

  setNotificationStatus(notification_ids: string[], value: boolean): Promise<any> {
    let url = `${this.apiUrl + this.notificationUrl}?value=${value}`;
    return firstValueFrom(this.http.patch(url, { notification_array: notification_ids }, this.headersGenerator(true)));
  }

  //usersService.updateUser(...)
  updatePassword(identifier: string, old_password: string, new_password: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(
        `${this.apiUrl}/${identifier}/password`,
        {
          old_password,
          new_password,
        },
        this.headersGenerator(true)
      )
    );
  }

  resetPassword(identifier: string, email: string, new_password: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(
        `${this.apiUrl}/${identifier}/reset-password`,
        {
          email,
          new_password,
        },
        this.headersGenerator(false)
      )
    );
  }

  /**
   *
   * @param identifier
   * @param object is an object with the following properties: new_profile_picture, new_profile_info
   * @returns
   */
  updateProfile(identifier: string, object?: any): Promise<any> {
    let body: any = {};
    object.profile_picture ? (body['profile_picture'] = object.profile_picture) : null;
    object.profile_info ? (body['profile_info'] = object.profile_info) : null;
    return firstValueFrom(this.http.patch(`${this.apiUrl}/${identifier}/profile`, body, this.headersGenerator(true)));
  }

  deleteUser(identifier: string): Promise<any> {
    return firstValueFrom(this.http.delete(`${this.apiUrl}/${identifier}`, this.headersGenerator(true)));
  }
}
