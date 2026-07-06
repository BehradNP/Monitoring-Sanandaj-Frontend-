"use client";

import { useCallback, useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import dashboardReportService from "@/services/dashboard-report-service";
import type { DashboardReportData } from "@/types/dashboard-report";
import { FaDesktop, FaCheckCircle, FaServer, FaWifi } from "react-icons/fa";

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="تعداد کل سیستم" value={report?.all ?? 0} icon={<FaDesktop />} tone="blue" />
        <StatCard title="سیستم‌های آنلاین" value={report?.online ?? 0} icon={<FaCheckCircle />} tone="green" />
        <StatCard title="تعداد سرور" value={report?.detials ?? 0} icon={<FaServer />} tone="purple" />
        <StatCard title="تعداد کل رادیو" value={report?.redio ?? 0} icon={<FaWifi />} tone="orange" />
      </div>

      <DashboardTabs report={report} reportLoading={reportLoading} reportError={reportError} onRetryReport={() => fetchDashboardReport(true)} />
    </div>
  );
}