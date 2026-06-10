import { buildSeedStore } from './data/seedData';
import { getStore, setStore, isStoreEmpty } from './storage';

const SEED_VERSION = 4;

export function seedIfEmpty() {
  const storedVersion = localStorage.getItem('lms_demo_seed_version');
  if (!isStoreEmpty() && storedVersion === String(SEED_VERSION)) {
    return getStore();
  }
  const data = buildSeedStore();
  setStore(data);
  localStorage.setItem('lms_demo_seed_version', String(SEED_VERSION));
  return data;
}

export function reseed() {
  const data = buildSeedStore();
  setStore(data);
  localStorage.setItem('lms_demo_seed_version', String(SEED_VERSION));
  return data;
}

export function getSeedStore() {
  return getStore() || seedIfEmpty();
}
