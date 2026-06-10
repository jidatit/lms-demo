const STORE_KEY = 'lms_demo_data';

export function getStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStore(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function mergeStore(partial) {
  const current = getStore() || {};
  setStore({ ...current, ...partial });
}

export function updateStore(updater) {
  const current = getStore() || {};
  setStore(typeof updater === 'function' ? updater(current) : { ...current, ...updater });
}

export function resetStore() {
  localStorage.removeItem(STORE_KEY);
}

export function isStoreEmpty() {
  return !getStore();
}
