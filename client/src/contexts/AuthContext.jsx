import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLogin, useLogout, useRefreshToken } from '../api/queries/auth';
import { setLogoutCallback, setRefreshTokenCallback } from '../api/client';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { useQueryClient } from '@tanstack/react-query';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secure-encryption-key';

// Utility functions for encryption/decryption
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return null;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { mutateAsync: loginMutation } = useLogin();
  const { mutateAsync: logoutMutation } = useLogout();
  const { mutateAsync: refreshTokenMutation } = useRefreshToken();
  const queryClient = useQueryClient();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        let token = window.localStorage.getItem('accessToken');
        let refreshToken = window.localStorage.getItem('refreshToken');
        let user = window.localStorage.getItem('user');
        let storedUserRoles = window.localStorage.getItem('userRoles');

        // Try cookies if localStorage is empty
        if (!token) token = Cookies.get('accessToken');
        if (!refreshToken) refreshToken = Cookies.get('refreshToken');
        if (!user) user = Cookies.get('user');
        if (!storedUserRoles) storedUserRoles = Cookies.get('userRoles');

        // Decrypt data
        token = token ? decryptData(token) : null;
        refreshToken = refreshToken ? decryptData(refreshToken) : null;
        user = user ? decryptData(user) : null;
        storedUserRoles = storedUserRoles ? decryptData(storedUserRoles) : null;

        if (token && refreshToken && user) {
          setCurrentUser(user);
          setUserRole(user.role);
          // Attempt to refresh token to validate session
          refreshTokenMutation(refreshToken)
            .then(({ accessToken }) => {
              const encryptedAccessToken = encryptData(accessToken);
              window.localStorage.setItem('accessToken', encryptedAccessToken);
              Cookies.set('accessToken', encryptedAccessToken, {
                secure: true,
                sameSite: 'strict',
                expires: 1 // 1 day
              });
              setCurrentUser(user); // Reuse existing user
              setUserRole(user.role);
              setUserRoles([{ role: user.role, id: user.id }]);
            })
            .catch((error) => {
              console.error('Session validation failed:', error);
              logout();
            });
        }

        if (storedUserRoles) {
          setUserRoles(storedUserRoles);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register callbacks with API client
  useEffect(() => {
    setLogoutCallback(() => logout());
    setRefreshTokenCallback((refreshToken) => refreshToken(refreshToken));
  }, []);

  // Login function for password-based login
  const login = async ({ email, password }) => {
    try {
      const { accessToken, refreshToken, user } = await loginMutation({
        email,
        password
      });

      const encryptedAccessToken = encryptData(accessToken);
      const encryptedRefreshToken = encryptData(refreshToken);
      const encryptedUser = encryptData(user);
      const roles = [{ role: user.role, id: user.id }];
      const encryptedRoles = encryptData(roles);

      // Store in localStorage
      window.localStorage.setItem('accessToken', encryptedAccessToken);
      window.localStorage.setItem('refreshToken', encryptedRefreshToken);
      window.localStorage.setItem('user', encryptedUser);
      window.localStorage.setItem('userRoles', encryptedRoles);

      // Store in cookies
      Cookies.set('accessToken', encryptedAccessToken, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      Cookies.set('refreshToken', encryptedRefreshToken, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      Cookies.set('user', encryptedUser, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      Cookies.set('userRoles', encryptedRoles, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });

      setCurrentUser(user);
      setUserRole(user.role);
      setUserRoles(roles);
      setLoading(false);
    } catch (error) {
      console.error('Login failed:', error.message);
      throw new Error(`Login failed: ${error.message}`);
    }
  };

  // Passwordless login function
  const passwordlessLogin = async ({ accessToken, refreshToken, user }) => {
    try {
      const encryptedAccessToken = encryptData(accessToken);
      const encryptedRefreshToken = encryptData(refreshToken);
      const encryptedUser = encryptData(user);
      const roles = [{ role: user.role, id: user.id }];
      const encryptedRoles = encryptData(roles);

      // Store in localStorage
      window.localStorage.setItem('accessToken', encryptedAccessToken);
      window.localStorage.setItem('refreshToken', encryptedRefreshToken);
      window.localStorage.setItem('user', encryptedUser);
      window.localStorage.setItem('userRoles', encryptedRoles);

      // Store in cookies
      Cookies.set('accessToken', encryptedAccessToken, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      Cookies.set('refreshToken', encryptedRefreshToken, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      Cookies.set('user', encryptedUser, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      Cookies.set('userRoles', encryptedRoles, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });

      setCurrentUser(user);
      setUserRole(user.role);
      setUserRoles(roles);
      setLoading(false);
    } catch (error) {
      console.error('Passwordless login failed:', error);
      throw new Error('Passwordless login failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      let refreshToken = window.localStorage.getItem('refreshToken');
      if (refreshToken) {
        refreshToken = decryptData(refreshToken);
      } else {
        refreshToken = Cookies.get('refreshToken');
        if (refreshToken) refreshToken = decryptData(refreshToken);
      }
      if (refreshToken) {
        await logoutMutation(refreshToken);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear localStorage
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('userRoles');
      // Clear cookies
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
      Cookies.remove('userRoles');
      // Clear state
      setCurrentUser(null);
      setUserRole(null);
      setUserRoles([]);

      // 🔥 Optional: Clear query caches if using React Query / SWR / Redux
      queryClient.clear();
    }
  };

  // Refresh token function
  const refreshToken = async (refreshToken) => {
    try {
      const data = await refreshTokenMutation(refreshToken);
      const encryptedAccessToken = encryptData(data.accessToken);
      // Store in localStorage
      window.localStorage.setItem('accessToken', encryptedAccessToken);
      // Store in cookies
      Cookies.set('accessToken', encryptedAccessToken, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      // Reuse existing user and roles
      let user = window.localStorage.getItem('user');
      if (!user) user = Cookies.get('user');
      user = user ? decryptData(user) : null;
      let roles = window.localStorage.getItem('userRoles');
      if (!roles) roles = Cookies.get('userRoles');
      roles = roles ? decryptData(roles) : [{ role: user?.role, id: user?.id }];
      setCurrentUser(user);
      setUserRole(user?.role);
      setUserRoles(roles);
      return data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  // Update user roles (e.g., from a /roles endpoint)
  const updateUserRoles = (rolesArray) => {
    try {
      const encryptedRoles = encryptData(rolesArray);
      window.localStorage.setItem('userRoles', encryptedRoles);
      Cookies.set('userRoles', encryptedRoles, {
        secure: true,
        sameSite: 'strict',
        expires: 1 // 1 day
      });
      setUserRoles(rolesArray);
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw new Error('Failed to update user roles');
    }
  };

  // Select a role from userRoles
  const selectUserRole = (role) => {
    try {
      const selectedRole = userRoles.find((r) => r.role === role);
      if (selectedRole) {
        const updatedUser = {
          ...currentUser,
          role: selectedRole.role,
          id: selectedRole.id
        };
        const encryptedUser = encryptData(updatedUser);
        window.localStorage.setItem('user', encryptedUser);
        Cookies.set('user', encryptedUser, {
          secure: true,
          sameSite: 'strict',
          expires: 1 // 1 day
        });
        setCurrentUser(updatedUser);
        setUserRole(selectedRole.role);
      }
    } catch (error) {
      console.error('Error selecting user role:', error);
      throw new Error('Failed to select user role');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        currentUser,
        userRole,
        userRoles,
        login,
        passwordlessLogin,
        logout,
        selectUserRole,
        updateUserRoles
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
