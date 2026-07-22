"use client";

import { useEffect, useState, type ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen w-full bg-[#f5f7fb]" dir="rtl">
      <div className="fixed bottom-0 right-0 top-0 z-40 hidden xl:block" dir="rtl">
        <Sidebar />
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-[9990] xl:hidden" dir="rtl">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
          />

          <div className="absolute bottom-0 right-0 top-0 animate-[mobileSidebarIn_220ms_ease-out]">
            <Sidebar
              variant="mobile"
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <main className="min-h-screen transition-all xl:pr-[292px]" dir="rtl">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <div className="px-3 pb-5 pt-4 sm:px-5 md:px-6 xl:px-8 xl:pb-8">
          <div className="mx-auto w-full max-w-[2100px]">
            {children}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes mobileSidebarIn {
          from {
            transform: translateX(100%);
            opacity: 0.65;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}