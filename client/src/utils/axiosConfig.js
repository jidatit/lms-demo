import axios from 'axios';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { installMockAdapter } from '../mocks/adapter';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_APP_BASE_URL}`,
  withCredentials: true
});
const ENCRYPTION_KEY = import.meta.env.REACT_APP_ENCRYPTION_KEY || 'your-secure-encryption-key';

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const encryptedToken = Cookies.get('token');
    if (encryptedToken) {
      const token = decryptData(encryptedToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

installMockAdapter(axiosInstance);

export default axiosInstance;
