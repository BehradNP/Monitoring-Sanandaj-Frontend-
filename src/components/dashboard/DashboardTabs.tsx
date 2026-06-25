"use client";

import React, { useMemo, useState } from "react";
import {
  FiServer,
  FiCpu,
  FiWifi,
  FiAperture,
  FiMapPin,
  FiChevronLeft,
} from "react-icons/fi";

// ---------- Types ----------
type TabKey = "servers" | "hw_os" | "routers" | "regions";


// ---------- Simple Charts (بدون recharts) ----------
function SimplePieChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;

  return (
    <div className="flex gap-6 items-center">
      {/* Pie */}
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

      {/* Legend */}
      <div className="space-y-2 text-sm">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-800 font-medium">{d.name}</span>
            <span className="text-slate-600 mr-auto">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleBandwidthTable({
  rows,
  nameLabel,
}: {
  nameLabel: string;
  rows: { name: string; status: "ONLINE" | "OFFLINE"; bandwidth: number }[];
}) {
  return (
    <PanelCard title={nameLabel}>
      <SimpleTable
        columns={[
          { key: "name", label: nameLabel, className: "text-slate-800" },
          { key: "status", label: "وضعیت", className: "text-slate-800" },
          { key: "bandwidth", label: "پهنای باند", className: "text-left text-slate-800" },
        ]}
        rows={rows.map((r) => ({
          name: <span className="font-medium text-slate-900">{r.name}</span>,
          status: <StatusPill value={r.status} />,
          bandwidth: (
            <span className="font-semibold text-slate-900">
              {r.bandwidth} Mbps
            </span>
          ),
        }))}
      />
    </PanelCard>
  );
}

export function SimpleBarChartLikeChartJS({
  title,
  labels,
  values,
  maxY,
  step,
}: {
  title: string;
  labels: string[];
  values: number[];
  maxY?: number;
  step?: number;
}) {
  const [hover, setHover] = React.useState<{ i: number; x: number; y: number } | null>(
    null
  );

  const _step = step ?? 5;
  const computedMax = Math.max(...values, 1);
  const yMax = maxY ?? Math.ceil(computedMax / _step) * _step;

  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += _step) ticks.push(v);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Title */}
      <div className="px-4 py-4">
        <h2 className="text-[14px] font-extrabold text-slate-900 text-center">
          {title}
        </h2>
      </div>

      {/* Chart */}
      <div className="relative px-6 pb-6">
        <div className="relative h-[300px]">
          {/* فقط بخش نمودار LTR تا محور Y سمت چپ باشه */}
          <div className="absolute inset-0 flex" dir="ltr">
            {/* Y Axis (Left) */}
            <div className="w-10 pr-2 flex flex-col justify-between text-[12px] text-slate-500">
              {ticks
                .slice()
                .reverse()
                .map((v) => (
                  <div key={v} className="leading-none text-left">
                    {v}
                  </div>
                ))}
            </div>

            {/* Grid + Bars */}
            <div className="flex-1 relative">
              {/* Grid lines خلوت */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {ticks
                  .slice()
                  .reverse()
                  .map((v) => (
                    <div key={v} className="border-t border-slate-200/60" />
                  ))}
              </div>

              {/* Bars */}
              <div className="relative z-10 h-full flex items-end justify-between gap-8 px-2">
                {labels.map((lab, i) => {
                  const val = values[i] ?? 0;
                  const h = (val / yMax) * 100;

                  return (
                    <div
                      key={lab}
                      className="flex-1 min-w-[70px] flex flex-col items-center"
                    >
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-[78%] max-w-[90px] bg-[#0a4a9b] rounded-[8px]"
                          style={{ height: `${h}%` }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHover({
                              i,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setHover(null)}
                        />
                      </div>

                      {/* X label فارسی */}
                      <div className="mt-3 text-[12px] text-slate-600" dir="rtl">
                        {lab}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {hover && (
            <div
              className="fixed z-[9999] pointer-events-none"
              style={{
                left: hover.x,
                top: hover.y - 12,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="bg-black/80 text-white text-[12px] rounded-md px-3 py-2 shadow-lg">
                <div className="font-bold mb-1" dir="rtl">
                  {labels[hover.i]}
                </div>
                <div className="flex items-center gap-2" dir="rtl">
                  <span className="inline-block w-2.5 h-2.5 bg-[#0a4a9b] rounded-sm" />
                  <span>مقدار: {values[hover.i]}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}



function SimpleVerticalBars({
  data,
}: {
  data: { name: string; online: number; offline: number }[];
}) {
  const max = Math.max(...data.map((d) => d.online + d.offline));
  const gridLines = 4; // مثل طراحی قبلی: کم و تمیز

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center justify-start gap-4 text-[12px] text-slate-700 mb-3">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-emerald-500" />
          آنلاین
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-rose-500" />
          آفلاین
        </span>
      </div>

      {/* Plot Area */}
      <div className="relative h-[260px]">
        {/* Grid lines (فقط پشت میله‌ها) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {Array.from({ length: gridLines + 1 }).map((_, i) => (
            <div
              key={i}
              className="border-t border-slate-200/70"
            />
          ))}
        </div>

        {/* Bars */}
        <div className="relative z-10 flex items-end justify-between gap-8 h-full px-6">
          {data.map((d) => {
            const onlineH = (d.online / max) * 100;
            const offlineH = (d.offline / max) * 100;

            return (
              <div
                key={d.name}
                className="flex-1 min-w-[90px] flex flex-col items-center gap-2"
              >
                <div className="w-full flex items-end justify-center gap-3 h-[210px]">
                  <div
                    className="w-7 rounded-t-lg bg-emerald-500"
                    style={{ height: `${onlineH}%` }}
                  />
                  <div
                    className="w-7 rounded-t-lg bg-rose-500"
                    style={{ height: `${offlineH}%` }}
                  />
                </div>

                <div className="text-[12px] text-slate-900 font-bold">
                  {d.name}
                </div>
                <div className="text-[11px] text-slate-600">
                  کل {d.online + d.offline}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


const mockRegionsBar = [
  { name: "ناحیه ۱", online: 58, offline: 6 },
  { name: "ناحیه ۲", online: 41, offline: 9 },
  { name: "ناحیه ۳", online: 33, offline: 4 },
  { name: "ناحیه ۴", online: 19, offline: 7 },
  { name: "فاوا", online: 12, offline: 1 },
];


// ---------- Mock Data (فقط ONLINE / OFFLINE) ----------
const mockServers: {
  name: string;
  status: "ONLINE" | "OFFLINE";
  ip: string;
  cpu: number;
  ram: number;
}[] = [
    { name: "Server-01", status: "ONLINE", ip: "172.16.0.21", cpu: 18, ram: 42 },
    { name: "Server-02", status: "ONLINE", ip: "172.16.0.22", cpu: 35, ram: 61 },
    { name: "Server-03", status: "OFFLINE", ip: "172.16.0.23", cpu: 0, ram: 0 },
    { name: "Server-04", status: "ONLINE", ip: "172.16.0.24", cpu: 22, ram: 48 },
    { name: "Server-05", status: "OFFLINE", ip: "172.16.0.25", cpu: 0, ram: 0 },
  ];

const mockHardware = [
  { name: "Core i5", value: 38 },
  { name: "Core i7", value: 22 },
  { name: "Ryzen 5", value: 18 },
  { name: "Ryzen 7", value: 12 },
  { name: "سایر", value: 10 },
];

const mockOS = [
  { name: "Windows 10", value: 44 },
  { name: "Windows 11", value: 26 },
  { name: "Linux", value: 18 },
  { name: "Windows Server", value: 12 },
];

const mockRouters: { name: string; status: "ONLINE" | "OFFLINE"; bandwidth: number }[] = [
  { name: "Router-A", status: "ONLINE", bandwidth: 120 },
  { name: "Router-B", status: "ONLINE", bandwidth: 85 },
  { name: "Router-C", status: "OFFLINE", bandwidth: 0 },
  { name: "Router-D", status: "ONLINE", bandwidth: 35 },
];

const mockAntennas: { name: string; status: "ONLINE" | "OFFLINE"; bandwidth: number }[] = [
  { name: "Site-01", status: "ONLINE", bandwidth: 45 },
  { name: "Site-02", status: "ONLINE", bandwidth: 62 },
  { name: "Site-03", status: "OFFLINE", bandwidth: 0 },
  { name: "Site-04", status: "ONLINE", bandwidth: 18 },
];

const mockRegionsBars = [
  { name: "ناحیه ۱", online: 58, offline: 6 },
  { name: "ناحیه ۲", online: 41, offline: 9 },
  { name: "ناحیه ۳", online: 33, offline: 4 },
  { name: "ناحیه ۴", online: 19, offline: 7 },
  { name: "فاوا", online: 12, offline: 1 },
];

const PIE_COLORS = ["#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#94a3b8"];

// ---------- Small UI helpers ----------
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

function StatusPill({ value }: { value: "ONLINE" | "OFFLINE" }) {
  const isOnline = value === "ONLINE";
  return (
    <span
      className={[
        "px-2.5 py-1 rounded-full text-[11px] font-bold",
        isOnline ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800",
      ].join(" ")}
    >
      {isOnline ? "آنلاین" : "آفلاین"}
    </span>
  );
}

function SimpleTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, any>[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead>
          <tr className="text-[12px] text-slate-700">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`py-3 px-3 font-bold ${c.className ?? ""}`}
              >
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

function RegionsTotalOnlineBarChart({
  title,
  data,
}: {
  title: string;
  data: { name: string; total: number; online: number }[];
}) {
  // ارتفاع واقعی ناحیه رسم
  const PLOT_H = 240;
  const step = 5;

  const maxValue = Math.max(...data.map((d) => Math.max(d.total, d.online)), 1);
  const yMax = Math.ceil(maxValue / step) * step;

  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);

  // ✅ تنظیمات اسکرول افقی (برای 30 تا آیتم)
  // هر گروه (دو میله + لیبل) حدوداً 120px هست، با gap ها
  const GROUP_W = 120;
  const GAP = 40; // تقریبی برای gap-10 (2.5rem)
  const minPlotW = Math.max(0, data.length * GROUP_W + (data.length - 1) * GAP);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-4">
        <h2 className="text-[14px] font-extrabold text-slate-900 text-center">
          {title}
        </h2>
      </div>

      <div className="px-6 pb-6">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-[12px] mb-3">
          {/* کل */}
          <span className="inline-flex items-center gap-2 text-slate-800">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "#429195" }} // رنگ سازمانی کل
            />
            کل
          </span>

          {/* آنلاین */}
          <span className="inline-flex items-center gap-2 text-slate-800">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "#a1d0be" }} // رنگ سازمانی آنلاین
            />
            آنلاین
          </span>
        </div>


        {/* Chart (LTR فقط برای اینکه محور Y سمت چپ بیاد) */}
        <div className="relative" dir="ltr">
          <div className="flex">
            {/* Y axis numbers (LEFT) */}
            <div
              className="w-10 pr-2 flex flex-col justify-between text-[12px] text-slate-500"
              style={{ height: PLOT_H }}
            >
              {ticks
                .slice()
                .reverse()
                .map((v) => (
                  <div key={v} className="leading-none text-left">
                    {v}
                  </div>
                ))}
            </div>

            {/* Plot area */}
            <div className="flex-1 relative min-w-0">
              {/* ✅ اسکرول افقی فقط برای قسمت نمودار */}
              <div className="overflow-x-auto w-full min-w-0 pb-2">
                {(() => {
                  const GROUP_W = 120; // عرض هر گروه
                  const minPlotW = Math.max(data.length * GROUP_W + 40, 600);

                  return (
                    <div className="relative" style={{ minWidth: minPlotW }}>
                      {/* ====== PLOT (Grid + Bars) ====== */}
                      <div className="relative" style={{ height: PLOT_H }}>
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {ticks.slice().reverse().map((v) => (
                            <div key={v} className="border-t border-slate-200/80" />
                          ))}
                        </div>

                        {/* Bars row */}
                        <div className="relative z-10 h-full flex items-end justify-between gap-10 px-2">
                          {data.map((d, idx) => {
                            const totalPx = (d.total / yMax) * PLOT_H;
                            const onlinePx = (d.online / yMax) * PLOT_H;

                            return (
                              <div
                                key={`${d.name}-${idx}`}
                                className="flex items-end justify-center gap-6"
                                style={{ width: GROUP_W, height: PLOT_H }}
                              >
                                <div
                                  className="w-10 rounded-t-[8px]"
                                  style={{ height: `${totalPx}px`, backgroundColor: "#429195" }}
                                  title={`کل: ${d.total}`}
                                />
                                <div
                                  className="w-10 rounded-t-[8px]"
                                  style={{ height: `${onlinePx}px`, backgroundColor: "#a1d0be" }}
                                  title={`آنلاین: ${d.online}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ====== X LABELS ====== */}
                      <div className="flex items-start justify-between gap-10 px-2 mt-3">
                        {data.map((d, idx) => (
                          <div
                            key={`lbl-${d.name}-${idx}`}
                            className="text-[12px] text-slate-700 text-center"
                            style={{ width: GROUP_W }}
                            dir="rtl"
                          >
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

        {/* Note (اگر خواستی بعداً اضافه کن) */}
      </div>
    </section>
  );
}




// ---------- Tabs ----------
export default function DashboardTabs() {
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
      {/* Tabs Header (bg تغییر داده شد) */}
      <div className="px-4 py-3 border-b border-slate-200 bg-[#163647]">
        <div className="flex flex-wrap items-center gap-2 justify-start rtl:justify-start">
          {tabs.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActive(t.key)}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] transition cursor-pointer",
                  isActive
                    ? "bg-white text-[#163647] shadow-sm font-bold"
                    : "bg-transparent text-white/85 hover:bg-white/10",
                ].join(" ")}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {active === "servers" && <ServersTab />}
        {active === "hw_os" && <HwOsTab />}
        {active === "routers" && <NetworkTab />}
        {active === "regions" && <RegionsTab />}
      </div>
    </section>
  );
}

// ---------- Tab Contents ----------

function ServersTab() {
  const rows = mockServers.map((s) => ({
    server: <span className="font-medium text-slate-900">{s.name}</span>,
    status: <StatusPill value={s.status} />,
    ip: <span className="font-mono text-[12px] text-slate-800">{s.ip}</span>,
    cpu: <span className="font-semibold text-slate-900">{s.cpu}%</span>,
    ram: <span className="font-semibold text-slate-900">{s.ram}%</span>,
  }));

  return (
    <PanelCard title="وضعیت سرورها">
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

      <div className="mt-3 text-[12px] text-slate-700 flex items-center gap-2 justify-end">

      </div>
    </PanelCard>
  );
}

function HwOsTab() {
  const hwPie = mockHardware.map((d, i) => ({
    name: d.name,
    value: d.value,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const osPie = mockOS.map((d, i) => ({
    name: d.name,
    value: d.value,
    color: PIE_COLORS[(i + 1) % PIE_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PanelCard title="توزیع سخت افزار">
        <SimplePieChart data={hwPie} />
      </PanelCard>

      <PanelCard title="توزیع سیستم عامل">
        {/* گفتی برای OS بعداً می‌گی چی کار کنیم؛ فعلاً همین پیش‌نمایش */}
        <SimplePieChart data={osPie} />
      </PanelCard>
    </div>
  );
}

function NetworkTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SimpleBandwidthTable nameLabel="وضعیت روترها" rows={mockRouters} />
      <SimpleBandwidthTable nameLabel="آنتن‌دهی / لینک‌ها" rows={mockAntennas} />
    </div>
  );
}


function RegionsTab() {
  // نمونه‌ی قبلی شما: دو ستون «کل» و «آنلاین»
  const regions = [
    { name: "ناحیه ۱", total: 64, online: 58 },
    { name: "ناحیه ۲", total: 50, online: 41 },
    { name: "ناحیه ۳", total: 37, online: 33 },
    { name: "ناحیه ۴", total: 26, online: 19 },
    { name: "فاوا", total: 13, online: 12 },
  ];

  return (
    <RegionsTotalOnlineBarChart
      title="کل اطلاعات بر حسب منطقه"
      data={regions}
    />
  );
}


