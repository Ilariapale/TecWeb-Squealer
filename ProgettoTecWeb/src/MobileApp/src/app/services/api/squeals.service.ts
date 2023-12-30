import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType, SquealQuery } from 'src/app/models/squeal.interface';
import { request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SquealsService {
  private apiUrl = '/squeals'; // Replace with your API backend URL

  constructor(private http: HttpClient) {}

  headersGenerator(authenticated: boolean) {
    if (!authenticated) {
      const headers = new HttpHeaders();
      const requestOptions = { headers: headers };
      return requestOptions;
    } else {
      const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
      // Create a HttpHeaders object and add the Authorization header
      const headers = new HttpHeaders().set('Authorization', `${token}`);
      const requestOptions = { headers: headers };
      return requestOptions;
    }
  }

  guestHeadersGenerator() {
    const token = localStorage.getItem('Guest_Authorization');
    // Create a HttpHeaders object and add the Authorization header for the guest user
    if (!token) return { headers: new HttpHeaders() };
    const headers = new HttpHeaders().set('Authorization', `${token}`);
    const requestOptions = { headers: headers };
    return requestOptions;
  }

  getSqueals(query: SquealQuery): Promise<any> {
    let url = `${this.apiUrl}`;
    if (query) {
      url += '?';
      if (query.keywords) {
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
    }

    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.get(`${url}`, requestOptions));
  }

  postSqueal(
    content: string,
    recipients?: object,
    content_type?: ContentType,
    is_scheduled?: boolean,
    schedule_type?: string,
    schedule_options?: object
  ): Promise<any> {
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
    if (is_scheduled) {
      body['is_scheduled'] = is_scheduled;
      body['schedule_type'] = schedule_type;
      if (schedule_options) {
        const options: { [key: string]: any } = schedule_options;
        body['tick_rate'] = options['tick_rate'] || '';
        body['repeat'] = options['repeat'] || '';
        body['scheduled_date'] = options['scheduled_date'] || '';
      }
      return firstValueFrom(this.http.post(`${this.apiUrl}/scheduled`, body, requestOptions));
    }
    return firstValueFrom(this.http.post(`${this.apiUrl}/`, body, requestOptions));
  }

  getHome(isGuest: boolean, lastLoaded?: number, pagSize?: number): Promise<any> {
    let requestOptions;
    if (isGuest) requestOptions = this.guestHeadersGenerator();
    else requestOptions = this.headersGenerator(true);
    let url = `${this.apiUrl}/home?`;

    if (lastLoaded !== undefined) url += `last_loaded=${lastLoaded}&`;
    if (pagSize !== undefined) url += `page_size=${pagSize}&`;
    url = url.slice(0, -1);

    return firstValueFrom(this.http.get(url, requestOptions));
  }
  getSqueal(identifier: String, guest: boolean = false): Promise<any> {
    let requestOptions;
    if (guest) requestOptions = this.guestHeadersGenerator();
    else requestOptions = this.headersGenerator(true);
    //const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.get(`${this.apiUrl}/${identifier}`, requestOptions));
  }
  deleteSqueal(identifier: string): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.delete(`${this.apiUrl}/${identifier}`, requestOptions));
  }

  addReaction(reaction: String, squeal_id: String, guest: boolean = false): Promise<any> {
    let requestOptions;
    if (guest) requestOptions = this.guestHeadersGenerator();
    else requestOptions = this.headersGenerator(true);
    console.log(requestOptions);
    return firstValueFrom(this.http.patch(`${this.apiUrl}/${squeal_id}/reaction/${reaction}`, {}, requestOptions));
  }

  reportSqueal(squeal_id: String): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.patch(`${this.apiUrl}/report/${squeal_id}`, {}, requestOptions));
  }

  updateSqueal(identifier: String, object: any): Promise<any> {
    // object = {users: [], channels: [], keywords: [], like: 0, love: 0, laugh: 0, dislike: 0, disgust: 0, disagree: 0}
    let url = `${this.apiUrl}/${identifier}`;
    let body: any = {};
    let recipients: any = {};
    let reactions: any = {};
    object.users ? (recipients['users'] = object.users) : null;
    object.channels ? (recipients['channels'] = object.channels) : null;
    object.keywords ? (recipients['keywords'] = object.keywords) : null;
    object.like ? (reactions['like'] = object.like) : null;
    object.love ? (reactions['love'] = object.love) : null;
    object.laugh ? (reactions['laugh'] = object.laugh) : null;
    object.dislike ? (reactions['dislike'] = object.dislike) : null;
    object.disgust ? (reactions['disgust'] = object.disgust) : null;
    object.disagree ? (reactions['disagree'] = object.disagree) : null;

    if (recipients.users || recipients.channels || recipients.keywords) {
      body['recipients'] = recipients;
    }
    if (
      reactions.like ||
      reactions.love ||
      reactions.laugh ||
      reactions.dislike ||
      reactions.disgust ||
      reactions.disagree
    ) {
      body['reactions'] = reactions;
    }
    return firstValueFrom(this.http.patch(url, body, this.headersGenerator(true)));
  }
}
