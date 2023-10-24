import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/users'; // Sostituisci con l'URL del tuo backend API

  constructor(private http: HttpClient) {}

  getUsername(): Observable<any> {
    //return this.http.get(`${this.apiUrl}`);

    const token =
      sessionStorage.getItem('Authorization') ||
      localStorage.getItem('Authorization');
    // Crea un oggetto HttpHeaders e aggiungi l'header Authorization
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    let url = `${this.apiUrl}/home`;
    console.log(url, headers);

    return this.http.get(url, requestOptions);
  }

  postUsers(): Observable<any> {
    return this.http.post(`${this.apiUrl}`, {});
  }
}
