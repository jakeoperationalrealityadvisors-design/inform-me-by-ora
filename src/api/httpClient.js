import { appParams } from '@/lib/app-params';

class HttpError extends Error {
  constructor(message, { status, data, response } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    this.response = response;
  }
}

const isFileLike = (value) => {
  if (!value) return false;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  return false;
};

const buildFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
      return;
    }
    formData.append(key, value);
  });
  return formData;
};

const buildQueryString = (query) => {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }
    if (typeof value === 'object') {
      params.set(key, JSON.stringify(value));
      return;
    }
    params.set(key, String(value));
  });
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

const normalizeUrl = (baseUrl, path, query) => {
  const queryString = buildQueryString(query);
  if (!baseUrl) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedPath}${queryString}`;
  }
  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}${queryString}`;
};

const extractResponseData = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

const createHttpClient = ({ baseUrl, appId, token, functionsVersion, role } = {}) => {
  const buildHeaders = (customHeaders) => {
    const headers = new Headers(customHeaders || {});
    if (appId) headers.set('X-App-Id', appId);
    if (functionsVersion) headers.set('X-Functions-Version', functionsVersion);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (role) headers.set('X-Client-Role', role);
    return headers;
  };

  const request = async (path, options = {}) => {
    const { method = 'GET', body, headers, query, signal } = options;
    const url = normalizeUrl(baseUrl, path, query);
    const requestHeaders = buildHeaders(headers);
    const isGetLike = ['GET', 'HEAD'].includes(method.toUpperCase());

    let requestBody;
    if (!isGetLike && body !== undefined) {
      if (body instanceof FormData) {
        requestBody = body;
      } else if (typeof body === 'object' && Object.values(body).some(isFileLike)) {
        requestBody = buildFormData(body);
      } else {
        requestHeaders.set('Content-Type', 'application/json');
        requestBody = JSON.stringify(body);
      }
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal
    });

    const data = await extractResponseData(response);
    if (!response.ok) {
      const message =
        (data && typeof data === 'object' && data.message) ||
        response.statusText ||
        'Request failed';
      throw new HttpError(message, { status: response.status, data, response });
    }

    return data;
  };

  const createEntityClient = (entityName) => {
    const entityPath = `/api/entities/${encodeURIComponent(entityName)}`;
    return {
      list: (sort, limit, options) =>
        request(entityPath, {
          method: 'GET',
          query: { sort, limit },
          ...options
        }),
      filter: (filters, sort, limit, options) =>
        request(`${entityPath}/filter`, {
          method: 'POST',
          body: { filters, sort, limit },
          ...options
        }),
      create: (data, options) =>
        request(entityPath, { method: 'POST', body: data, ...options }),
      update: (id, data, options) =>
        request(`${entityPath}/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: data,
          ...options
        }),
      delete: (id, options) =>
        request(`${entityPath}/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          ...options
        })
    };
  };

  const client = {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
    entities: new Proxy(
      {},
      {
        get: (_target, prop) => createEntityClient(String(prop))
      }
    ),
    functions: {
      invoke: (name, payload, options) =>
        request(`/api/functions/${encodeURIComponent(name)}`, {
          method: 'POST',
          body: payload,
          ...options
        })
    },
    integrations: {
      Core: new Proxy(
        {},
        {
          get: (_target, prop) => (payload, options) =>
            request(`/api/integrations/core/${encodeURIComponent(String(prop))}`, {
              method: 'POST',
              body: payload,
              ...options
            })
        }
      )
    },
    auth: {
      me: (options) => request('/api/auth/me', { method: 'GET', ...options }),
      updateMe: (payload, options) =>
        request('/api/auth/me', { method: 'PATCH', body: payload, ...options }),
      loginWithRedirect: (redirectUrl) => {
        const url = `/api/auth/login?redirect=${encodeURIComponent(
          redirectUrl || window.location.href
        )}`;
        window.location.assign(url);
      },
      logout: async (redirectUrl) => {
        try {
          await request('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.warn('Logout request failed', error);
        }
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('app_access_token');
          window.localStorage.removeItem('token');
        }
        if (redirectUrl) {
          window.location.assign(redirectUrl);
        }
      }
    },
    users: {
      inviteUser: (email, roleName, options) =>
        request('/api/users/invite', {
          method: 'POST',
          body: { email, role: roleName },
          ...options
        })
    },
    connectors: {
      getAccessToken: (provider, options) =>
        request(`/api/connectors/${encodeURIComponent(provider)}/token`, {
          method: 'GET',
          ...options
        })
    }
  };

  client.asServiceRole = role === 'service'
    ? client
    : createHttpClient({ baseUrl, appId, token, functionsVersion, role: 'service' });

  return client;
};

export const httpClient = createHttpClient({
  baseUrl: appParams.apiBaseUrl,
  appId: appParams.appId,
  token: appParams.token,
  functionsVersion: appParams.functionsVersion
});

export { createHttpClient, HttpError };
