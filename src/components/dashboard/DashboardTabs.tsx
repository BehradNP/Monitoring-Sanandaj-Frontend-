"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import { FiCpu, FiMapPin, FiServer, FiWifi } from "react-icons/fi";
import cupServerService from "@/services/cup-server-service";
import type { ServerStatus, ServerStatusRow } from "@/types/cup-server";
import type {
  DashboardRadioItem,
  DashboardReportData,
} from "@/types/dashboard-report";

type TabKey = "servers" | "hw_os" | "routers" | "regions";

type DashboardTabsProps = {
  report: DashboardReportData | null;
  reportLoading?: boolean;
  reportError?: string;
  onRetryReport?: () => void;
};

const PIE_COLORS = [
  "#2f7f86",
  "#163647",
  "#8b5cf6",
  "#f59e0b",
  "#0ea5e9",
  "#22c55e",
  "#ef4444",
  "#14b8a6",
  "#64748b",
  "#a855f7",
  "#f97316",
  "#06b6d4",
];

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function normalizeKey(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getStableColor(name: string) {
  const key = normalizeKey(name);

  if (!key) return PIE_COLORS[0];

  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = key.charCodeAt(index) + ((hash << 5) - hash);
  }

  return PIE_COLORS[Math.abs(hash) % PIE_COLORS.length];
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getStringByKeys(value: unknown, keys: string[], fallback = "") {
  const item = asRecord(value);

  for (const key of keys) {
    const current = item[key];

    if (typeof current === "string" && current.trim()) return current.trim();

    if (typeof current === "number" && Number.isFinite(current)) {
      return String(current);
    }
  }

  return fallback;
}

function getNumberValue(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    const numberValue = Number(normalized);

    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + getNumberValue(item), 0);
  }

  if (value && typeof value === "object") {
    const item = asRecord(value);

    const directValue =
      item.count ??
      item.Count ??
      item.value ??
      item.Value ??
      item.total ??
      item.Total ??
      item.y ??
      item.Y ??
      item.dataCount ??
      item.DataCount;

    const directNumber = getNumberValue(directValue);

    if (directNumber > 0) return directNumber;

    return getNumberValue(
      item.data ?? item.Data ?? item.datasets ?? item.Datasets ?? item.values
    );
  }

  return 0;
}

function getChartItemName(item: unknown, fallback: string) {
  return (
    getStringByKeys(
      item,
      ["lable", "label", "Label", "title", "Title", "name", "Name", "key", "Key"],
      fallback
    ) || fallback
  );
}

function getChartItemValue(item: unknown) {
  const record = asRecord(item);

  const directValue =
    record.count ??
    record.Count ??
    record.value ??
    record.Value ??
    record.total ??
    record.Total ??
    record.number ??
    record.Number ??
    record.y ??
    record.Y;

  const directNumber = getNumberValue(directValue);

  if (directNumber > 0) return directNumber;

  return getNumberValue(
    record.datasets ?? record.Datasets ?? record.data ?? record.Data
  );
}

function sortPieData<T extends { name: string; value: number }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.name.localeCompare(b.name, "fa");
  });
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-[13px] font-extrabold text-slate-400">
      اطلاعاتی برای نمایش وجود ندارد.
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-3xl bg-slate-50 px-4 py-10 text-center text-[13px] font-extrabold text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#2f7f86]" />
      در حال دریافت اطلاعات...
    </div>
  );
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-7 text-center">
      <p className="text-[13px] font-extrabold text-rose-700">{message}</p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-2xl bg-rose-600 px-5 py-2.5 text-[12px] font-extrabold text-white transition hover:bg-rose-700"
        >
          تلاش مجدد
        </button>
      ) : null}
    </div>
  );
}

function StatusPill({ value }: { value: ServerStatus }) {
  const isOnline = value === "ONLINE";

  return (
    <span
      className={[
        "inline-flex min-w-[76px] items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-black",
        isOnline
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700",
      ].join(" ")}
    >
      {isOnline ? "آنلاین" : "آفلاین"}
    </span>
  );
}

function PanelCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-4">
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
            {icon}
          </div>
        ) : null}

        <h2 className="text-[14px] font-black text-slate-900">{title}</h2>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function DesktopTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, ReactNode>[];
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
      <table className="w-full text-right">
        <thead className="bg-slate-50">
          <tr className="text-[12px] text-slate-500">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-4 font-extrabold ${column.className ?? ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-[13px] text-slate-900">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-slate-100 transition hover:bg-[#2f7f86]/5"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-4 ${column.className ?? ""}`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileServerCards({ servers }: { servers: ServerStatusRow[] }) {
  if (!servers.length) return <EmptyState />;

  return (
    <div className="space-y-3 md:hidden">
      {servers.map((server, index) => (
        <div
          key={`${server.ip}-${index}`}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-slate-900">
                {server.name}
              </div>

              <div className="mt-1 font-mono text-[12px] font-bold text-slate-400">
                {server.ip}
              </div>
            </div>

            <StatusPill value={server.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">CPU</div>
              <div className="mt-1 text-lg font-black text-slate-800">
                {toPersianNumber(server.cpu)}%
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 text-center">
              <div className="text-[11px] font-bold text-slate-400">RAM</div>
              <div className="mt-1 text-lg font-black text-slate-800">
                {toPersianNumber(server.ram)}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileRadioCards({
  rows,
}: {
  rows: Record<string, ReactNode>[];
}) {
  if (!rows.length) return <EmptyState />;

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row, index) => (
        <div
          key={index}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black text-slate-900">
                {row.name}
              </div>

              <div className="mt-2 font-mono text-xs font-bold text-slate-500">
                {row.ip}
              </div>
            </div>

            {row.status}
          </div>
        </div>
      ))}
    </div>
  );
}

function SimplePieChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const safeData = data.filter((item) => item.value > 0);
  const total = safeData.reduce((sum, item) => sum + item.value, 0);

  if (safeData.length === 0 || total <= 0) return <EmptyState />;

  let acc = 0;

  const gradient = safeData
    .map((item) => {
      const from = acc;
      const to = acc + (item.value / total) * 100;
      acc = to;
      return `${item.color} ${from}% ${to}%`;
    })
    .join(",");

  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:flex-row">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full border border-slate-100 shadow-inner sm:h-44 sm:w-44"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-8 rounded-full bg-white shadow-sm" />

        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-700">
          {toPersianNumber(total)}
        </div>
      </div>

      <div className="w-full min-w-0 space-y-2">
        {safeData.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: item.color }}
            />

            <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-slate-700">
              {item.name}
            </span>

            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-slate-700 shadow-sm">
              {toPersianNumber(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegionsTotalOnlineBarChart({
  title,
  data,
}: {
  title: string;
  data: { name: string; total: number; online: number }[];
}) {
  const plotHeight = 230;
  const step = 5;
  const maxValue = Math.max(
    ...data.map((item) => Math.max(item.total, item.online)),
    1
  );
  const yMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];

  for (let value = 0; value <= yMax; value += step) ticks.push(value);

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
        <h2 className="text-center text-[14px] font-black text-slate-900">
          {title}
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-center gap-6 text-[12px] font-bold">
          <span className="inline-flex items-center gap-2 text-slate-700">
            <span className="h-3 w-3 rounded-sm bg-[#429195]" />
            کل
          </span>

          <span className="inline-flex items-center gap-2 text-slate-700">
            <span className="h-3 w-3 rounded-sm bg-[#a1d0be]" />
            آنلاین
          </span>
        </div>

        <div className="relative" dir="ltr">
          <div className="flex">
            <div
              className="flex w-9 flex-col justify-between pr-2 text-left text-[11px] text-slate-500"
              style={{ height: plotHeight }}
            >
              {ticks
                .slice()
                .reverse()
                .map((value) => (
                  <div key={value} className="leading-none">
                    {toPersianNumber(value)}
                  </div>
                ))}
            </div>

            <div className="min-w-0 flex-1">
              <div className="w-full overflow-x-auto pb-2">
                {(() => {
                  const groupWidth = 105;
                  const minPlotWidth = Math.max(
                    data.length * groupWidth + 40,
                    560
                  );

                  return (
                    <div className="relative" style={{ minWidth: minPlotWidth }}>
                      <div className="relative" style={{ height: plotHeight }}>
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                          {ticks
                            .slice()
                            .reverse()
                            .map((value) => (
                              <div
                                key={value}
                                className="border-t border-slate-200/80"
                              />
                            ))}
                        </div>

                        <div className="relative z-10 flex h-full items-end justify-between gap-7 px-2">
                          {data.map((item, index) => {
                            const totalPx = (item.total / yMax) * plotHeight;
                            const onlinePx = (item.online / yMax) * plotHeight;

                            return (
                              <div
                                key={`${item.name}-${index}`}
                                className="flex items-end justify-center gap-4"
                                style={{ width: groupWidth, height: plotHeight }}
                              >
                                <div
                                  className="w-8 rounded-t-xl bg-[#429195]"
                                  style={{ height: `${totalPx}px` }}
                                />

                                <div
                                  className="w-8 rounded-t-xl bg-[#a1d0be]"
                                  style={{ height: `${onlinePx}px` }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3 flex items-start justify-between gap-7 px-2">
                        {data.map((item, index) => (
                          <div
                            key={`label-${item.name}-${index}`}
                            className="text-center text-[11px] font-bold text-slate-700"
                            style={{ width: groupWidth }}
                            dir="rtl"
                          >
                            {item.name}
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
  const items = report?.reportOs ?? [];

  return sortPieData(
    items
      .map((item, index) => {
        const name = getChartItemName(item, `سیستم عامل ${index + 1}`);
        const value = getChartItemValue(item);

        return {
          name,
          value,
          color: getStableColor(name),
        };
      })
      .filter((item) => item.value > 0)
  );
}

function buildHardwarePieData(report: DashboardReportData | null) {
  const items = report?.reportHard ?? [];

  return sortPieData(
    items
      .map((item, index) => {
        const name = getChartItemName(item, `سخت افزار ${index + 1}`);
        const value = getChartItemValue(item);

        return {
          name,
          value,
          color: getStableColor(name),
        };
      })
      .filter((item) => item.value > 0)
  );
}

function buildRegionsData(report: DashboardReportData | null) {
  const zoneItems = report?.reportZone ?? [];
  const hardItems = report?.reportHard ?? [];

  const totalDataset =
    zoneItems.find((item) => String(item.label ?? "").includes("کل")) ??
    zoneItems[0];

  const onlineDataset =
    zoneItems.find(
      (item) =>
        String(item.label ?? "").includes("انلاین") ||
        String(item.label ?? "").includes("آنلاین")
    ) ?? zoneItems[1];

  const totalData = totalDataset?.data ?? [];
  const onlineData = onlineDataset?.data ?? [];
  const length = Math.max(totalData.length, onlineData.length, hardItems.length);

  return Array.from({ length }).map((_, index) => ({
    name: getChartItemName(hardItems[index], `مورد ${index + 1}`),
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
      name: <span className="font-bold text-slate-900">{name}</span>,
      status: <StatusPill value={status} />,
      ip: <span className="font-mono text-[12px] text-slate-800">{ip}</span>,
    };
  });
}

export default function DashboardTabs({
  report,
  reportLoading = false,
  reportError = "",
  onRetryReport,
}: DashboardTabsProps) {
  const tabs = useMemo(
    () => [
      {
        key: "servers" as const,
        label: "سرورها",
        fullLabel: "وضعیت سرورها",
        icon: <FiServer size={16} />,
      },
      {
        key: "hw_os" as const,
        label: "سخت‌افزار",
        fullLabel: "سخت‌افزار و سیستم‌عامل",
        icon: <FiCpu size={16} />,
      },
      {
        key: "routers" as const,
        label: "رادیوها",
        fullLabel: "روترها و آنتن‌دهی",
        icon: <FiWifi size={16} />,
      },
      {
        key: "regions" as const,
        label: "مناطق",
        fullLabel: "اطلاعات منطقه",
        icon: <FiMapPin size={16} />,
      },
    ],
    []
  );

  const [active, setActive] = useState<TabKey>("servers");

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#163647] p-3">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = active === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-[12px] font-black transition sm:shrink-0 sm:px-4 sm:text-[13px]",
                  isActive
                    ? "bg-white text-[#163647] shadow-sm"
                    : "bg-white/5 text-white/85 hover:bg-white/10",
                ].join(" ")}
              >
                {tab.icon}
                <span className="sm:hidden">{tab.label}</span>
                <span className="hidden sm:inline">{tab.fullLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 sm:p-5">
        {active === "servers" ? <ServersTab /> : null}

        {active === "hw_os" ? (
          <HwOsTab
            report={report}
            reportLoading={reportLoading}
            reportError={reportError}
            onRetryReport={onRetryReport}
          />
        ) : null}

        {active === "routers" ? (
          <NetworkTab
            report={report}
            reportLoading={reportLoading}
            reportError={reportError}
            onRetryReport={onRetryReport}
          />
        ) : null}

        {active === "regions" ? (
          <RegionsTab
            report={report}
            reportLoading={reportLoading}
            reportError={reportError}
            onRetryReport={onRetryReport}
          />
        ) : null}
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

      setServers(Array.isArray(rows) ? rows : []);
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

        if (isMounted) setServers(Array.isArray(rows) ? rows : []);
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
          setServers(Array.isArray(rows) ? rows : []);
          setErrorMessage("");
        }
      } catch (error) {
        console.log("CUP SERVER INFO POLLING ERROR:", error);

        if (isMounted) {
          setErrorMessage("خطا در بروزرسانی اطلاعات وضعیت سرورها");
        }
      }
    }, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const rows = servers.map((server) => ({
    server: <span className="font-bold text-slate-900">{server.name}</span>,
    status: <StatusPill value={server.status} />,
    ip: <span className="font-mono text-[12px] text-slate-800">{server.ip}</span>,
    cpu: (
      <span className="font-extrabold text-slate-900">
        {toPersianNumber(server.cpu)}%
      </span>
    ),
    ram: (
      <span className="font-extrabold text-slate-900">
        {toPersianNumber(server.ram)}%
      </span>
    ),
  }));

  return (
    <PanelCard title="وضعیت سرورها" icon={<FiServer size={18} />}>
      {loading ? <LoadingRow /> : null}

      {!loading && errorMessage ? (
        <ErrorBox message={errorMessage} onRetry={() => fetchServers(true)} />
      ) : null}

      {!loading && !errorMessage ? (
        <>
          <MobileServerCards servers={servers} />

          {rows.length > 0 ? (
            <DesktopTable
              columns={[
                { key: "server", label: "سرور" },
                { key: "status", label: "وضعیت" },
                { key: "ip", label: "IP آدرس" },
                { key: "cpu", label: "CPU", className: "text-center" },
                { key: "ram", label: "RAM", className: "text-center" },
              ]}
              rows={rows}
            />
          ) : null}
        </>
      ) : null}
    </PanelCard>
  );
}

function HwOsTab({
  report,
  reportLoading,
  reportError,
  onRetryReport,
}: DashboardTabsProps) {
  const osPie = buildOsPieData(report);
  const hardPie = buildHardwarePieData(report);

  if (reportLoading && !report) {
    return (
      <PanelCard title="سخت‌افزار و سیستم‌عامل" icon={<FiCpu size={18} />}>
        <LoadingRow />
      </PanelCard>
    );
  }

  if (reportError && !report) {
    return (
      <PanelCard title="سخت‌افزار و سیستم‌عامل" icon={<FiCpu size={18} />}>
        <ErrorBox message={reportError} onRetry={onRetryReport} />
      </PanelCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <PanelCard title="توزیع سخت‌افزار" icon={<FiCpu size={18} />}>
        {hardPie.length > 0 ? <SimplePieChart data={hardPie} /> : <EmptyState />}
      </PanelCard>

      <PanelCard title="توزیع سیستم‌عامل" icon={<FiCpu size={18} />}>
        {osPie.length > 0 ? <SimplePieChart data={osPie} /> : <EmptyState />}
      </PanelCard>
    </div>
  );
}

function NetworkTab({
  report,
  reportLoading,
  reportError,
  onRetryReport,
}: DashboardTabsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const rows = buildRadioRows(report?.redioList ?? []);
  const totalItems = rows.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  if (reportLoading && !report) {
    return (
      <PanelCard title="روترها و آنتن‌دهی" icon={<FiWifi size={18} />}>
        <LoadingRow />
      </PanelCard>
    );
  }

  if (reportError && !report) {
    return (
      <PanelCard title="روترها و آنتن‌دهی" icon={<FiWifi size={18} />}>
        <ErrorBox message={reportError} onRetry={onRetryReport} />
      </PanelCard>
    );
  }

  return (
    <PanelCard title="روترها و آنتن‌دهی" icon={<FiWifi size={18} />}>
      {rows.length === 0 ? <EmptyState /> : null}

      {rows.length > 0 ? (
        <>
          <MobileRadioCards rows={paginatedRows} />

          <DesktopTable
            columns={[
              { key: "name", label: "لینک" },
              { key: "status", label: "وضعیت" },
              { key: "ip", label: "IP", className: "text-center" },
            ]}
            rows={paginatedRows}
          />

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center text-[12px] font-bold text-slate-500 sm:text-right">
              نمایش {toPersianNumber(startIndex + 1)} تا{" "}
              {toPersianNumber(Math.min(startIndex + pageSize, totalItems))} از{" "}
              {toPersianNumber(totalItems)} مورد
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                قبلی
              </button>

              <span className="rounded-xl bg-[#163647] px-4 py-2 text-[12px] font-extrabold text-white">
                {toPersianNumber(currentPage)} / {toPersianNumber(totalPages)}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                بعدی
              </button>
            </div>
          </div>
        </>
      ) : null}
    </PanelCard>
  );
}

function RegionsTab({
  report,
  reportLoading,
  reportError,
  onRetryReport,
}: DashboardTabsProps) {
  const regions = buildRegionsData(report);

  if (reportLoading && !report) {
    return (
      <PanelCard title="اطلاعات منطقه" icon={<FiMapPin size={18} />}>
        <LoadingRow />
      </PanelCard>
    );
  }

  if (reportError && !report) {
    return (
      <PanelCard title="اطلاعات منطقه" icon={<FiMapPin size={18} />}>
        <ErrorBox message={reportError} onRetry={onRetryReport} />
      </PanelCard>
    );
  }

  if (regions.length === 0) {
    return (
      <PanelCard title="اطلاعات منطقه" icon={<FiMapPin size={18} />}>
        <EmptyState />
      </PanelCard>
    );
  }

  return <RegionsTotalOnlineBarChart title="کل اطلاعات بر حسب منطقه" data={regions} />;
}