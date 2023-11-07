import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType } from 'src/app/models/squeal.interface';
import { request } from 'express';

@Injectable({
  providedIn: 'root',
})
export class SquealService {
  private apiUrl = '/squeals'; // Sostituisci con l'URL del tuo backend API

  constructor(private http: HttpClient) {}

  authenticatedHeadersGenerator() {
    const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
    // Crea un oggetto HttpHeaders e aggiungi l'header Authorization
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    console.log(requestOptions);
    return requestOptions;
  }

  guestHeadersGenerator() {
    const headers = new HttpHeaders();
    const requestOptions = { headers: headers };
    return requestOptions;
  }

  getSqueals(): Observable<any> {
    const requestOptions = this.authenticatedHeadersGenerator();
    return this.http.get(`${this.apiUrl}`, requestOptions);
  }
  postSqueal(
    content: string,
    recipients?: object,
    content_type?: ContentType,
    is_scheduled?: boolean
  ): Observable<any> {
    const requestOptions = this.authenticatedHeadersGenerator();
    const body: { [key: string]: any } = { content };

    recipients
      ? (body['recipients'] = recipients)
      : (body['recipients'] = {
          users: [],
          channels: [],
          keywords: [],
        });
    if (content_type) body['content_type'] = content_type;
    if (is_scheduled) body['is_scheduled'] = is_scheduled;
    console.log(body);
    return this.http.post(`${this.apiUrl}/`, body, requestOptions);
  }
  getHome(isGuest: boolean, lastLoaded?: number, pagSize?: number): Observable<any> {
    //TODO controllare se funziona
    const requestOptions = isGuest ? this.guestHeadersGenerator() : this.authenticatedHeadersGenerator();

    let url = `${this.apiUrl}/home`;
    //console.log(url, headers);
    if (lastLoaded !== undefined && pagSize !== undefined)
      return this.http.get(url + `?lastLoaded=${lastLoaded}&pageSize=${pagSize}`, requestOptions);

    if (lastLoaded !== undefined) return this.http.get(url + `?lastLoaded=${lastLoaded}`, requestOptions);

    if (pagSize !== undefined) return this.http.get(url + `?pageSize=${pagSize}`, requestOptions);

    return this.http.get(url, requestOptions);
  }
  getSqueal(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
  deleteSqueal(): Observable<any> {
    return this.http.delete(`${this.apiUrl}`);
  }
  addReaction(reaction: String, squeal_id: String): Observable<any> {
    const requestOptions = this.authenticatedHeadersGenerator();
    return this.http.patch(`${this.apiUrl}/${squeal_id}/reaction/${reaction}`, {}, requestOptions);
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