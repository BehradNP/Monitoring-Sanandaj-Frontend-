import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

type LoginBody = {
  username?: string;
  password?: string;
};

const DEFAULT_INTERNAL_API_URL = "https://msfmapi.sanandaj.ir/api/v1";

function getApiBaseUrl() {
  const baseUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_INTERNAL_API_URL;

  return baseUrl.replace(/\/+$/, "");
}

function joinApiUrl(baseUrl: string, path: string) {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  if (cleanBaseUrl.endsWith("/api/v1") && cleanPath.startsWith("v1/")) {
    return `${cleanBaseUrl}/${cleanPath.replace(/^v1\//, "")}`;
  }

  if (cleanBaseUrl.endsWith("/v1") && cleanPath.startsWith("v1/")) {
    return `${cleanBaseUrl}/${cleanPath.replace(/^v1\//, "")}`;
  }

  return `${cleanBaseUrl}/${cleanPath}`;
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string") return responseData;

    if (responseData && typeof responseData === "object") {
      const data = responseData as {
        message?: string;
        Message?: string;
        error?: string;
        Error?: string;
      };

      return (
        data.message ||
        data.Message ||
        data.error ||
        data.Error ||
        error.message ||
        "خطا در ارتباط با سرویس ورود"
      );
    }

    return error.message || "خطا در ارتباط با سرویس ورود";
  }

  if (error instanceof Error) return error.message;

  return "خطا در ورود به سامانه";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginBody;

    const username = body.username?.trim();
    const password = body.password?.trim();

    if (!username || !password) {
      return NextResponse.json(
        {
          issuccess: false,
          statuscode: 1,
          message: "نام کاربری و رمز عبور الزامی است.",
        },
        { status: 400 }
      );
    }

    const clientId =
      process.env.AUTH_CLIENT_ID ||
      process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ||
      "Client_UI";

    const clientSecret =
      process.env.AUTH_CLIENT_SECRET ||
      process.env.NEXT_PUBLIC_AUTH_CLIENT_SECRET;

    if (!clientSecret) {
      return NextResponse.json(
        {
          issuccess: false,
          statuscode: 1,
          message:
            "AUTH_CLIENT_SECRET روی سرور تنظیم نشده است. فایل .env.production.local را بررسی کن و بعد دوباره build بگیر.",
        },
        { status: 500 }
      );
    }

    const apiBaseUrl = getApiBaseUrl();
    const loginUrl = joinApiUrl(apiBaseUrl, "/User/GetToken");

    const payload = {
      username,
      password,
      client_id: clientId,
      client_secret: clientSecret,
    };

    console.log("LOGIN REQUEST URL:", loginUrl);
    console.log("LOGIN REQUEST USERNAME:", username);

    const response = await axios.request({
      method: "GET",
      url: loginUrl,
      data: payload,
      timeout: 90000,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json-patch+json",
      },
      validateStatus: () => true,
    });

    console.log("LOGIN UPSTREAM STATUS:", response.status);
    console.log("LOGIN UPSTREAM DATA:", response.data);

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(
        {
          issuccess: false,
          statuscode: response.status,
          message: "خطا در ارتباط با سرویس ورود",
          upstream: response.data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.log("LOGIN API ROUTE ERROR:", error);

    return NextResponse.json(
      {
        issuccess: false,
        statuscode: 1,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}