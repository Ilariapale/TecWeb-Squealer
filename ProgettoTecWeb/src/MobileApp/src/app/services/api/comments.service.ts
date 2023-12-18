import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType } from 'src/app/models/squeal.interface';
import { request } from 'express';
import { firstValueFrom } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = '/comments'; // Sostituisci con l'URL del tuo backend API

  constructor(private http: HttpClient) {}

  headersGenerator() {
    const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
    // Crea un oggetto HttpHeaders e aggiungi l'header Authorization
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    console.log(requestOptions);
    return requestOptions;
  }

  getComments(comment_section_id: string, last_comment_loaded?: string): Promise<any> {
    const requestOptions = this.headersGenerator();
    let url = `${this.apiUrl}/${comment_section_id}`;
    if (last_comment_loaded) {
      url += `?last_comment_loaded=${last_comment_loaded}`;
      console.log(url);
      ///comments/658015c83623461db9a4c99d?last_loaded=658017e53623461db9a4cb24
    }
    return firstValueFrom(this.http.get(url, requestOptions));
  }

  addComment(comment_section_id: string, message: string): Promise<any> {
    const requestOptions = this.headersGenerator();
    const body: { [key: string]: any } = { message };
    return firstValueFrom(this.http.post(`${this.apiUrl}/${comment_section_id}`, body, requestOptions));
  }
}
