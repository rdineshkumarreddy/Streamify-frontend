// frontend/src/api/config.js
export const API_BASE_URL = '/api';
export const API_TIMEOUT = 10000;

export const AXIOS_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
};