import { routeRequest } from './handlers';
import { buildGophishCampaigns } from './handlers/helpers';
import { getSeedStore } from './seed';
import { getCurrentUser, normalizePath } from './utils';

function createMockAdapter(instance) {
  return async (config) => {
    const baseURL = config.baseURL || instance.defaults.baseURL || '';
    const url = config.url || '';
    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
    const path = normalizePath(fullUrl, baseURL);

    config._mockPath = path;

    try {
      const data = await routeRequest(config);
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      };
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.message || 'Mock request failed';
      return Promise.reject({
        message,
        response: {
          status,
          data: error.response?.data || { error: { message, status } }
        },
        config
      });
    }
  };
}

export function installMockAdapter(axiosInstance) {
  axiosInstance.defaults.adapter = createMockAdapter(axiosInstance);
}

export function installFetchMock() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;

    if (url.includes('/api/campaigns/') || url.includes('/api/groups/') || url.includes('gophish')) {
      const method = (init.method || 'GET').toUpperCase();
      let body = {};
      if (init.body) {
        try {
          body = JSON.parse(init.body);
        } catch {
          body = {};
        }
      }

      const path = normalizePath(url);
      let data = await routeRequest({ method, _mockPath: path, data: body, params: {} });

      if (path === '/api/campaigns/summary/' && method === 'GET') {
        const store = getSeedStore();
        const email = getCurrentUser()?.email || '';
        data = buildGophishCampaigns(store, email);
      }

      return {
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data)
      };
    }

    return originalFetch(input, init);
  };
}
