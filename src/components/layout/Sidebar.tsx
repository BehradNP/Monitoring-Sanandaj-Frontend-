"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiGitBranch,
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

/* ================== HELPERS ================== */

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/* ================== MODAL ================== */

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop (blur + dark) */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-[360px] max-w-[92vw] rounded-2xl bg-white shadow-2xl border border-slate-200 p-6"
        dir="rtl"
      >
        <div className="text-[15px] font-extrabold text-slate-900 mb-2">
          خروج از حساب
        </div>
        <div className="text-[13px] text-slate-700 mb-6 leading-6">
          آیا مطمئنید می‌خواهید از حساب خارج شوید؟
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-[13px] font-bold text-slate-700 transition"
          >
            خیر
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-[13px] font-bold text-white transition shadow-sm"
          >
            بله، خروج
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================== SIDEBAR ================== */

export default function Sidebar() {
  const pathname = usePathname();

  const [monitoringOpen, setMonitoringOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);

  const monitoringMaxH = useMemo(() => 160, []);
  const reportsMaxH = useMemo(() => 120, []);

  const [openLogout, setOpenLogout] = useState(false);

const handleConfirmLogout = () => {
  localStorage.removeItem("token"); // یا session شما
  window.location.href = "/Login";
};

  return (
    <>
      <aside
        className="
          h-[calc(100vh-2rem)] w-[260px] shrink-0
          my-4 mr-4
          flex flex-col justify-between
          rounded-3xl
          text-white px-5 py-5
          overflow-hidden
        "
        style={{
          background: "linear-gradient(180deg, #2f7f86 0%, #163647 100%)",
        }}
      >
        {/* ========== TOP / LOGOS + MENU ========== */}
        <div className="pt-4">
          <div className="flex flex-col items-center gap-3 mb-7">
            {/* Logo 1 */}
            <div className="relative w-22 h-22 overflow-hidden">
              <Image src="/LOGO/FavIcon.png" alt="logo-1" fill priority />
            </div>

            {/* Logo 2 */}
            <div className="relative w-[190px] h-[50px] overflow-hidden">
              <Image src="/LOGO/LOGO_Type.png" alt="logo-2" fill />
            </div>
          </div>

          {/* ========== MAIN MENU ========== */}
          <nav className="mt-9 space-y-1.5 text-[13px]">
            {/* صفحه اصلی */}
            <MenuItem
              icon={<FiHome size={18} />}
              title="صفحه اصلی"
              href="/dashboard"
              active={isActive(pathname, "/dashboard")}
              activeStyle="primary"
            />

            {/* سلسله مراتب */}
            <MenuItem
              icon={<FiGitBranch size={18} />}
              title="سلسله مراتب"
              href="/hierarchy"
              active={isActive(pathname, "/hierarchy")}
            />

            {/* مانیتورینگ (گروه با زیرمنو) */}
            <GroupButton
              title="مانیتورینگ"
              icon={<FiMonitor size={18} />}
              isOpen={monitoringOpen}
              onClick={() => setMonitoringOpen((v) => !v)}
            />

            <AnimatedSubMenu isOpen={monitoringOpen} maxH={monitoringMaxH}>
              <SubMenuItem
                icon={<FiWifi size={16} />}
                title="مانیتورینگ شبکه"
                href="/network-monitoring"
                active={isActive(pathname, "/network-monitoring")}
              />
              <SubMenuItem
                icon={<FiServer size={16} />}
                title="مانیتورینگ سرور"
                href="/server-monitoring"
                active={isActive(pathname, "/server-monitoring")}
              />
              <SubMenuItem
                icon={<FiCpu size={16} />}
                title="مانیتورینگ سخت افزار"
                href="/hardware-monitoring"
                active={isActive(pathname, "/hardware-monitoring")}
              />
            </AnimatedSubMenu>

            {/* گزارشات تکمیلی (گروه با زیرمنو) */}
            <GroupButton
              title="گزارشات تکمیلی"
              icon={<FiFileText size={18} />}
              isOpen={reportsOpen}
              onClick={() => setReportsOpen((v) => !v)}
            />

            <AnimatedSubMenu isOpen={reportsOpen} maxH={reportsMaxH}>
              <SubMenuItem
                icon={<FiGrid size={16} />}
                title="چاپ کیو آر کد"
                href="/qr"
                active={isActive(pathname, "/qr")}
              />
              <SubMenuItem
                icon={<FiPrinter size={16} />}
                title="گزارشات عمومی"
                href="/general-reports"
                active={isActive(pathname, "/general-reports")}
              />
            </AnimatedSubMenu>
          </nav>
        </div>

        {/* ========== BOTTOM / SETTINGS ========== */}
        <div className="space-y-2 border-t border-white/20 pt-3 text-[12px]">
          <p className="opacity-70">ادمین</p>

          <BottomItem
            icon={<FiSettings size={16} />}
            label="تنظیمات"
            href="/settings"
            active={isActive(pathname, "/settings")}
          />
          <BottomItem
            icon={<FiShield size={16} />}
            label="حساب کاربری و امنیت"
            href="/security"
            active={isActive(pathname, "/security")}
          />

          <button
            className="
              w-full flex items-center gap-2.5
              px-3 py-2 rounded-lg
              hover:bg-white/10 transition
              text-red-200
              cursor-pointer
            "
            type="button"
            onClick={() => setOpenLogout(true)}
            dir="rtl"
          >
            <FiLogOut size={16} />
            خروج از حساب
          </button>
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

/* ================== UI PARTS ================== */

function MenuItem({
  icon,
  title,
  href,
  active,
  activeStyle,
}: {
  icon: React.ReactNode;
  title: string;
  href?: string;
  active?: boolean;
  activeStyle?: "primary" | "default";
}) {
  const base =
    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer select-none";

  const activeCls =
    activeStyle === "primary"
      ? "bg-white text-[#163647] font-semibold shadow-sm"
      : "bg-white/15 text-white font-semibold";

  const cls = [base, active ? activeCls : "hover:bg-white/10"].join(" ");

  if (href) {
    return (
      <Link href={href} className={cls}>
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
      className="
        w-full flex items-center justify-between
        px-3.5 py-2.5 rounded-xl
        hover:bg-white/10 transition
        cursor-pointer select-none
      "
    >
      <span className="flex items-center gap-2.5">
        {icon}
        <span>{title}</span>
      </span>

      <span
        className={`
          transition-transform duration-300 ease-out
          ${isOpen ? "rotate-180" : ""}
        `}
      >
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
        transitionDuration: "420ms",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="mt-1 space-y-1 pl-2">{children}</div>
    </div>
  );
}

function SubMenuItem({
  icon,
  title,
  href,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  active?: boolean;
}) {
  const cls = [
    "w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-[12.5px] cursor-pointer select-none",
    active ? "bg-white/15" : "hover:bg-white/10",
  ].join(" ");

  return (
    <Link href={href} className={cls}>
      <span className="flex items-center gap-2.5 opacity-95">
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
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  active?: boolean;
}) {
  const cls = [
    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition cursor-pointer select-none",
    active ? "bg-white/15" : "hover:bg-white/10",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={cls}>
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
