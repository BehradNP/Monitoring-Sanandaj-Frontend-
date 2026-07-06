import axios from "axios";
import type { ApiResponse, AuthUserProfile, LoginPayload, LoginResult } from "../types/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://msfmapi.sanandaj.ir/api/v1").trim().replace(/\/+$/, "");

function baseUrlHasVersion(baseURL?: string) {
  if (!baseURL) return false;
  return /\/v\d+$/i.test(baseURL.trim().replace(/\/+$/, ""));
}

function normalizeRequestUrl(url?: string, baseURL?: string) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (!baseURL || !baseUrlHasVersion(baseURL)) return url;
  return url.replace(/^\/?v\d+(?=\/)/i, "");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 90000),
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

apiClient.interceptors.request.use((config) => {
  config.url = normalizeRequestUrl(config.url, config.baseURL || API_BASE_URL);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
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

function extractData<T>(response: ApiResponse<T> | unknown): T | null {
  const raw = response as ApiResponse<T>;
  return raw?.data ?? raw?.Data ?? null;
}

function isApiSuccess(data: ApiResponse | unknown) {
  const raw = data as ApiResponse;
  return !(raw?.issuccess === false || raw?.isSuccess === false || raw?.statuscode === 2 || raw?.statusCode === 2);
}

function getApiMessage(data: ApiResponse | unknown) {
  const raw = data as ApiResponse;
  return raw?.message || raw?.Message || "عملیات با خطا مواجه شد.";
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    const response = await axios.post("/api/auth/login", {
      username: payload.username,
      password: payload.password,
    });

    const result = response.data as ApiResponse & { token?: string };

    if (!isApiSuccess(result)) {
      throw new Error(getApiMessage(result));
    }

    if (!result.token) {
      throw new Error("توکن ورود از سمت سرور دریافت نشد.");
    }

    return {
      token: result.token,
      raw: result,
    };
  },

  async getProfile(): Promise<AuthUserProfile | null> {
    const response = await apiClient.get<ApiResponse<AuthUserProfile>>("/v1/User/UserProfile");
    const result = response.data;

    if (!isApiSuccess(result)) {
      throw new Error(getApiMessage(result));
    }

    return extractData<AuthUserProfile>(result);
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");
      window.location.replace("/login");
    }
  },
};