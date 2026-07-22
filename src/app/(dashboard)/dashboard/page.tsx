"use client";

import { useCallback, useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import dashboardReportService from "@/services/dashboard-report-service";
import type { DashboardReportData } from "@/types/dashboard-report";
import { FaCheckCircle, FaDesktop, FaServer, FaWifi } from "react-icons/fa";

export default function DashboardPage() {
  const [report, setReport] = useState<DashboardReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState("");

  const fetchDashboardReport = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setReportLoading(true);

      setReportError("");

      const data = await dashboardReportService.getReport();

      setReport(data);
    } catch (error) {
      console.log("DASHBOARD REPORT ERROR:", error);

      if (showLoading) {
        setReportError("خطا در دریافت اطلاعات داشبورد");
      }
    } finally {
      if (showLoading) setReportLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardReport(true);

    const intervalId = window.setInterval(() => {
      fetchDashboardReport(false);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchDashboardReport]);

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-l from-[#163647] to-[#2f7f86] p-4 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-black sm:text-2xl">
              داشبورد مانیتورینگ
            </h1>

            <p className="mt-2 text-xs font-bold leading-6 text-white/70 sm:text-sm">
              نمای کلی از وضعیت سیستم‌ها، سرورها، رادیوها و مناطق
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-[11px] font-extrabold text-white ring-1 ring-white/20 sm:text-xs">
            <span
              className={[
                "h-2.5 w-2.5 rounded-full",
                reportLoading
                  ? "bg-amber-300"
                  : reportError
                    ? "bg-rose-300"
                    : "bg-emerald-300",
              ].join(" ")}
            />

            {reportLoading
              ? "در حال دریافت اطلاعات"
              : reportError
                ? "خطا در دریافت اطلاعات"
                : "بروزرسانی خودکار"}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="کل سیستم"
          value={report?.all ?? 0}
          icon={<FaDesktop />}
          tone="blue"
        />

        <StatCard
          title="آنلاین"
          value={report?.online ?? 0}
          icon={<FaCheckCircle />}
          tone="green"
        />

        <StatCard
          title="سرور"
          value={report?.detials ?? 0}
          icon={<FaServer />}
          tone="purple"
        />

        <StatCard
          title="رادیو"
          value={report?.redio ?? 0}
          icon={<FaWifi />}
          tone="orange"
        />
      </div>

      <DashboardTabs
        report={report}
        reportLoading={reportLoading}
        reportError={reportError}
        onRetryReport={() => fetchDashboardReport(true)}
      />
    </div>
  );
}