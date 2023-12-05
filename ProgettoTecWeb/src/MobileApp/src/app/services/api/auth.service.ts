import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { UserService } from '../../services/user.service';
import jwt_decode from 'jwt-decode';
import { User } from '../../models/user.interface'; // Importa l'interfaccia utente
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = ''; // Sostituisci con l'URL del tuo backend API

  constructor(private http: HttpClient, private userService: UserService, private router: Router) {}

  // Funzione per effettuare il login
  login(username: string, password: string, rememberMe: boolean): Observable<void> {
    return this.http.post(`${this.apiUrl}/auth`, { username, password }, { observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        const authToken = response.headers.get('Authorization');

        if (authToken) {
          // Salva il token di autorizzazione nel LocalStorage
          rememberMe
            ? localStorage.setItem('Authorization', authToken)
            : sessionStorage.setItem('Authorization', authToken);

          const decodedToken: { user: User } = jwt_decode(authToken || '');
          this.userService.setUserData(decodedToken.user || {});
          rememberMe
            ? localStorage.setItem('user', JSON.stringify(decodedToken.user))
            : sessionStorage.setItem('user', JSON.stringify(decodedToken.user));
        }
      })
    );
  }

  logout() {
    // Rimuovi il token di autorizzazione dal LocalStorage
    //TODO fix
    localStorage.removeItem('Authorization');
    sessionStorage.removeItem('Authorization');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    this.userService.setUserData({});
    this.router.navigate(['/login']);
    //redirect to login page "/login"
  }

  // Funzione per effettuare la registrazione
  signup(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, {
      username,
      email,
      password,
    });
  }

  //// Funzione per effettuare il logout
  //logout(): Observable<any> {
  //  return this.http.post(`${this.apiUrl}/logout`, {});
  //}

  updatePassword(old_password: string, new_password: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users`, {
      old_password,
      new_password,
    });
  }

  // Altre funzioni per il recupero password, aggiornamento del profilo, ecc. possono essere implementate qui.
}
