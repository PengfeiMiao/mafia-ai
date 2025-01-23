import {getCookie} from "@/store/CacheStore";

export const WS_URL = 'localhost:8000';
// const BASE_URL = 'http://localhost:8000';
const BASE_URL = '/api';

export const get_messages = async (sessions) => {
   return await rawApi(`${BASE_URL}/messages`, sessions, 'POST');
}

export const completions = async (message) => {
  return await rawApi(`${BASE_URL}/completions`, message, 'POST');
};

export const loginApi = async (payload) => {
  return await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
};

function fetchApi(url, options) {
  let token = preAuth();
  if (!token) {
    return;
  }
  if(!options) {
    options = {};
  }
  let {headers = {}} = options;
  options.headers = {...headers, 'api-key': token};
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('An error occurred:', error);
      // alert('An error occurred:' + error);
    });
}

async function rawApi(url, payload, method) {
  return await fetchApi(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

function preAuth() {
  let token = getCookie('token');
  if (!token && window.location.pathname !== '/login') {
    window.location.assign('/login');
    return '';
  }
  return token;
}
