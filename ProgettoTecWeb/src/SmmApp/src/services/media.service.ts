// services/rest.js
import axios from 'axios';

const rest = axios.create({
  // This is the base path to the API
  baseURL: '/media'
});

const generateHeaders = (authenticated: boolean) => {
  if (!authenticated) {
    return new axios.AxiosHeaders();
  }
  const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
  return new axios.AxiosHeaders().set('Authorization', `${token}`);
};

export const postImage = async (file: File) => {
  try {
    const headers = generateHeaders(true);
    const body = new FormData();
    body.append('image', file);
    return (await rest.post('/upload/image', body, { headers })).data;
  } catch (err: any) {
    console.error();

    throw new Error(err.message);
  }
};

export const postVideo = async (file: File) => {
  try {
    const headers = generateHeaders(true);
    const body = new FormData();
    body.append('video', file);
    return (await rest.post('/upload/video', body, { headers })).data;
  } catch (err: any) {
    console.error();

    throw new Error(err.message);
  }
};
