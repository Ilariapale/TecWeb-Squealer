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
    console.log(url);
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
    if (!user && !identifier) return;
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
