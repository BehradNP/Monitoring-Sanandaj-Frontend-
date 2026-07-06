"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { authService } from "@/services/auth-service";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("09187708317");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage("نام کاربری و رمز عبور را وارد کنید.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const result = await authService.login({
        username: cleanUsername,
        password: cleanPassword,
      });

      localStorage.setItem("token", result.token);

      try {
        const profile = await authService.getProfile();
        if (profile) {
          localStorage.setItem("userProfile", JSON.stringify(profile));
        }
      } catch {
        localStorage.removeItem("userProfile");
      }

      router.replace("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "ورود با خطا مواجه شد.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#163647] via-[#1e5161] to-[#2f7f86] px-4" dir="rtl">
      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">ورود به سیستم</h1>
          <p className="text-white/70 text-sm">سامانه مانیتورینگ شهرداری سنندج</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm text-white/80 mb-2 block">نام کاربری</label>
            <div className="relative">
              <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" placeholder="نام کاربری" autoComplete="username" disabled={loading} className="w-full h-12 rounded-2xl bg-white/10 border border-white/20 outline-none px-12 text-sm placeholder:text-white/40 focus:border-cyan-300 transition disabled:opacity-60" />
              <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
            </div>
          </div>

          <div>
            <label className="text-sm text-white/80 mb-2 block">رمز عبور</label>
            <div className="relative">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="رمز عبور" autoComplete="current-password" disabled={loading} className="w-full h-12 rounded-2xl bg-white/10 border border-white/20 outline-none px-12 text-sm placeholder:text-white/40 focus:border-cyan-300 transition disabled:opacity-60" />
              <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} disabled={loading} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 disabled:opacity-60">
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {errorMessage ? <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">{errorMessage}</div> : null}

          <button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-white text-[#163647] font-extrabold text-sm hover:scale-[1.02] transition shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100">
            {loading ? <span className="flex items-center justify-center gap-2"><FiLoader className="animate-spin" size={18} />در حال ورود...</span> : "ورود به داشبورد"}
          </button>
        </form>
      </div>
    </div>
  );
}