import {getCookie, setCookie} from "@/store/CacheStore";

// const BASE_URL = 'http://localhost:8000';
const BASE_URL = `${window.location.origin}/api`;

export const getWsURL = () => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const url = window.location.hostname === 'localhost' ? 'localhost:8000' : `${window.location.host}/api`;
  return `${protocol}://${url}`;
}

export const getMessages = async (sessions) => {
  return await commonApi(`${BASE_URL}/messages`, sessions, 'POST');
}

export const getSessions = async () => {
  return await commonApi(`${BASE_URL}/sessions`, {}, 'GET');
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

export const getWebsites = async (keyword, website_ids) => {
  return await commonApi(`${BASE_URL}/websites?keyword=${keyword}&website_ids=${website_ids}`, {}, 'GET');
}

export const previewWebsite = async (website_id) => {
  return await commonApi(`${BASE_URL}/website?website_id=${website_id}`, {}, 'GET');
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

export const createRag = async (rag) => {
  return await commonApi(`${BASE_URL}/rag`, rag, 'POST');
}

export const updateRag = async (rag) => {
  return await commonApi(`${BASE_URL}/rag`, rag, 'PUT');
}

export const deleteRag = async (rag_id) => {
  return await commonApi(`${BASE_URL}/rag?rag_id=${rag_id}`, {}, 'DELETE');
}

export const getRags = async (state) => {
  return await commonApi(`${BASE_URL}/rags?state=${state}`, {}, 'GET');
}

export const loadRag = async (rag_id) => {
  return await commonApi(`${BASE_URL}/rag?rag_id=${rag_id}`, {}, 'GET');
}

export const getFiles = async (keyword, file_ids) => {
  return await commonApi(`${BASE_URL}/files?keyword=${keyword}&file_ids=${file_ids}`, {}, 'GET');
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

export const registerApi = async (payload) => {
  return await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
};

export const sendCodeApi = async (payload) => {
  return await fetch(`${BASE_URL}/send_code`, {
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
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('An error occurred:', error);
      if (String(error).includes('status 401') && window.location.pathname !== '/login') {
        setCookie('token', '');
        window.location.assign('/login');
      }
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
