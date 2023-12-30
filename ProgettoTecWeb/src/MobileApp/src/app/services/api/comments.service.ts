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
  private apiUrl = '/comments'; // Replace with your API backend URL

  constructor(private http: HttpClient) {}

  headersGenerator() {
    const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
    // Create a HttpHeaders object and add the Authorization header
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    return requestOptions;
  }

  getComments(comment_section_id: string, last_comment_loaded?: string): Promise<any> {
    const requestOptions = this.headersGenerator();
    let url = `${this.apiUrl}/${comment_section_id}`;
    if (last_comment_loaded) {
      url += `?last_comment_loaded=${last_comment_loaded}`;
    }
    return firstValueFrom(this.http.get(url, requestOptions));
  }

  addComment(comment_section_id: string, message: string): Promise<any> {
    const requestOptions = this.headersGenerator();
    const body: { [key: string]: any } = { message };
    return firstValueFrom(this.http.post(`${this.apiUrl}/${comment_section_id}`, body, requestOptions));
  }
}
