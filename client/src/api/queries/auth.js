import { useMutation } from '@tanstack/react-query';
import apiClient from '../client';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/auth/login', payload);
      return response.data.data; // Extract { accessToken, refreshToken, user }
    }
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async (refreshToken) => {
      const response = await apiClient.post('/auth/logout', { refreshToken });
      return response.data; // Return { success, message }
    }
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async (refreshToken) => {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data.data; // Extract { accessToken, user }
    }
  });
};

export const useInitiatePasswordless = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await apiClient.post('/auth/passwordless/initiate', { email });
      return response.data.data; // Extract { message, userId, role, signInType }
    }
  });
};

export const useVerifyPasswordless = () => {
  return useMutation({
    mutationFn: async ({ userId, otp }) => {
      const response = await apiClient.post('/auth/passwordless/verify', { userId, otp });
      return response.data.data; // Extract { accessToken, refreshToken, user }
    }
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: async ({ userId, purpose }) => {
      const response = await apiClient.post('/otps/resend', { userId, purpose });
      return response.data.data; // Extract { accessToken, refreshToken, user }
    }
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await apiClient.post('otps/forgot-password', { email });
      return response.data; // Extract { success, message }
    }
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: async ({ userId, purpose }) => {
      const response = await apiClient.post('otps/resend', { userId, purpose });
      return response.data; // Extract { success, message }
    }
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: async ({ userId, otp, password }) => {
      const response = await apiClient.post('otps/set-password', { userId, password });
      return response.data; // Extract { success, message }
    }
  });
};

export const useResetVerify = () => {
  return useMutation({
    mutationFn: async ({ userId, otp }) => {
      const response = await apiClient.post('otps/verify', { userId, otp });
      return response.data;
    }
  });
};
export const useMicrosoftLogin = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.get('/auth/microsoft');
      return response.data.data; // Extract { authorizationUrl }
    },
    onSuccess: (data) => {
      // Automatically redirect to Microsoft authorization URL
      window.location.href = data.authorizationUrl;
    },
    onError: (error) => {
      console.error('Microsoft login initiation failed:', error);
      throw error;
    }
  });
};
