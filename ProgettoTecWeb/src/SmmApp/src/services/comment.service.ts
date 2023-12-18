// services/rest.js
import axios from 'axios';

const rest = axios.create({
  // This is the base path to the API
  baseURL: '/comments'
});

const generateHeaders = (authenticated: boolean) => {
  if (!authenticated) {
    return new axios.AxiosHeaders();
  }
  const token = sessionStorage.getItem('Authorization') || localStorage.getItem('Authorization');
  return new axios.AxiosHeaders().set('Authorization', `${token}`);
};

export const getCommentSection = async (identifier: string, last_comment_loaded?: string) => {
  try {
    const headers = generateHeaders(true);
    let url = `/${identifier}`;
    if (last_comment_loaded) url += `?last_comment_loaded=${last_comment_loaded}`;
    return (await rest.get(url, { headers })).data;
  } catch (err: any) {
    console.error();

    throw new Error(err.message);
  }
};
