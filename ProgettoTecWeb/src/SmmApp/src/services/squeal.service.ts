// services/rest.js
import axios from 'axios';

const rest = axios.create({
  // This is the base path to the API
  baseURL: '/squeals'
});

const generateHeaders = (authenticated: boolean) => {
  if (!authenticated) {
    return new axios.AxiosHeaders();
  }
  const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
  return new axios.AxiosHeaders().set('Authorization', `${token}`);
};

// This is a function
export const getSqueal = async (identifier: string) => {
  try {
    const headers = generateHeaders(true);
    return (await rest.get(`${identifier}`, { headers })).data;
  } catch (err: any) {
    console.error();

    throw new Error(err.message);
  }
};

export const postSqueal = async (
  vip_id: string,
  content: string,
  recipients?: object,
  content_type?: 'text' | 'image' | 'video' | 'position'
) => {
  try {
    const headers = generateHeaders(true);
    const body: { [key: string]: any } = { content };
    recipients
      ? (body['recipients'] = recipients)
      : (body['recipients'] = { users: [], channels: [], keywords: [] });
    if (content_type) body['content_type'] = content_type;
    if (vip_id) body['vip_id'] = vip_id;
    return (await rest.post('', body, { headers })).data;
  } catch (err: any) {
    console.error();

    throw new Error(err.message);
  }
};

export const getPrices = async () => {
  try {
    const headers = generateHeaders(false);
    return (await rest.get('prices', { headers })).data;
  } catch (err: any) {
    console.error();

    throw new Error(err.message);
  }
};

//postSqueal(
//    content: string,
//    recipients?: object,
//    content_type?: ContentType,
//    is_scheduled?: boolean,
//    schedule_type?: string,
//    schedule_options?: object
//  ): Promise<any> {
//    const requestOptions = this.headersGenerator(true);
//    const body: { [key: string]: any } = { content };
//    recipients
//      ? (body['recipients'] = recipients)
//      : (body['recipients'] = {
//          users: [],
//          channels: [],
//          keywords: [],
//        });
//    if (content_type) body['content_type'] = content_type;
//    if (is_scheduled) {
//      body['is_scheduled'] = is_scheduled;
//      body['schedule_type'] = schedule_type;
//      if (schedule_options) {
//        const options: { [key: string]: any } = schedule_options;
//        body['tick_rate'] = options['tick_rate'] || '';
//        body['repeat'] = options['repeat'] || '';
//        body['scheduled_date'] = options['scheduled_date'] || '';
//      }
//      return firstValueFrom(this.http.post(`${this.apiUrl}/scheduled`, body, requestOptions));
//    }
//    return firstValueFrom(this.http.post(`${this.apiUrl}/`, body, requestOptions));
//  }
