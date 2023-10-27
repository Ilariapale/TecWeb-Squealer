import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType } from 'src/app/models/squeal.interface';
import { request } from 'express';

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

  getComments(comment_section_id: string, last_comment_loaded?: string): Observable<any> {
    const requestOptions = this.headersGenerator();
    if (last_comment_loaded)
      return this.http.get(`${this.apiUrl}/${comment_section_id}?last_comment_loaded=${last_comment_loaded}`);
    else return this.http.get(`${this.apiUrl}/${comment_section_id}`);
  }

  addComment(comment_section_id: string, message: string): Observable<any> {
    const requestOptions = this.headersGenerator();
    const body: { [key: string]: any } = { message };
    return this.http.post(`${this.apiUrl}/${comment_section_id}`, body, requestOptions);
  }
}
