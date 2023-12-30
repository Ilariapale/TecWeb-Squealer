import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserService } from '../../services/user.service';
import jwt_decode from 'jwt-decode';
import { User } from '../../models/user.interface'; // Impoer user interface
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = ''; // Replace with your API backend URL

  constructor(private http: HttpClient, private userService: UserService, private router: Router) {}

  // Login function
  login(username: string, password: string, rememberMe: boolean): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      firstValueFrom(this.http.post(`${this.apiUrl}/auth`, { username, password }, { observe: 'response' })).then(
        (response: HttpResponse<any>) => {
          const authToken = response.headers.get('Authorization');

          if (authToken) {
            // Save the authorization token in LocalStorage
            rememberMe
              ? localStorage.setItem('Authorization', authToken)
              : sessionStorage.setItem('Authorization', authToken);

            const decodedToken: { user: User } = jwt_decode(authToken || '');
            this.userService.setUserData(decodedToken.user || {});
            rememberMe
              ? localStorage.setItem('user', JSON.stringify(decodedToken.user))
              : sessionStorage.setItem('user', JSON.stringify(decodedToken.user));

            resolve(true); // The operation was successful
          } else {
            reject('Authorization token not found'); // Authorization token not found
          }
        },
        (error) => {
          reject(error.error.error); // The operation was not successful
        }
      );
    });
  }

  loginGuest(token?: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let decodedToken: any = undefined;
      if (token) decodedToken = jwt_decode(token);
      let url = this.apiUrl + '/auth/guest';
      decodedToken?.guest?.uuid ? (url += `?uuid=${decodedToken.guest.uuid}`) : null;
      firstValueFrom(this.http.post(url, {}, { observe: 'response' })).then(
        (response: HttpResponse<any>) => {
          const authToken = response.headers.get('Authorization');
          if (authToken) {
            localStorage.setItem('Guest_Authorization', authToken);
            const decodedToken: { guest: any } = jwt_decode(authToken || '');
            localStorage.setItem('Guest_user', JSON.stringify(decodedToken.guest || {}));
            resolve(true); // The operation was successful
          } else {
            reject('Authorization token not found'); // Authorization token not found
          }
        },
        (error) => {
          reject(error.error.error); // The operation was not successful
        }
      );
    });
  }

  logout() {
    localStorage.removeItem('Authorization');
    sessionStorage.removeItem('Authorization');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.userService.setUserData({});
    this.router.navigate(['/login']);
  }

  // Sign up function
  signup(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, {
      username,
      email,
      password,
    });
  }

  // Logout function
  //logout(): Observable<any> {
  //  return this.http.post(`${this.apiUrl}/logout`, {});
  //}

  // Other functions for password recovery, profile update, etc. can be implemented here.
}
