import axios from 'axios';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { installMockAdapter } from '../mocks/adapter';
import { seedIfEmpty } from '../mocks/seed';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secure-encryption-key';

// Utility function for decryption
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};

// Global callbacks for logout and token refresh
let logoutCallback = null;
let refreshTokenCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

export const setRefreshTokenCallback = (callback) => {
  refreshTokenCallback = callback;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add accessToken
apiClient.interceptors.request.use(
  (config) => {
    let accessToken = window.localStorage.getItem('accessToken');
    if (accessToken) {
      accessToken = decryptData(accessToken);
    } else {
      accessToken = Cookies.get('accessToken');
      if (accessToken) accessToken = decryptData(accessToken);
    }
    if (accessToken && config.headers) {
      accessToken = accessToken.replace(/^"|"$/g, ''); // <-- removes quotes
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const normalizedError = {
      message: 'An unexpected error occurred',
      status: 500
    };

    if (error.response) {
      const backendError = error.response.data?.error;
      normalizedError.status = backendError?.status || error.response.status;

      // Handle 404 errors - distinguish between ser not responding vs application 404s
      if (normalizedError.status === 404) {
        // If there's no backend error structure, it's likely the server/endpoint doesn't exist
        if (!error.response.data || !backendError) {
          normalizedError.message = 'Service temporarily unavailable. Please try again later.';
        } else {
          // Application-level 404 (user not found, resource not found, etc.)
          normalizedError.message = backendError.message || 'Resource not found';
        }
      }
      // Handle specific status codes with user-friendly messages
      else if (normalizedError.status === 429) {
        normalizedError.message = 'Too many attempts. Please try again after some time.';
      } else {
        normalizedError.message = backendError?.message || error.message;
      }

      // Handle 401 errors (Token expired or Invalid token)
      if (
        (normalizedError.status === 401 && normalizedError.message.includes('Token expired')) ||
        normalizedError.message.includes('Invalid token')
      ) {
        const originalRequest = error.config;
        if (refreshTokenCallback && !originalRequest._retry) {
          originalRequest._retry = true; // Prevent infinite retry loops
          try {
            let refreshToken = window.localStorage.getItem('refreshToken');
            if (refreshToken) {
              refreshToken = decryptData(refreshToken);
            } else {
              refreshToken = Cookies.get('refreshToken');
              if (refreshToken) refreshToken = decryptData(refreshToken);
            }
            if (!refreshToken) throw new Error('No refresh token available');
            const { accessToken } = await refreshTokenCallback(refreshToken);
            const encryptedAccessToken = CryptoJS.AES.encrypt(accessToken, ENCRYPTION_KEY).toString();
            window.localStorage.setItem('accessToken', encryptedAccessToken);
            Cookies.set('accessToken', encryptedAccessToken, {
              secure: true,
              sameSite: 'strict',
              expires: 1 // 1 day
            });
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest); // Retry original request
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            if (logoutCallback) {
              logoutCallback();
            }
            return Promise.reject(refreshError);
          }
        } else if (logoutCallback) {
          logoutCallback();
        }
      }
    } else if (error.request) {
      normalizedError.message = 'No response from server';
    } else {
      normalizedError.message = error.message;
    }

    return Promise.reject(normalizedError);
  }
);

seedIfEmpty();
installMockAdapter(apiClient);

export default apiClient;
