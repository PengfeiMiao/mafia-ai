import {getCookie} from "@/store/CacheStore";

export const WS_URL = 'localhost:8000';
// const BASE_URL = 'http://localhost:8000';
const BASE_URL = '/api';

export const get_messages = async (sessions) => {
   return await commonApi(`${BASE_URL}/messages`, sessions, 'POST');
}

export const get_sessions = async (user_id) => {
   return await commonApi(`${BASE_URL}/sessions?user_id=${user_id}`, {}, 'GET');
}

export const create_session = async (session) => {
  return await commonApi(`${BASE_URL}/session`, session, 'POST');
}

export const update_session = async (session) => {
  return await commonApi(`${BASE_URL}/session`, session, 'PUT');
}

// export const completions = async (message) => {
//   return await commonApi(`${BASE_URL}/completions`, message, 'POST');
// };

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

async function commonApi(url, payload, method) {
  let options = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (method !== 'GET') {
    options = {
      ...options,
      body: JSON.stringify(payload)
    }
  }
  return await fetchApi(url, options);
}

function preAuth() {
  let token = getCookie('token');
  if (!token && window.location.pathname !== '/login') {
    window.location.assign('/login');
    return '';
  }
  return token;
}
