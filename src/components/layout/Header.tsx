"use client";

import React from "react";
import { FiMenu, FiUser } from "react-icons/fi";

type HeaderProps = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#f5f7fb]/85 px-3 pt-3 backdrop-blur-xl sm:px-5 md:px-6 xl:px-8 xl:pt-5">
      <div className="mx-auto flex h-[64px] w-full max-w-[2100px] items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/85 px-3 shadow-sm shadow-slate-200/70 ring-1 ring-slate-200/60 sm:h-[70px] sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="باز کردن منو"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#163647] text-white shadow-lg shadow-[#163647]/15 transition active:scale-95 xl:hidden"
          >
            <FiMenu size={22} />
          </button>

          <div className="hidden min-w-0 xl:block">
            <div className="text-sm font-extrabold text-slate-900">
              پنل مانیتورینگ شهرداری سنندج
            </div>
            <div className="mt-1 text-xs font-bold text-slate-400">
              مدیریت، گزارش‌گیری و پایش وضعیت سامانه
            </div>
          </div>

          <div className="min-w-0 xl:hidden">
            <div className="truncate text-sm font-extrabold text-slate-900">
              پنل مانیتورینگ
            </div>
            <div className="mt-1 truncate text-[11px] font-bold text-slate-400">
              شهرداری سنندج
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200 sm:gap-3 sm:px-3" dir="rtl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
            <FiUser size={18} />
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="truncate text-[13px] font-extrabold text-slate-900">
              محمد محمدی
            </div>
            <div className="mt-0.5 text-[11px] font-bold text-slate-400">
              کاربر سامانه
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}