import axios from "axios";
import { NextResponse } from "next/server";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://msfmapi.sanandaj.ir/api/v1").trim().replace(/\/+$/, "");

const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || "Client_UI";
const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET || process.env.NEXT_PUBLIC_AUTH_CLIENT_SECRET || "98fa8e277ccb46b9a518284eba50f671";

function baseUrlHasVersion(baseURL?: string) {
  if (!baseURL) return false;
  return /\/v\d+$/i.test(baseURL.trim().replace(/\/+$/, ""));
}

function normalizeRequestUrl(url: string, baseURL: string) {
  if (!baseUrlHasVersion(baseURL)) return url;
  return url.replace(/^\/?v\d+(?=\/)/i, "");
}

function getNestedValue(source: unknown, keys: string[]): unknown {
  const raw = source as Record<string, unknown> | null;
  if (!raw) return undefined;

  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }

  return undefined;
}

function extractToken(response: unknown): string | null {
  if (typeof response === "string" && response.trim()) return response.trim();

  const root = response as Record<string, unknown> | null;
  const data = getNestedValue(response, ["data", "Data"]);

  const token =
    getNestedValue(root, ["token", "Token", "accessToken", "AccessToken", "access_token", "jwt", "Jwt"]) ??
    getNestedValue(data, ["token", "Token", "accessToken", "AccessToken", "access_token", "jwt", "Jwt"]);

  return typeof token === "string" && token.trim() ? token.trim() : null;
}

function isApiSuccess(data: unknown) {
  const raw = data as Record<string, unknown>;
  return !(raw?.issuccess === false || raw?.isSuccess === false || raw?.statuscode === 2 || raw?.statusCode === 2);
}

function getApiMessage(data: unknown) {
  const raw = data as Record<string, unknown>;
  return String(raw?.message || raw?.Message || "عملیات با خطا مواجه شد.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body?.username || "").trim();
    const password = String(body?.password || "").trim();

    if (!username || !password) {
      return NextResponse.json({ isSuccess: false, message: "نام کاربری و رمز عبور الزامی است." }, { status: 400 });
    }

    const loginBody = {
      username,
      password,
      client_id: AUTH_CLIENT_ID,
      client_secret: AUTH_CLIENT_SECRET,
    };

    const response = await axios.request({
      method: "GET",
      baseURL: API_BASE_URL,
      url: normalizeRequestUrl("/v1/User/GetToken", API_BASE_URL),
      data: loginBody,
      timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 90000),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json-patch+json",
      },
      transformRequest: [
        (data) => {
          return JSON.stringify(data);
        },
      ],
    });

    const result = response.data;

    if (!isApiSuccess(result)) {
      return NextResponse.json({ isSuccess: false, message: getApiMessage(result), raw: result }, { status: 400 });
    }

    const token = extractToken(result);

    if (!token) {
      return NextResponse.json({ isSuccess: false, message: "توکن ورود از سمت سرور دریافت نشد.", raw: result }, { status: 400 });
    }

    return NextResponse.json({
      isSuccess: true,
      token,
      data: result,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data;

      return NextResponse.json(
        {
          isSuccess: false,
          message: getApiMessage(data) || error.message || "خطا در ارتباط با سرور.",
          status,
          raw: data,
        },
        { status }
      );
    }

    return NextResponse.json({ isSuccess: false, message: "خطا در ورود به سیستم." }, { status: 500 });
  }
}