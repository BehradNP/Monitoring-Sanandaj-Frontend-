import axios, { type AxiosRequestConfig } from "axios";

const DEFAULT_API_BASE_URL = "https://msfmapi.sanandaj.ir/api/v1";

function cleanUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function getApiBaseUrl() {
  return cleanUrl(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL);
}

function baseUrlHasVersion(baseURL?: string) {
  if (!baseURL) return false;
  return /\/v\d+$/i.test(cleanUrl(baseURL));
}

function normalizeRequestUrl(url?: string, baseURL?: string) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (!baseUrlHasVersion(baseURL)) return url;
  return url.replace(/^\/?v\d+(?=\/)/i, "");
}

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 90000),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  },
});

apiClient.interceptors.request.use((config) => {
  const baseURL = typeof config.baseURL === "string" ? config.baseURL : API_BASE_URL;
  config.url = normalizeRequestUrl(config.url, baseURL);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (typeof window !== "undefined" && status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export async function apiGet<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T = unknown, TBody = unknown>(url: string, data?: TBody, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T = unknown, TBody = unknown>(url: string, data?: TBody, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T = unknown, TBody = unknown>(url: string, data?: TBody, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export function jsonPatchConfig(params?: Record<string, unknown>): AxiosRequestConfig {
  return {
    params,
    headers: {
      "Content-Type": "application/json-patch+json",
    },
  };
}

export default apiClient;