"use client";

import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-center p-6" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-lg w-full">
        <h1 className="text-6xl font-extrabold text-teal-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">صفحه پیدا نشد</h2>
        <p className="text-slate-500 mb-6">
          متاسفیم، صفحه‌ای که دنبال آن هستید وجود ندارد یا ممکن است منتقل شده باشد.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-xl shadow hover:bg-teal-700 transition"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
      <p className="mt-6 text-sm text-slate-400">
        © 2026 شهرداری سنندج
      </p>
    </div>
  );
}