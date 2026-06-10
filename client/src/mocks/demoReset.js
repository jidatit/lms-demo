import { reseed } from './seed';

const AUTH_KEYS = ['accessToken', 'refreshToken', 'user', 'userRoles', 'serviceToken', 'users'];

export function initDemoReset() {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      resetDemo();
    }
  });
}

export function resetDemo() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));

  const cookies = document.cookie.split(';');
  cookies.forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (AUTH_KEYS.includes(name)) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });

  localStorage.clear();
  reseed();
  window.location.href = '/login';
}
