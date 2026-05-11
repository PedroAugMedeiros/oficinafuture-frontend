import axios from 'axios';
import { authService } from './auth';
import { BASE_URL } from './config';

const BASE_URL_WITH_SLASH = BASE_URL + '/';


const apiClient = axios.create({
  baseURL: BASE_URL_WITH_SLASH,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor de REQUEST — anexa Bearer token
apiClient.interceptors.request.use(async (config) => {
  const token = await authService.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de RESPONSE — renova token em caso de 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newToken = await authService.refreshTokens();
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        // Refresh expirado ou falhou — faz logout e notifica a app
        await authService.logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
