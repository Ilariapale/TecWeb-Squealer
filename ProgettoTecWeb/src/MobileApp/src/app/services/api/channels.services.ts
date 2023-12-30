import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ContentType } from 'src/app/models/squeal.interface';
import { request } from 'express';
import { ChannelQuery } from 'src/app/models/channel.interface';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChannelsService {
  private apiUrl = '/channels';

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

  getChannels(query: ChannelQuery): Promise<any> {
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
    return firstValueFrom(this.http.get(url, requestOptions));
  }

  getChannel(identifier: string): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.get(`${this.apiUrl}/${identifier}`, requestOptions));
  }

  getSubscriptionStatus(identifier: string): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.get(`${this.apiUrl}/${identifier}/subscription-status`, requestOptions));
  }

  createChannel(name: string, description: string, is_official?: boolean, can_mute?: boolean): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    let body: any = {
      name: name,
      description: description,
    };
    if (is_official !== undefined) body.is_official = is_official;
    if (can_mute !== undefined) body.can_mute = can_mute;

    return firstValueFrom(this.http.post(`${this.apiUrl}`, body, requestOptions));
  }

  setMuteStatus(identifier: String, value: boolean): Promise<any> {
    const requestOptions = this.headersGenerator(true); ///:identifier/muted-status"
    return firstValueFrom(
      this.http.patch(`${this.apiUrl}/${identifier}/muted-status?value=${value}`, {}, requestOptions)
    );
  }

  subscribeToChannel(identifier: String, value: boolean): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(
      this.http.patch(`${this.apiUrl}/${identifier}/subscription-status?value=${value}`, {}, requestOptions)
    );
  }
  /**
  * body: {
  * identifier: string,
    newName?: string,
    newDescription?: string,
    newOwner?: string,
    editorsArray?: string[]
  }
 */

  updateChannel(body: UpdateChannelBody): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.patch(`${this.apiUrl}/${body.identifier}`, body, requestOptions));
  }

  deleteChannel(identifier: String): Promise<any> {
    const requestOptions = this.headersGenerator(true);
    return firstValueFrom(this.http.delete(`${this.apiUrl}/${identifier}`, requestOptions));
  }
  // Other functions for password recovery, profile update, etc. can be implemented here.
}
interface UpdateChannelBody {
  identifier: string;
  new_name?: string;
  new_description?: string;
  new_owner?: string;
  editors_array?: string[];
}
