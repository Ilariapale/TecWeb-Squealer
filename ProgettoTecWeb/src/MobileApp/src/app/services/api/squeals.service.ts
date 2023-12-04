import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType, SquealQuery } from 'src/app/models/squeal.interface';
import { request } from 'express';

@Injectable({
  providedIn: 'root',
})
export class SquealsService {
  private apiUrl = '/squeals'; // Sostituisci con l'URL del tuo backend API

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

  getSqueals(query: SquealQuery): Observable<any> {
    console.log(query);
    let url = `${this.apiUrl}`;
    if (query) {
      url += '?';
      if (query.keywords) {
        console.log(query.keywords);
        query.keywords.forEach((keyword) => {
          url += `keywords=${keyword}&`;
        });
      }
      if (query.content_type) url += `content_type=${query.content_type}&`;
      if (query.is_scheduled) url += `is_scheduled=${query.is_scheduled}&`;
      if (query.created_after) url += `created_after=${query.created_after}&`;
      if (query.created_before) url += `created_before=${query.created_before}&`;
      if (query.min_reactions) url += `min_reactions=${query.min_reactions}&`;
      if (query.max_balance) url += `max_balance=${query.max_balance}&`;
      if (query.min_balance) url += `min_balance=${query.min_balance}&`;
      if (query.sort_order) url += `sort_order=${query.sort_order}&`;
      if (query.sort_by) url += `sort_by=${query.sort_by}&`;
      if (query.pag_size) url += `pag_size=${query.pag_size}&`;
      if (query.last_loaded) url += `last_loaded=${query.last_loaded}&`;
      url = url.slice(0, -1);
      console.log(url);
    }

    const requestOptions = this.headersGenerator(true);
    return this.http.get(`${url}`, requestOptions);
  }

  postSqueal(
    content: string,
    recipients?: object,
    content_type?: ContentType,
    is_scheduled?: boolean
  ): Observable<any> {
    const requestOptions = this.headersGenerator(true);
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
    return this.http.post(`${this.apiUrl}/`, body, requestOptions);
  }
  getHome(isGuest: boolean, lastLoaded?: number, pagSize?: number): Observable<any> {
    //TODO controllare se funziona
    const requestOptions = this.headersGenerator(!isGuest);

    let url = `${this.apiUrl}/home`;
    if (lastLoaded !== undefined && pagSize !== undefined)
      return this.http.get(url + `?lastLoaded=${lastLoaded}&pageSize=${pagSize}`, requestOptions);

    if (lastLoaded !== undefined) return this.http.get(url + `?lastLoaded=${lastLoaded}`, requestOptions);

    if (pagSize !== undefined) return this.http.get(url + `?pageSize=${pagSize}`, requestOptions);

    return this.http.get(url, requestOptions);
  }
  getSqueal(identifier: String): Observable<any> {
    const requestOptions = this.headersGenerator(true);
    return this.http.get(`${this.apiUrl}/${identifier}`, requestOptions);
  }
  deleteSqueal(identifier: string): Observable<any> {
    const requestOptions = this.headersGenerator(true);
    return this.http.delete(`${this.apiUrl}/${identifier}`, requestOptions);
  }
  addReaction(reaction: String, squeal_id: String): Observable<any> {
    const requestOptions = this.headersGenerator(true);
    return this.http.patch(`${this.apiUrl}/${squeal_id}/reaction/${reaction}`, {}, requestOptions);
  }
  updateSqueal(): Observable<any> {
    return this.http.patch(`${this.apiUrl}`, {});
  }

  postMedia(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    const requestOptions = this.headersGenerator(true);
    return this.http.post(`/media/upload`, formData, requestOptions);
  }
  // Altre funzioni per il recupero password, aggiornamento del profilo, ecc. possono essere implementate qui.
}
