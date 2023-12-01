import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType } from 'src/app/models/squeal.interface';
import { request } from 'express';
import { ChannelQuery } from 'src/app/models/channel.interface';

@Injectable({
  providedIn: 'root',
})
export class ChannelsService {
  private apiUrl = '/channels'; // Sostituisci con l'URL del tuo backend API

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

  getChannels(query: ChannelQuery): Observable<any> {
    let url = `${this.apiUrl}`;
    if (query) {
      url += '?';
      if (query.name) url += `name=${query.name}&`;
      if (query.created_after) url += `created_after=${query.created_after}&`;
      if (query.created_before) url += `created_before=${query.created_before}&`;
      if (query.max_subscribers) url += `max_squeals=${query.max_squeals}&`;
      if (query.min_subscribers) url += `min_squeals=${query.min_squeals}&`;
      if (query.max_squeals) url += `max_squeals=${query.max_squeals}&`;
      if (query.min_squeals) url += `min_squeals=${query.min_squeals}&`;
      if (query.is_official) url += `is_official=${query.is_official}&`;
      if (query.sort_order) url += `sort_order=${query.sort_order}&`;
      if (query.sort_by) url += `sort_by=${query.sort_by}&`;
      if (query.pag_size) url += `pag_size=${query.pag_size}&`;
      if (query.last_loaded) url += `last_loaded=${query.last_loaded}&`;
      url = url.slice(0, -1);
    }
    const requestOptions = this.headersGenerator(true);
    return this.http.get(url, requestOptions);
  }

  // Altre funzioni per il recupero password, aggiornamento del profilo, ecc. possono essere implementate qui.
}
