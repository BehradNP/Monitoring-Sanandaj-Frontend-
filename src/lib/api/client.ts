import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

const DEFAULT_API_BASE_URL = "/api-proxy/v1";
const DEFAULT_TIMEOUT = 90000;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || DEFAULT_API_BASE_URL;

const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT || DEFAULT_TIMEOUT);

function isBrowser() {
  return typeof window !== "undefined";
}

function getToken() {
  if (!isBrowser()) return null;

  return localStorage.getItem("token");
}

function clearAuthAndRedirect() {
  if (!isBrowser()) return;

  localStorage.removeItem("token");
  localStorage.removeItem("userProfile");

  const currentPath = window.location.pathname;

  if (currentPath !== "/Login" && currentPath !== "/login") {
    window.location.href = "/Login";
  }
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function normalizeApiPath(url?: string) {
  if (!url) return url;

  if (isAbsoluteUrl(url)) return url;

  let normalizedUrl = url.trim();

  if (!normalizedUrl.startsWith("/")) {
    normalizedUrl = `/${normalizedUrl}`;
  }

  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "").toLowerCase();

  if (cleanBaseUrl.endsWith("/v1") && normalizedUrl.toLowerCase().startsWith("/v1/")) {
    normalizedUrl = normalizedUrl.replace(/^\/v1/i, "");
  }

  if (cleanBaseUrl.endsWith("/api/v1") && normalizedUrl.toLowerCase().startsWith("/api/v1/")) {
    normalizedUrl = normalizedUrl.replace(/^\/api\/v1/i, "");
  }

  if (cleanBaseUrl.endsWith("/api-proxy/v1") && normalizedUrl.toLowerCase().startsWith("/v1/")) {
    normalizedUrl = normalizedUrl.replace(/^\/v1/i, "");
  }

  return normalizedUrl;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.url = normalizeApiPath(config.url);

  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthAndRedirect();
    }

    return Promise.reject(error);
  }
);

export function jsonPatchConfig(
  params?: Record<string, string | number | boolean | null | undefined>
): AxiosRequestConfig {
  return {
    params,
    headers: {
      "Content-Type": "application/json-patch+json",
      Accept: "application/json, text/plain, */*",
    },
  };
}

export function apiGet<T>(url: string, config?: AxiosRequestConfig) {
  return apiClient.get<T>(url, config);
}

export function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return apiClient.post<T>(url, data, config);
}

export function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return apiClient.put<T>(url, data, config);
}

export function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return apiClient.patch<T>(url, data, config);
}

export function apiDelete<T>(url: string, config?: AxiosRequestConfig) {
  return apiClient.delete<T>(url, config);
}

export default apiClient;