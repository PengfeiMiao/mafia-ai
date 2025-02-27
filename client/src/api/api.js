import {getCookie} from "@/store/CacheStore";

export const WS_URL = 'localhost:8000';
// const BASE_URL = 'http://localhost:8000';
const BASE_URL = '/api';

export const getMessages = async (sessions) => {
  return await commonApi(`${BASE_URL}/messages`, sessions, 'POST');
}

export const getSessions = async (user_id) => {
  return await commonApi(`${BASE_URL}/sessions?user_id=${user_id}`, {}, 'GET');
}

export const createSession = async (session) => {
  return await commonApi(`${BASE_URL}/session`, session, 'POST');
}

export const updateSession = async (session) => {
  return await commonApi(`${BASE_URL}/session`, session, 'PUT');
}

export const cleanSession = async (session_id) => {
  return await commonApi(`${BASE_URL}/session?session_id=${session_id}`, {}, 'GET');
}

export const getWebsites = async () => {
  return await commonApi(`${BASE_URL}/websites`, {}, 'GET');
}

export const createWebsite = async (website) => {
  return await commonApi(`${BASE_URL}/website`, website, 'POST');
}

export const updateWebsite = async (website) => {
  return await commonApi(`${BASE_URL}/website`, website, 'PUT');
}

export const deleteWebsite = async (website_id) => {
  return await commonApi(`${BASE_URL}/website?website_id=${website_id}`, {}, 'DELETE');
}

export const getFiles = async () => {
  return await commonApi(`${BASE_URL}/files`, {}, 'GET');
}

export const deleteFiles = async (file_id) => {
  return await commonApi(`${BASE_URL}/file?file_id=${file_id}`, {}, 'DELETE');
}

export const getProxyPage = async (url, method) => {
  return await commonApi(`${BASE_URL}/proxy`, {url, method}, 'POST');
}

export const uploadAttachment = async (session_id, attachments) => {
  return await uploadApi(`${BASE_URL}/upload?session_id=${session_id}`, attachments, 'POST');
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
  if (!options) {
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

async function uploadApi(url, files, method) {
  let form = new FormData();
  for (let file of files) {
    form.append('files', file);
  }
  let options = {
    method: method,
    body: form
  };

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
