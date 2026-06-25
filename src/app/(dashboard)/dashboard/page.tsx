import StatCard from "@/components/dashboard/StatCard";
import ServersTable from "@/components/dashboard/ServersTable";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { FaDesktop, FaCheckCircle, FaServer, FaWifi } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="تعداد کل سیستم" value={156} icon={<FaDesktop />} tone="blue" />
        <StatCard title="سیستم‌های آنلاین" value={142} icon={<FaCheckCircle />} tone="green" />
        <StatCard title="تعداد سرور" value={24} icon={<FaServer />} tone="purple" />
        <StatCard title="تعداد کل رادیو" value={38} icon={<FaWifi />} tone="orange" />
      </div>

      <DashboardTabs />
    </div>
  );
}