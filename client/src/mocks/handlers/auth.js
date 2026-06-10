import { DEMO_USERS } from '../data/seedData';
import { getSeedStore } from '../seed';
import { createFakeToken, getCurrentUser, randomDelay } from '../utils';

export async function handleAuth(method, path, body) {
  await randomDelay();
  const store = getSeedStore();

  if (method === 'POST' && path === '/auth/login') {
    const { email, password } = body;
    const user = store.users.find((u) => u.email === email?.toLowerCase());
    if (!user) throw mockError('Invalid email or password', 401);
    if (password && password !== 'demo') throw mockError('Invalid email or password', 401);
    return {
      data: {
        accessToken: createFakeToken(user.id),
        refreshToken: createFakeToken(`${user.id}-refresh`),
        user: sanitizeUser(user)
      }
    };
  }

  if (method === 'POST' && path === '/auth/logout') {
    return { success: true, message: 'Logged out successfully' };
  }

  if (method === 'POST' && path === '/auth/refresh') {
    const current = getCurrentUser();
    const user = current ? store.users.find((u) => u.id === current.id) : store.users[0];
    return {
      data: {
        accessToken: createFakeToken(user?.id || 'demo'),
        user: sanitizeUser(user)
      }
    };
  }

  if (method === 'POST' && path === '/auth/passwordless/initiate') {
    const user = store.users.find((u) => u.email === body.email?.toLowerCase());
    if (!user) throw mockError('Unable to find or access your account', 404);
    return {
      data: {
        message: 'OTP sent successfully',
        userId: user.id,
        role: user.role,
        signInType: user.signInType || 'passwordless'
      }
    };
  }

  if (method === 'POST' && path === '/auth/passwordless/verify') {
    const user = store.users.find((u) => u.id === body.userId);
    if (!user || body.otp !== '123456') throw mockError('Invalid OTP or OTP expired', 401);
    return {
      data: {
        accessToken: createFakeToken(user.id),
        refreshToken: createFakeToken(`${user.id}-refresh`),
        user: sanitizeUser(user)
      }
    };
  }

  if (method === 'POST' && (path === '/otps/resend' || path === '/otps/resend')) {
    return { data: { success: true, message: 'OTP sent successfully' }, success: true, message: 'OTP sent successfully' };
  }

  if (method === 'POST' && path === '/otps/forgot-password') {
    const user = store.users.find((u) => u.email === body.email?.toLowerCase());
    if (!user) throw mockError('User not found', 404);
    return {
      success: true,
      message: 'Reset OTP sent successfully',
      userId: user.id,
      role: user.role,
      signInType: user.signInType
    };
  }

  if (method === 'POST' && path === '/otps/set-password') {
    return { success: true, message: 'Password reset successfully' };
  }

  if (method === 'POST' && path === '/otps/verify') {
    if (body.otp !== '123456') throw mockError('Invalid OTP or OTP expired', 401);
    return { success: true, message: 'OTP verified' };
  }

  if (method === 'GET' && path === '/auth/microsoft') {
    return { data: { authorizationUrl: '/login?demo=microsoft' } };
  }

  return null;
}

export function getDemoUserByRole(role) {
  return DEMO_USERS[role] ? sanitizeUser(DEMO_USERS[role]) : null;
}

export function getDemoAuthTokens(user) {
  return {
    accessToken: createFakeToken(user.id),
    refreshToken: createFakeToken(`${user.id}-refresh`),
    user
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

function mockError(message, status = 400) {
  const err = new Error(message);
  err.response = { status, data: { error: { message, status } } };
  return err;
}
