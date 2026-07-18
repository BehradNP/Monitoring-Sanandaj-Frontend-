import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;

const DEFAULT_INTERNAL_API_URL = "https://msfmapi.sanandaj.ir/api/v1";

function getInternalApiUrl() {
  const internalUrl = process.env.INTERNAL_API_URL?.trim();

  if (internalUrl && internalUrl.startsWith("http")) {
    return internalUrl.replace(/\/+$/, "");
  }

  return DEFAULT_INTERNAL_API_URL;
}

function getClientId() {
  return process.env.AUTH_CLIENT_ID || "Client_UI";
}

function getClientSecret() {
  return (
    process.env.AUTH_CLIENT_SECRET ||
    "98fa8e277ccb46b9a518284eba50f671"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body?.username || "").trim();
    const password = String(body?.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "نام کاربری و رمز عبور الزامی است.",
        },
        { status: 400 }
      );
    }

    const loginUrl = `${getInternalApiUrl()}/User/GetToken`;

    const payload = {
      username,
      password,
      client_id: getClientId(),
      client_secret: getClientSecret(),
    };

    const response = await axios.request({
      method: "GET",
      url: loginUrl,
      data: payload,
      timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT || 90000),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json-patch+json",
      },
      validateStatus: () => true,
    });

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(
        {
          isSuccess: false,
          message:
            response.data?.message ||
            response.data?.Message ||
            `خطا در ورود به سیستم - status ${response.status}`,
          detail: response.data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log("LOGIN ROUTE ERROR:", error);

    let message = "خطا در ورود به سیستم";

    if (axios.isAxiosError(error)) {
      message =
        error.response?.data?.message ||
        error.response?.data?.Message ||
        error.message ||
        message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json(
      {
        isSuccess: false,
        message,
      },
      { status: 500 }
    );
  }
}