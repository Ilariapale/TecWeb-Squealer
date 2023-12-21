// services/rest.js
import axios from 'axios';

const rest = axios.create({
  // This is the base path to the API
  baseURL: '/users'
});

const generateHeaders = (authenticated: boolean) => {
  if (!authenticated) {
    return new axios.AxiosHeaders();
  }
  const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
  return new axios.AxiosHeaders().set('Authorization', `${token}`);
};

// This is a function
export const getUsername = async (identifier?: string) => {
  try {
    const headers = generateHeaders(true);
    const url = identifier ? `/username?identifier=${identifier}` : `/username`;
    //console.log(url);
    return (await rest.get(url, { headers })).data;
  } catch (err: any) {
    console.error(err);

    throw new Error(err.message);
  }
};

export const getSMMrequests = async () => {
  try {
    const headers = generateHeaders(true);
    return (await rest.get('/smm-request-list', { headers })).data;
  } catch (err: any) {
    console.error(err);
    throw new Error(err.message);
  }
};

export const getUser = async (identifier?: string) => {
  try {
    const headers = generateHeaders(true);
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '');
    if (!user && !identifier) {
      throw new Error('No user found');
    }
    return (await rest.get(`/${identifier ? identifier : user?.username}`, { headers })).data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const getUserStatistics = async (identifier: string) => {
  try {
    const headers = generateHeaders(true);
    return (await rest.get(`/statistics/${identifier}`, { headers })).data;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const manageSMMrequest = async (identifier: string, action: 'accept' | 'decline') => {
  //users/VIP/:identifier?action=accept
  try {
    const headers = generateHeaders(true);
    return await rest.patch(`/VIP/${identifier}?action=${action}`, {}, { headers });
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const removeVIP = async (identifier: string) => {
  try {
    const headers = generateHeaders(true);
    return await rest.delete(`/VIP/${identifier}`, { headers });
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const addCharacters = async (tier: string, identifier?: string, options?: any) => {
  try {
    let body: any = { tier };

    identifier ? (body['identifier'] = identifier) : null;
    options?.daily ? (body['char_quota_daily'] = options.daily) : null;
    options?.weekly ? (body['char_quota_weekly'] = options.weekly) : null;
    options?.monthly ? (body['char_quota_monthly'] = options.monthly) : null;
    const headers = generateHeaders(true);
    return await rest.patch('/characters', body, { headers });
  } catch (err: any) {
    throw new Error(err.message);
  }
};
