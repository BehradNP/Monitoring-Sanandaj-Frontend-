"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FiServer, FiCpu, FiWifi, FiMapPin } from "react-icons/fi";
import cupServerService from "@/services/cup-server-service";
import type { ServerStatus, ServerStatusRow } from "@/types/cup-server";
import type { DashboardRadioItem, DashboardReportData } from "@/types/dashboard-report";

type TabKey = "servers" | "hw_os" | "routers" | "regions";

type DashboardTabsProps = {
  report: DashboardReportData | null;
  reportLoading?: boolean;
  reportError?: string;
  onRetryReport?: () => void;
};

const PIE_COLORS = ["#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#94a3b8", "#38bdf8", "#f472b6", "#22c55e", "#eab308", "#64748b"];

function isValidColor(color: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color);
}

function getSafeColor(color: string, index: number) {
  return isValidColor(color) ? color : PIE_COLORS[index % PIE_COLORS.length];
}

function removeHtmlTags(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractFirstBoldText(info: string) {
  const match = info.match(/<b>(.*?)<\/b>/i);
  return removeHtmlTags(match?.[1] ?? "لینک رادیویی");
}

function extractIpFromInfo(info: string) {
  const match = info.match(/<b>\s*IP:\s*<\/b>\s*([^<]+)/i);
  return removeHtmlTags(match?.[1] ?? "-");
}

function extractRadioStatus(info: string): ServerStatus {
  return info.includes("فعال") || info.includes("✅") ? "ONLINE" : "OFFLINE";
}

function SimplePieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;

  return (
    <div className="flex gap-6 items-center">
      <div
        className="relative w-40 h-40 rounded-full"
        style={{
          background: `conic-gradient(${data
            .map((d) => {
              const from = acc;
              const to = acc + (d.value / total) * 100;
              acc = to;
              return `${d.color} ${from}% ${to}%`;
            })
            .join(",")})`,
        }}
      />

      <div className="space-y-2 text-sm">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-800 font-medium">{d.name}</span>
            <span className="text-slate-600 mr-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleTable({ columns, rows }: { columns: { key: string; label: string; className?: string }[]; rows: Record<string, React.ReactNode>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="text-[12px] text-slate-700">
            {columns.map((c) => (
              <th key={c.key} className={`py-3 px-3 font-bold ${c.className ?? ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-[13px] text-slate-900">
          {rows.map((r, idx) => (
            <tr key={idx} className="border-t border-slate-200">
              {columns.map((c) => (
                <td key={c.key} className={`py-3 px-3 ${c.className ?? ""}`}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PanelCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-[14px] font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function StatusPill({ value }: { value: ServerStatus }) {
  const isOnline = value === "ONLINE";

  return (
    <span className={["px-2.5 py-1 rounded-full text-[11px] font-bold", isOnline ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"].join(" ")}>
      {isOnline ? "آنلاین" : "آفلاین"}
    </span>
  );
}

function LoadingRow() {
  return <div className="py-10 text-center text-[13px] font-bold text-slate-500">در حال دریافت اطلاعات...</div>;
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 text-center">
      <p className="text-[13px] font-bold text-rose-700">{message}</p>

      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-rose-700">
          تلاش مجدد
        </button>
      )}
    </div>
  );
}

function EmptyState() {
  return <div className="py-10 text-center text-[13px] font-bold text-slate-500">اطلاعاتی برای نمایش وجود ندارد.</div>;
}

function RegionsTotalOnlineBarChart({ title, data }: { title: string; data: { name: string; total: number; online: number }[] }) {
  const plotHeight = 240;
  const step = 5;
  const maxValue = Math.max(...data.map((d) => Math.max(d.total, d.online)), 1);
  const yMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];

  for (let v = 0; v <= yMax; v += step) ticks.push(v);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4">
        <h2 className="text-[14px] font-extrabold text-slate-900 text-center">{title}</h2>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center justify-center gap-6 text-[12px] mb-3">
          <span className="inline-flex items-center gap-2 text-slate-800">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#429195" }} />
            کل
          </span>

          <span className="inline-flex items-center gap-2 text-slate-800">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#a1d0be" }} />
            آنلاین
          </span>
        </div>

        <div className="relative" dir="ltr">
          <div className="flex">
            <div className="w-10 pr-2 flex flex-col justify-between text-[12px] text-slate-500" style={{ height: plotHeight }}>
              {ticks.slice().reverse().map((v) => (
                <div key={v} className="leading-none text-left">
                  {v}
                </div>
              ))}
            </div>

            <div className="flex-1 relative min-w-0">
              <div className="overflow-x-auto w-full min-w-0 pb-2">
                {(() => {
                  const groupWidth = 120;
                  const minPlotWidth = Math.max(data.length * groupWidth + 40, 600);

                  return (
                    <div className="relative" style={{ minWidth: minPlotWidth }}>
                      <div className="relative" style={{ height: plotHeight }}>
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {ticks.slice().reverse().map((v) => (
                            <div key={v} className="border-t border-slate-200/80" />
                          ))}
                        </div>

                        <div className="relative z-10 h-full flex items-end justify-between gap-10 px-2">
                          {data.map((d, idx) => {
                            const totalPx = (d.total / yMax) * plotHeight;
                            const onlinePx = (d.online / yMax) * plotHeight;

                            return (
                              <div key={`${d.name}-${idx}`} className="flex items-end justify-center gap-6" style={{ width: groupWidth, height: plotHeight }}>
                                <div className="w-10 rounded-t-[8px]" style={{ height: `${totalPx}px`, backgroundColor: "#429195" }} title={`کل: ${d.total}`} />
                                <div className="w-10 rounded-t-[8px]" style={{ height: `${onlinePx}px`, backgroundColor: "#a1d0be" }} title={`آنلاین: ${d.online}`} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-10 px-2 mt-3">
                        {data.map((d, idx) => (
                          <div key={`lbl-${d.name}-${idx}`} className="text-[12px] text-slate-700 text-center" style={{ width: groupWidth }} dir="rtl">
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildOsPieData(report: DashboardReportData | null) {
  return (report?.reportOs ?? [])
    .filter((item) => item.count > 0)
    .map((item, index) => ({
      name: item.lable || item.label || "نامشخص",
      value: item.count,
      color: getSafeColor(item.color, index),
    }));
}

function getDatasetValue(value: unknown): number {
  if (typeof value === "number") return value;

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + getDatasetValue(item), 0);
  }

  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return getDatasetValue(item.count ?? item.value ?? item.data);
  }

  return 0;
}

function buildHardwarePieData(report: DashboardReportData | null) {
  return (report?.reportHard ?? [])
    .map((item, index) => ({
      name: item.lable || item.label || "نامشخص",
      value: getDatasetValue(item.datasets),
      color: getSafeColor(item.color, index),
    }))
    .filter((item) => item.value > 0);
}

function buildRegionsData(report: DashboardReportData | null) {
  const zoneItems = report?.reportZone ?? [];
  const hardItems = report?.reportHard ?? [];

  const totalDataset = zoneItems.find((item) => item.label.includes("کل")) ?? zoneItems[0];
  const onlineDataset = zoneItems.find((item) => item.label.includes("انلاین") || item.label.includes("آنلاین")) ?? zoneItems[1];

  const totalData = totalDataset?.data ?? [];
  const onlineData = onlineDataset?.data ?? [];
  const length = Math.max(totalData.length, onlineData.length, hardItems.length);

  return Array.from({ length }).map((_, index) => ({
    name: hardItems[index]?.lable || hardItems[index]?.label || `مورد ${index + 1}`,
    total: Number(totalData[index] ?? 0),
    online: Number(onlineData[index] ?? 0),
  }));
}

function buildRadioRows(redioList: DashboardRadioItem[]) {
  return redioList.map((item) => {
    const name = extractFirstBoldText(item.info);
    const ip = extractIpFromInfo(item.info);
    const status = extractRadioStatus(item.info);

    return {
      name: <span className="font-medium text-slate-900">{name}</span>,
      status: <StatusPill value={status} />,
      ip: <span className="font-mono text-[12px] text-slate-800">{ip}</span>,
    };
  });
}

export default function DashboardTabs({ report, reportLoading = false, reportError = "", onRetryReport }: DashboardTabsProps) {
  const tabs = useMemo(
    () => [
      { key: "servers" as const, label: "وضعیت سرور ها", icon: <FiServer size={16} /> },
      { key: "hw_os" as const, label: "سخت افزار و سیستم عامل", icon: <FiCpu size={16} /> },
      { key: "routers" as const, label: "روترها و آنتن‌دهی", icon: <FiWifi size={16} /> },
      { key: "regions" as const, label: "اطلاعات منطقه", icon: <FiMapPin size={16} /> },
    ],
    []
  );

  const [active, setActive] = useState<TabKey>("servers");

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-[#163647]">
        <div className="flex flex-wrap items-center gap-2 justify-start rtl:justify-start">
          {tabs.map((t) => {
            const isActive = active === t.key;

            return (
              <button key={t.key} type="button" onClick={() => setActive(t.key)} className={["inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition cursor-pointer", isActive ? "bg-white text-[#163647] shadow-sm font-bold" : "bg-transparent text-white/85 hover:bg-white/10"].join(" ")}>
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {active === "servers" && <ServersTab />}
        {active === "hw_os" && <HwOsTab report={report} reportLoading={reportLoading} reportError={reportError} onRetryReport={onRetryReport} />}
        {active === "routers" && <NetworkTab report={report} reportLoading={reportLoading} reportError={reportError} onRetryReport={onRetryReport} />}
        {active === "regions" && <RegionsTab report={report} reportLoading={reportLoading} reportError={reportError} onRetryReport={onRetryReport} />}
      </div>
    </section>
  );
}

function ServersTab() {
  const [servers, setServers] = useState<ServerStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchServers = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      setErrorMessage("");

      const rows = await cupServerService.getServerStatusRows();

      setServers(rows);
    } catch (error) {
      console.log("CUP SERVER INFO ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات وضعیت سرورها");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const rows = await cupServerService.getServerStatusRows();

        if (isMounted) setServers(rows);
      } catch (error) {
        console.log("CUP SERVER INFO ERROR:", error);

        if (isMounted) setErrorMessage("خطا در دریافت اطلاعات وضعیت سرورها");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    const intervalId = window.setInterval(async () => {
      try {
        const rows = await cupServerService.getServerStatusRows();

        if (isMounted) {
          setServers(rows);
          setErrorMessage("");
        }
      } catch (error) {
        console.log("CUP SERVER INFO POLLING ERROR:", error);

        if (isMounted) setErrorMessage("خطا در بروزرسانی اطلاعات وضعیت سرورها");
      }
    }, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const rows = servers.map((s) => ({
    server: <span className="font-medium text-slate-900">{s.name}</span>,
    status: <StatusPill value={s.status} />,
    ip: <span className="font-mono text-[12px] text-slate-800">{s.ip}</span>,
    cpu: <span className="font-semibold text-slate-900">{s.cpu}%</span>,
    ram: <span className="font-semibold text-slate-900">{s.ram}%</span>,
  }));

  return (
    <PanelCard title="وضعیت سرورها">
      {loading && <LoadingRow />}
      {!loading && errorMessage && <ErrorBox message={errorMessage} onRetry={() => fetchServers(true)} />}
      {!loading && !errorMessage && rows.length === 0 && <EmptyState />}

      {!loading && !errorMessage && rows.length > 0 && (
        <SimpleTable
          columns={[
            { key: "server", label: "سرور" },
            { key: "status", label: "وضعیت" },
            { key: "ip", label: "IP آدرس" },
            { key: "cpu", label: "CPU", className: "text-center" },
            { key: "ram", label: "RAM", className: "text-center" },
          ]}
          rows={rows}
        />
      )}

      <div className="mt-3 text-[12px] text-slate-700 flex items-center gap-2 justify-end"></div>
    </PanelCard>
  );
}

function HwOsTab({ report, reportLoading, reportError, onRetryReport }: DashboardTabsProps) {
  const osPie = buildOsPieData(report);
  const hardPie = buildHardwarePieData(report);

  if (reportLoading && !report) return <PanelCard title="سخت افزار و سیستم عامل"><LoadingRow /></PanelCard>;
  if (reportError && !report) return <PanelCard title="سخت افزار و سیستم عامل"><ErrorBox message={reportError} onRetry={onRetryReport} /></PanelCard>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PanelCard title="توزیع سخت افزار">
        {hardPie.length > 0 ? <SimplePieChart data={hardPie} /> : <EmptyState />}
      </PanelCard>

      <PanelCard title="توزیع سیستم عامل">
        {osPie.length > 0 ? <SimplePieChart data={osPie} /> : <EmptyState />}
      </PanelCard>
    </div>
  );
}

function NetworkTab({ report, reportLoading, reportError, onRetryReport }: DashboardTabsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const rows = buildRadioRows(report?.redioList ?? []);
  const totalItems = rows.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  const goToPrevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  if (reportLoading && !report) {
    return (
      <PanelCard title="روترها و آنتن‌دهی">
        <LoadingRow />
      </PanelCard>
    );
  }

  if (reportError && !report) {
    return (
      <PanelCard title="روترها و آنتن‌دهی">
        <ErrorBox message={reportError} onRetry={onRetryReport} />
      </PanelCard>
    );
  }

  return (
    <PanelCard title="روترها و آنتن‌دهی">
      {rows.length === 0 && <EmptyState />}

      {rows.length > 0 && (
        <>
          <SimpleTable
            columns={[
              { key: "name", label: "لینک" },
              { key: "status", label: "وضعیت" },
              { key: "ip", label: "IP", className: "text-center" },
            ]}
            rows={paginatedRows}
          />

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] font-medium text-slate-600">
              نمایش {startIndex + 1} تا {Math.min(startIndex + pageSize, totalItems)} از {totalItems} مورد
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={[
                  "rounded-lg border px-3 py-2 text-[12px] font-bold transition",
                  currentPage === 1
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                قبلی
              </button>

              <span className="rounded-lg bg-[#163647] px-3 py-2 text-[12px] font-bold text-white">
                صفحه {currentPage} از {totalPages}
              </span>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={[
                  "rounded-lg border px-3 py-2 text-[12px] font-bold transition",
                  currentPage === totalPages
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                بعدی
              </button>
            </div>
          </div>
        </>
      )}
    </PanelCard>
  );
}

function RegionsTab({ report, reportLoading, reportError, onRetryReport }: DashboardTabsProps) {
  const regions = buildRegionsData(report);

  if (reportLoading && !report) return <PanelCard title="اطلاعات منطقه"><LoadingRow /></PanelCard>;
  if (reportError && !report) return <PanelCard title="اطلاعات منطقه"><ErrorBox message={reportError} onRetry={onRetryReport} /></PanelCard>;
  if (regions.length === 0) return <PanelCard title="اطلاعات منطقه"><EmptyState /></PanelCard>;

  return <RegionsTotalOnlineBarChart title="کل اطلاعات بر حسب منطقه" data={regions} />;
}