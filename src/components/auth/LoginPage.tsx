"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard"); // بعداً API Login اضافه می‌کنیم
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#163647] via-[#1e5161] to-[#2f7f86] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 text-white">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">ورود به سیستم</h1>
          <p className="text-white/70 text-sm">سامانه مانیتورینگ شهرداری سنندج</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">نام کاربری</label>
            <div className="relative">
              <input type="text" placeholder="نام کاربری" className="w-full h-12 rounded-2xl bg-white/10 border border-white/20 outline-none px-12 text-sm placeholder:text-white/40 focus:border-cyan-300 transition" />
              <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">رمز عبور</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="رمز عبور" className="w-full h-12 rounded-2xl bg-white/10 border border-white/20 outline-none px-12 text-sm placeholder:text-white/40 focus:border-cyan-300 transition" />
              <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="w-full h-12 rounded-2xl bg-white text-[#163647] font-extrabold text-sm hover:scale-[1.02] transition shadow-lg">
            ورود به داشبورد
          </button>
        </form>
      </div>
    </div>
  );
}