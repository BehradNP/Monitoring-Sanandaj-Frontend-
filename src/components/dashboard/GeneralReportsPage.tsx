"use client";

import React, { useMemo, useState } from "react";

type TabKey = "cpu" | "gpu" | "mobo" | "ram" | "hw" | "sw" | "os";

const BRAND_DARK = "#163647";
const BRAND_PRIMARY = "#2f7f86";
const BRAND_TOTAL = "#429195";

const tabs: { key: TabKey; label: string }[] = [
  { key: "cpu", label: "اطلاعات CPU" },
  { key: "gpu", label: "اطلاعات GPU" },
  { key: "mobo", label: "اطلاعات مادربرد" },
  { key: "ram", label: "اطلاعات RAM" },
  { key: "hw", label: "اطلاعات سخت‌افزاری (پرینتر و ...)" },
  { key: "sw", label: "اطلاعات نرم‌افزاری" },
  { key: "os", label: "اطلاعات سیستم عامل" },
];

const mockRegions = [
  { label: "انتخاب کنید...", value: "" },
  { label: "مدیریت پیشگیری و ممیزی", value: "prevention" },
  { label: "Mashaghel", value: "mashaghel" },
  { label: "Area 1", value: "area1" },
  { label: "Area 2", value: "area2" },
  { label: "Area 3", value: "area3" },
  { label: "Area 4", value: "area4" },
];

type Row = {
  region: string;
  ip: string;
  mac: string;
  userName: string;

  cpu: string;
  cpuManufacturer: string;
  cpuLogical: number;
  cpuCores: number;

  gpu: string;

  mobo: string;

  ramTotal: string;

  hwDevices: string; // printer, ...
  swCount: number;

  os: string;
};

const mockRows: Row[] = Array.from({ length: 32 }).map((_, i) => ({
  region: "Area 1",
  ip: `172.16.5.${(i % 200) + 1}`,
  mac: `AF:BF:FA:5A:7A:${String((i % 90) + 10).padStart(2, "0")}`,
  userName: i % 3 === 0 ? "" : "Ardalan",

  cpu: i % 2 === 0 ? "Intel(R) Xeon(R) CPU E5-2690 v2 @ 3.00GHz" : "Pentium(R) Dual-Core CPU E5700 @ 3.00GHz",
  cpuManufacturer: "GenuineIntel",
  cpuLogical: (i % 8) + 1,
  cpuCores: (i % 6) + 1,

  gpu: "Intel UHD Graphics",

  mobo: "PRIME H510M-K (ASUSTeK)",

  ramTotal: `${(i % 4) * 4 + 8} GB`,

  hwDevices: i % 2 === 0 ? "HP LaserJet Pro / Scanner" : "Printer / UPS",
  swCount: (i % 40) + 1,

  os: "Microsoft Windows 11 Pro",
}));

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Card({
  titleRight,
  titleLeft,
  children,
}: {
  titleRight: string;
  titleLeft?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between rounded-t-2xl" style={{ backgroundColor: BRAND_DARK }}>
        <div className="text-white font-extrabold text-[13px]" dir="rtl">
          {titleRight}
        </div>
        {titleLeft ? <div className="text-white/80 text-[12px]">{titleLeft}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SelectInput({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-full">
      <label className="block text-[12px] font-extrabold text-slate-800 mb-2" dir="rtl">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="rtl"
          className="w-full appearance-none px-3 py-3 rounded-xl border border-slate-300 bg-white text-[13px] text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="" className="text-slate-600">
            {placeholder}
          </option>
          {options
            .filter((o) => o.value !== "")
            .map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
        </select>

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">▾</span>
      </div>
    </div>
  );
}

type Column = { key: keyof Row; label: string; minWidth?: number; dir?: "rtl" | "ltr" };

function getColumns(tab: TabKey): Column[] {
  const base: Column[] = [
    { key: "region", label: "منطقه", minWidth: 120, dir: "rtl" },
    { key: "ip", label: "IP", minWidth: 140, dir: "ltr" },
    { key: "mac", label: "MAC", minWidth: 190, dir: "ltr" },
    { key: "userName", label: "User Name", minWidth: 140, dir: "ltr" },
  ];

  if (tab === "cpu")
    return [
      ...base,
      { key: "cpu", label: "CPU", minWidth: 360, dir: "ltr" },
      { key: "cpuManufacturer", label: "CPU Manufacturer", minWidth: 180, dir: "ltr" },
      { key: "cpuLogical", label: "Logical Processors", minWidth: 190, dir: "ltr" },
      { key: "cpuCores", label: "Cores", minWidth: 110, dir: "ltr" },
    ];

  if (tab === "gpu")
    return [
      ...base,
      { key: "gpu", label: "GPU", minWidth: 320, dir: "ltr" },
    ];

  if (tab === "mobo")
    return [
      ...base,
      { key: "mobo", label: "Motherboard", minWidth: 340, dir: "ltr" },
    ];

  if (tab === "ram")
    return [
      ...base,
      { key: "ramTotal", label: "RAM Total", minWidth: 180, dir: "ltr" },
    ];

  if (tab === "hw")
    return [
      ...base,
      { key: "hwDevices", label: "Devices", minWidth: 320, dir: "ltr" },
    ];

  if (tab === "sw")
    return [
      ...base,
      { key: "swCount", label: "Software Count", minWidth: 170, dir: "ltr" },
    ];

  // os
  return [
    ...base,
    { key: "os", label: "OS", minWidth: 280, dir: "ltr" },
  ];
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const start = Math.max(1, page - 3);
    const end = Math.min(totalPages, page + 3);
    const arr: number[] = [];
    for (let p = start; p <= end; p++) arr.push(p);
    return arr;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50" dir="rtl">
      <div className="text-[12px] text-slate-700 font-semibold">
        صفحه {page} از {totalPages}
      </div>

      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
          onClick={() => onPage(Math.max(1, page - 1))}
          title="قبلی"
        >
          ‹
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={cx(
              "w-8 h-8 rounded-full text-[12px] border font-extrabold",
              p === page ? "text-white border-transparent" : "bg-white border-slate-300 hover:bg-slate-50 text-slate-900"
            )}
            style={p === page ? { backgroundColor: BRAND_TOTAL } : undefined}
          >
            {p}
          </button>
        ))}

        <button
          className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          title="بعدی"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function GeneralReportsPage() {
  const [region, setRegion] = useState("");
  const [tab, setTab] = useState<TabKey>("cpu");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const columns = useMemo(() => getColumns(tab), [tab]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return mockRows.filter((r) => {
      if (region) {
        // اینجا صرفاً موک؛ شما بعداً با API فیلتر می‌کنی
        // فعلاً همه رو نگه می‌داریم
      }
      if (!qq) return true;
      return Object.values(r).join(" ").toLowerCase().includes(qq);
    });
  }, [q, region]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4" dir="rtl">
      <Card titleRight="گزارش کلی شبکه" titleLeft="گزارشات عمومی">
        {/* Region select (مثل صفحه QR) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SelectInput
            label="انتخاب منطقه"
            placeholder="انتخاب کنید..."
            options={mockRegions}
            value={region}
            onChange={(v) => {
              setRegion(v);
              setPage(1);
            }}
          />

          {/* جای خالی برای هم‌خوانی با چینش QR (اگر بعداً فیلتر اضافه شد) */}
          <div className="hidden lg:block" />
          <div className="hidden lg:block" />
        </div>

        {/* Tabs */}
        <div className="mt-5 border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-2 py-2">
            <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
              {tabs.map((t) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      setTab(t.key);
                      setPage(1);
                    }}
                    className={cx(
                      "px-4 py-2 text-[13px] rounded-xl border font-extrabold transition",
                      active ? "bg-white border-slate-300 text-slate-900" : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-white"
                    )}
                    style={active ? { boxShadow: "0 1px 0 rgba(0,0,0,0.04)" } : undefined}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white px-3 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[13px] font-extrabold text-slate-900" dir="rtl">
              {tabs.find((t) => t.key === tab)?.label}
            </div>

            <div className="flex items-center gap-2" dir="rtl">
              <span className="text-[13px] font-bold text-slate-800">جستجو</span>
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-[260px] rounded-xl border border-slate-300 bg-white px-3 text-[13px] text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button
                type="button"
                className="h-10 px-4 rounded-xl text-[13px] font-extrabold text-white shadow-sm hover:opacity-95 transition"
                style={{ backgroundColor: BRAND_PRIMARY }}
                onClick={() => setQ("")}
              >
                پاک کردن
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-center" dir="rtl">
                <thead>
                  <tr className="text-[13px] text-slate-900 bg-slate-50">
                    {columns.map((c) => (
                      <th
                        key={String(c.key)}
                        className="py-3 px-3 font-extrabold text-center border-b border-slate-200 whitespace-nowrap"
                        style={{ minWidth: c.minWidth ?? 120 }}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="text-[13px] text-slate-900 font-semibold">
                  {pageRows.map((row, idx) => (
                    <tr key={idx} className={cx("border-t border-slate-200 hover:bg-slate-50 transition", idx % 2 ? "bg-white" : "bg-[#fcfcfc]")}>
                      {columns.map((c) => (
                        <td
                          key={String(c.key)}
                          className="py-3 px-3 text-center whitespace-nowrap"
                          dir={c.dir ?? "rtl"}
                        >
                          {String(row[c.key] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {!pageRows.length ? (
                    <tr>
                      <td colSpan={columns.length} className="py-10 text-center text-[13px] text-slate-700 font-bold">
                        دیتایی برای نمایش وجود ندارد
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={(p) => setPage(p)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
