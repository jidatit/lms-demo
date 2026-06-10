import axios from 'axios';
import { installFetchMock, installMockAdapter } from './adapter';
import { initDemoReset } from './demoReset';
import { seedIfEmpty } from './seed';

export { seedIfEmpty, reseed } from './seed';
export { resetDemo, initDemoReset } from './demoReset';
export { getStore, setStore, mergeStore, resetStore } from './storage';
export { DEMO_USERS } from './data/seedData';
export { getDemoUserByRole, getDemoAuthTokens } from './handlers/auth';
export { DASHBOARD_PATHS } from './utils';
export { default as DemoRoleButtons } from './DemoRoleButtons';

export function initDemoMode() {
  seedIfEmpty();
  initDemoReset();
  installMockAdapter(axios);
  installFetchMock();
}

initDemoMode();
