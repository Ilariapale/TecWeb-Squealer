import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SquealService {
  private apiUrl = '/squeals'; // Sostituisci con l'URL del tuo backend API

  constructor(private http: HttpClient) {}

  getSqueals(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
  postSqueals(): Observable<any> {
    return this.http.post(`${this.apiUrl}`, {});
  }
  getHome(lastLoaded?: number, pagSize?: number): Observable<any> {
    const token =
      sessionStorage.getItem('Authorization') ||
      localStorage.getItem('Authorization');
    // Crea un oggetto HttpHeaders e aggiungi l'header Authorization
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    let url = `${this.apiUrl}/home`;
    console.log(url, headers);
    if (lastLoaded !== undefined && pagSize !== undefined)
      return this.http.get(
        url + `?lastLoaded=${lastLoaded}&pageSize=${pagSize}`,
        requestOptions
      );

    if (lastLoaded !== undefined)
      return this.http.get(url + `?lastLoaded=${lastLoaded}`, requestOptions);

    if (pagSize !== undefined)
      return this.http.get(url + `?pageSize=${pagSize}`, requestOptions);

    return this.http.get(url, requestOptions);
  }
  getSqueal(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
  deleteSqueal(): Observable<any> {
    return this.http.delete(`${this.apiUrl}`);
  }
  addReaction(): Observable<any> {
    return this.http.post(`${this.apiUrl}`, {});
  }
  updateSqueal(): Observable<any> {
    return this.http.patch(`${this.apiUrl}`, {});
  }

  updatePassword(old_password: string, new_password: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users`, {
      old_password,
      new_password,
    });
  }

  // Altre funzioni per il recupero password, aggiornamento del profilo, ecc. possono essere implementate qui.
}
