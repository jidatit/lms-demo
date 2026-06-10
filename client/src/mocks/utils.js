import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secure-encryption-key';

export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 100));

export function randomDelay() {
  return delay(200 + Math.floor(Math.random() * 200));
}

export function createId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createFakeToken(userId) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      exp: Math.floor(Date.now() / 1000) + 86400 * 30
    })
  );
  return `${header}.${payload}.demo-signature`;
}

export function getCurrentUser() {
  try {
    const encrypted = localStorage.getItem('user');
    if (!encrypted) return null;
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

export function paginate(items, page = 1, limit = 10) {
  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const start = (p - 1) * l;
  const data = items.slice(start, start + l);
  return {
    data,
    pagination: {
      page: p,
      limit: l,
      total: items.length,
      totalPages: Math.ceil(items.length / l) || 1
    }
  };
}

export function requestedBy() {
  const user = getCurrentUser();
  return user ? { id: user.id, role: user.role } : { id: 'system', role: 'admin' };
}

export function success(data, extra = {}) {
  return { success: true, data, ...extra };
}

export function parseBody(data) {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (data instanceof FormData) {
    const obj = {};
    data.forEach((value, key) => {
      if (obj[key]) {
        obj[key] = Array.isArray(obj[key]) ? [...obj[key], value] : [obj[key], value];
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }
  return data;
}

export function normalizePath(url, baseURL = '') {
  let path = url || '';
  if (baseURL && path.startsWith(baseURL)) {
    path = path.slice(baseURL.length);
  }
  if (path.startsWith('http')) {
    try {
      path = new URL(path).pathname;
    } catch {
      // keep as-is
    }
  }
  path = path.split('?')[0];
  if (!path.startsWith('/')) path = `/${path}`;
  return path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

export const DASHBOARD_PATHS = {
  admin: '/dashboard/home',
  contributor: '/contrib_dashboard/home',
  groupLeader: '/groupleader_dashboard/home',
  subscriber: '/subscriber_dashboard',
  supportAgent: '/agent_dashboard/profile/user/personal'
};
