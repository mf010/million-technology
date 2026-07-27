const BASE_URL = 'http://localhost:8000/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

type RequestOptions = {
  method?: string;
  body?: FormData | Record<string, any> | null;
  headers?: Record<string, string>;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method ?? 'GET',
    headers,
    body: isFormData
      ? (options.body as FormData)
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  const data = await res.json();

  if (res.status === 401) {
    // Only clear token and redirect for expired/invalid session tokens.
    // Don't redirect if it's a login attempt (wrong password returns 401 too).
    const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');

    if (!isAuthEndpoint) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    // Throw the parsed backend response so callers get the real error message
    throw data;
  }

  if (!res.ok) {
    throw data;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: FormData | Record<string, any>) =>
    request<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body: FormData | Record<string, any>) =>
    request<T>(endpoint, { method: 'PUT', body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

