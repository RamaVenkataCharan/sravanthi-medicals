import axios from 'axios';
import { Platform } from 'react-native';

// On Android emulator, localhost = 10.0.2.2
// On physical device, replace with your machine's LAN IP e.g. 192.168.1.x
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — could add auth token here later
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor — surface clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;
