import axios from "axios";
import { apiClient } from "@/lib/api/client";

export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUserProfile = {
  id?: number;
  guid?: string;
  userName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
};

export type LoginResult = {
  role?: string;
  access_token: string;
  accessToken: string;
  token: string;
  refresh_token?: string;
  refreshToken?: string;
  token_type?: string;
  tokenType?: string;
  expires_in?: string | number;
  expiresIn?: string | number;
  expires?: string | number | null;
  guid?: string;
  user?: AuthUserProfile | null;
  raw?: unknown;
};

type LoginApiResponse = {
  data?: unknown;
  Data?: unknown;
  isSuccess?: boolean;
  issuccess?: boolean;
  statusCode?: number;
  statuscode?: number;
  message?: string | null;
  Message?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getString(
  item: Record<string, unknown>,
  keys: string[],
  fallback = ""
) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function getInnerData(responseData: unknown) {
  const root = asRecord(responseData);

  const firstLevelData = root.data ?? root.Data;

  if (firstLevelData !== undefined && firstLevelData !== null) {
    const firstLevelRecord = asRecord(firstLevelData);
    const nestedData = firstLevelRecord.data ?? firstLevelRecord.Data;

    if (nestedData !== undefined && nestedData !== null) {
      return nestedData;
    }

    return firstLevelData;
  }

  return responseData;
}

function normalizeLoginResult(responseData: unknown): LoginResult {
  const data = getInnerData(responseData);
  const record = asRecord(data);

  const accessToken = getString(record, [
    "access_token",
    "accessToken",
    "token",
    "Token",
    "AccessToken",
  ]);

  const refreshToken = getString(record, [
    "refresh_token",
    "refreshToken",
    "RefreshToken",
  ]);

  const role = getString(record, ["role", "Role"]);
  const guid = getString(record, ["guid", "Guid"]);

  return {
    role,
    access_token: accessToken,
    accessToken,
    token: accessToken,
    refresh_token: refreshToken,
    refreshToken,
    token_type: getString(record, ["token_type", "tokenType", "TokenType"]),
    tokenType: getString(record, ["token_type", "tokenType", "TokenType"]),
    expires_in: record.expires_in as string | number | undefined,
    expiresIn: record.expiresIn as string | number | undefined,
    expires: (record.expires ?? null) as string | number | null,
    guid,
    user: {
      guid,
      role,
      userName: getString(record, ["userName", "UserName", "username"]),
      username: getString(record, ["username", "UserName", "userName"]),
      fullName: getString(record, ["fullName", "FullName"]),
    },
    raw: responseData,
  };
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const root = asRecord(responseData);

    return (
      getString(root, ["message", "Message", "error", "Error"]) ||
      error.message ||
      "خطا در ورود به سامانه"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "خطا در ورود به سامانه";
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    try {
      const response = await axios.post<LoginApiResponse>(
        "/api/auth/login",
        {
          username: payload.username.trim(),
          password: payload.password.trim(),
        },
        {
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          timeout: 90000,
        }
      );

      const result = normalizeLoginResult(response.data);

      if (!result.access_token) {
        console.log("LOGIN RESPONSE WITHOUT TOKEN:", response.data);

        throw new Error("توکن ورود از سمت سرور دریافت نشد.");
      }

      return result;
    } catch (error) {
      console.log("LOGIN SERVICE ERROR:", error);

      throw new Error(getErrorMessage(error));
    }
  },

  async getProfile(): Promise<AuthUserProfile | null> {
    try {
      const response = await apiClient.get("/User/GetProfile");
      const data = getInnerData(response.data);
      const record = asRecord(data);

      return {
        id: Number(record.id ?? record.Id) || undefined,
        guid: getString(record, ["guid", "Guid"]),
        userName: getString(record, ["userName", "UserName", "username"]),
        username: getString(record, ["username", "UserName", "userName"]),
        firstName: getString(record, ["firstName", "FirstName", "fristName"]),
        lastName: getString(record, ["lastName", "LastName"]),
        fullName: getString(record, ["fullName", "FullName"]),
        role: getString(record, ["role", "Role"]),
        ...record,
      };
    } catch (error) {
      console.log("GET PROFILE ERROR:", error);
      return null;
    }
  },

  logout() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    window.location.href = "/Login";
  },
};

export const login = authService.login;
export const getProfile = authService.getProfile;
export const logout = authService.logout;

export default authService;