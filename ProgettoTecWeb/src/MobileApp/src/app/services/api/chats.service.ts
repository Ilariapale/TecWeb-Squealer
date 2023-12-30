import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Chat, Message, ChatPreview } from 'src/app/models/chat.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  private apiUrl = '/chats';

  constructor(private http: HttpClient) {}

  authenticatedHeadersGenerator() {
    const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
    // Create a HttpHeaders object and add the Authorization header
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    return requestOptions;
  }

  getChats(): Promise<any> {
    //return this.http.get(`${this.apiUrl}`);
    let url = `${this.apiUrl}/`;
    return firstValueFrom(this.http.get(url, this.authenticatedHeadersGenerator()));
  }

  getChat(chatId: string, lastLoaded?: string): Promise<any> {
    let url = `${this.apiUrl}/${chatId}`;
    if (lastLoaded) url += `?last_loaded_message=${lastLoaded}`;
    return firstValueFrom(this.http.get(url, this.authenticatedHeadersGenerator()));
  }

  getChatByUser(userIdentifier: string): Promise<any> {
    let url = `${this.apiUrl}/direct/${userIdentifier}`;
    return firstValueFrom(this.http.get(url, this.authenticatedHeadersGenerator()));
  }

  sendMessage(userIdentifier: string, message: string): Promise<any> {
    let url = `${this.apiUrl}/direct/${userIdentifier}`;
    return firstValueFrom(this.http.post(url, { message: message }, this.authenticatedHeadersGenerator()));
  }
}
