import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Chat, Message, ChatPreview } from 'src/app/models/chat.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  private apiUrl = '/chats'; // Sostituisci con l'URL del tuo backend API

  constructor(private http: HttpClient) {}

  authenticatedHeadersGenerator() {
    const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
    // Crea un oggetto HttpHeaders e aggiungi l'header Authorization
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    return requestOptions;
  }

  getChats(): Observable<any> {
    //return this.http.get(`${this.apiUrl}`);
    let url = `${this.apiUrl}/`;
    return this.http.get(url, this.authenticatedHeadersGenerator());
  }

  getChat(chatId: string): Observable<any> {
    let url = `${this.apiUrl}/${chatId}`;
    return this.http.get(url, this.authenticatedHeadersGenerator());
  }

  sendMessage(userIdentifier: string, message: string): Observable<any> {
    let url = `${this.apiUrl}/direct/${userIdentifier}`;
    return this.http.post(url, { message: message }, this.authenticatedHeadersGenerator());
  }
}
