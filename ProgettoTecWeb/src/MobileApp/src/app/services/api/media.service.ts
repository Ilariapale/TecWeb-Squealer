import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType, SquealQuery } from 'src/app/models/squeal.interface';
import { request } from 'express';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
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

  postImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);

    const requestOptions = this.headersGenerator(true);
    return this.http.post(`/media/image/upload`, formData, requestOptions);
  }

  postVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', file);

    const requestOptions = this.headersGenerator(true);
    return this.http.post(`/media/video/upload`, formData, requestOptions);
  }
}
