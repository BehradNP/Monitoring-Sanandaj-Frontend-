"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiGitBranch,
  FiUsers,
  FiMonitor,
  FiWifi,
  FiServer,
  FiCpu,
  FiFileText,
  FiPrinter,
  FiGrid,
  FiSettings,
  FiShield,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function ConfirmLogoutModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[360px] max-w-[92vw] rounded-[26px] border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-2 text-[16px] font-extrabold text-slate-900">
          خروج از حساب
        </div>

        <div className="mb-6 text-[13px] leading-7 text-slate-600">
          آیا مطمئنید می‌خواهید از حساب خارج شوید؟
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            خیر
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-red-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-sm transition hover:bg-red-700"
          >
            بله، خروج
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  className = "",
  onNavigate,
  variant = "desktop",
}: SidebarProps) {
  const pathname = usePathname();

  const [monitoringOpen, setMonitoringOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  const monitoringMaxH = useMemo(() => 170, []);
  const reportsMaxH = useMemo(() => 125, []);

  const isMobile = variant === "mobile";

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    window.location.href = "/Login";
  };

  return (
    <>
      <aside
        className={[
          "flex shrink-0 flex-col text-white",
          "overflow-hidden",
          isMobile
            ? "h-[100dvh] w-[302px] max-w-[88vw] rounded-l-[30px] shadow-2xl"
            : "mx-4 my-4 h-[calc(100vh-2rem)] w-[260px] rounded-[30px] shadow-xl shadow-slate-300/40",
          className,
        ].join(" ")}
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.16) 0%, transparent 34%), linear-gradient(180deg, #2f7f86 0%, #163647 100%)",
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 px-5 pt-6">
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="relative h-[82px] w-[82px] overflow-hidden rounded-3xl bg-white/5">
                <Image src="/LOGO/FavIcon.png" alt="logo-1" fill priority />
              </div>

              <div className="relative h-[48px] w-[188px] overflow-hidden">
                <Image src="/LOGO/LOGO_Type.png" alt="logo-2" fill />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <nav className="space-y-1.5 text-[13px]">
              <MenuItem
                icon={<FiHome size={18} />}
                title="صفحه اصلی"
                href="/dashboard"
                active={isActive(pathname, "/dashboard")}
                activeStyle="primary"
                onNavigate={onNavigate}
              />

              <MenuItem
                icon={<FiGitBranch size={18} />}
                title="سلسله مراتب"
                href="/hierarchy"
                active={isActive(pathname, "/hierarchy")}
                onNavigate={onNavigate}
              />

              <MenuItem
                icon={<FiUsers size={18} />}
                title="پرسنل"
                href="/personnel"
                active={isActive(pathname, "/personnel")}
                onNavigate={onNavigate}
              />

              <GroupButton
                title="مانیتورینگ"
                icon={<FiMonitor size={18} />}
                isOpen={monitoringOpen}
                onClick={() => setMonitoringOpen((value) => !value)}
              />

              <AnimatedSubMenu isOpen={monitoringOpen} maxH={monitoringMaxH}>
                <SubMenuItem
                  icon={<FiWifi size={16} />}
                  title="مانیتورینگ شبکه"
                  href="/network-monitoring"
                  active={isActive(pathname, "/network-monitoring")}
                  onNavigate={onNavigate}
                />

                <SubMenuItem
                  icon={<FiServer size={16} />}
                  title="مانیتورینگ سرور"
                  href="/server-monitoring"
                  active={isActive(pathname, "/server-monitoring")}
                  onNavigate={onNavigate}
                />

                <SubMenuItem
                  icon={<FiCpu size={16} />}
                  title="مانیتورینگ سخت افزار"
                  href="/hardware-monitoring"
                  active={isActive(pathname, "/hardware-monitoring")}
                  onNavigate={onNavigate}
                />
              </AnimatedSubMenu>

              <GroupButton
                title="گزارشات تکمیلی"
                icon={<FiFileText size={18} />}
                isOpen={reportsOpen}
                onClick={() => setReportsOpen((value) => !value)}
              />

              <AnimatedSubMenu isOpen={reportsOpen} maxH={reportsMaxH}>
                <SubMenuItem
                  icon={<FiGrid size={16} />}
                  title="چاپ کیو آر کد"
                  href="/qr"
                  active={isActive(pathname, "/qr")}
                  onNavigate={onNavigate}
                />

                <SubMenuItem
                  icon={<FiPrinter size={16} />}
                  title="گزارشات عمومی"
                  href="/general-reports"
                  active={isActive(pathname, "/general-reports")}
                  onNavigate={onNavigate}
                />
              </AnimatedSubMenu>
            </nav>
          </div>

          <div className="shrink-0 border-t border-white/15 px-5 py-4 text-[12px]">
            <p className="mb-2 px-2 font-bold text-white/55">ادمین</p>

            <div className="space-y-1.5">
              <BottomItem
                icon={<FiSettings size={16} />}
                label="تنظیمات"
                href="/settings"
                active={isActive(pathname, "/settings")}
                onNavigate={onNavigate}
              />

              <BottomItem
                icon={<FiShield size={16} />}
                label="حساب کاربری و امنیت"
                href="/security"
                active={isActive(pathname, "/security")}
                onNavigate={onNavigate}
              />

              <button
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2.5 text-red-200 transition hover:bg-white/10"
                type="button"
                onClick={() => setOpenLogout(true)}
              >
                <FiLogOut size={16} />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>
      </aside>

      <ConfirmLogoutModal
        open={openLogout}
        onClose={() => setOpenLogout(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

function MenuItem({
  icon,
  title,
  href,
  active,
  activeStyle,
  onNavigate,
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
  active?: boolean;
  activeStyle?: "primary" | "default";
  onNavigate?: () => void;
}) {
  const base =
    "flex w-full cursor-pointer select-none items-center justify-between rounded-2xl px-3.5 py-2.5 transition";
  const activeCls =
    activeStyle === "primary"
      ? "bg-white font-extrabold text-[#163647] shadow-sm"
      : "bg-white/15 font-extrabold text-white ring-1 ring-white/10";
  const cls = [base, active ? activeCls : "text-white/90 hover:bg-white/10"].join(" ");

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onNavigate}>
        <span className="flex items-center gap-2.5">
          {icon}
          <span>{title}</span>
        </span>
      </Link>
    );
  }

  return (
    <button type="button" className={cls}>
      <span className="flex items-center gap-2.5">
        {icon}
        <span>{title}</span>
      </span>
    </button>
  );
}

function GroupButton({
  title,
  icon,
  isOpen,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="flex w-full cursor-pointer select-none items-center justify-between rounded-2xl px-3.5 py-2.5 text-white/90 transition hover:bg-white/10"
    >
      <span className="flex items-center gap-2.5">
        {icon}
        <span>{title}</span>
      </span>

      <span className={`transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}>
        <FiChevronDown size={14} className="opacity-80" />
      </span>
    </button>
  );
}

function AnimatedSubMenu({
  isOpen,
  maxH,
  children,
}: {
  isOpen: boolean;
  maxH: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        maxHeight: isOpen ? `${maxH}px` : "0px",
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0px)" : "translateY(-4px)",
        transitionProperty: "max-height, opacity, transform",
        transitionDuration: "360ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="mr-3 mt-1 space-y-1 border-r border-white/15 pr-3">
        {children}
      </div>
    </div>
  );
}

function SubMenuItem({
  icon,
  title,
  href,
  active,
  onNavigate,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  const cls = [
    "flex w-full cursor-pointer select-none items-center justify-between rounded-2xl px-3 py-2 text-[12.5px] transition",
    active ? "bg-white/15 font-extrabold text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
  ].join(" ");

  return (
    <Link href={href} className={cls} onClick={onNavigate}>
      <span className="flex items-center gap-2.5">
        {icon}
        <span>{title}</span>
      </span>
    </Link>
  );
}

function BottomItem({
  icon,
  label,
  href,
  active,
  onNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  const cls = [
    "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-2xl px-3 py-2.5 transition",
    active ? "bg-white/15 font-extrabold text-white" : "text-white/85 hover:bg-white/10 hover:text-white",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={cls} onClick={onNavigate}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={cls}>
      {icon}
      {label}
    </button>
  );
}