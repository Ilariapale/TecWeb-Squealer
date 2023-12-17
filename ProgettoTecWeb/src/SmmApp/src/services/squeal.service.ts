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
