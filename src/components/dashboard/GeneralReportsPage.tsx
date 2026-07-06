"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import generalReportsService from "@/services/general-reports-service";
import type { GeneralReportRow, GeneralReportTabKey } from "@/types/general-reports";

const BRAND_DARK = "#163647";
const BRAND_PRIMARY = "#2f7f86";
const BRAND_TOTAL = "#429195";

const PAGE_SIZE = 10;

const tabs: { key: GeneralReportTabKey; label: string }[] = [
  { key: "cpu", label: "اطلاعات CPU" },
  { key: "gpu", label: "اطلاعات GPU" },
  { key: "mobo", label: "اطلاعات مادربرد" },
  { key: "ram", label: "اطلاعات RAM" },
  { key: "hdd", label: "اطلاعات هارد" },
  { key: "hw", label: "اطلاعات سخت‌افزاری (پرینتر و ...)" },
  { key: "sw", label: "اطلاعات نرم‌افزاری" },
  { key: "os", label: "اطلاعات سیستم عامل" },
];

type Column = {
  key: string;
  label: string;
  minWidth?: number;
  dir?: "rtl" | "ltr";
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function getText(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function getColumns(tab: GeneralReportTabKey): Column[] {
  const base: Column[] = [
    { key: "ZoneNetworkTitle", label: "منطقه", minWidth: 120, dir: "rtl" },
    { key: "IP", label: "IP", minWidth: 140, dir: "ltr" },
    { key: "MacAdderss", label: "MAC", minWidth: 190, dir: "ltr" },
    { key: "UserName", label: "User Name", minWidth: 140, dir: "ltr" },
  ];

  if (tab === "cpu") {
    return [
      ...base,
      { key: "CPU", label: "CPU", minWidth: 360, dir: "ltr" },
      { key: "CPUProcessorId", label: "Processor ID", minWidth: 190, dir: "ltr" },
      { key: "CPUManufacturer", label: "Manufacturer", minWidth: 180, dir: "ltr" },
      { key: "CPUNumberOfLogicalProcessors", label: "Logical Processors", minWidth: 170, dir: "ltr" },
      { key: "CPUNumberOfCores", label: "Cores", minWidth: 110, dir: "ltr" },
    ];
  }

  if (tab === "gpu") {
    return [
      ...base,
      { key: "VGAVideoProcessor", label: "Video Processor", minWidth: 280, dir: "ltr" },
      { key: "VGAname", label: "VGA Name", minWidth: 360, dir: "ltr" },
      { key: "VGAVideoModeDescription", label: "Video Mode", minWidth: 300, dir: "ltr" },
      { key: "VGAStatus", label: "Status", minWidth: 110, dir: "ltr" },
      { key: "VGAAdapterRAM", label: "Adapter RAM", minWidth: 150, dir: "ltr" },
    ];
  }

  if (tab === "mobo") {
    return [
      ...base,
      { key: "Device", label: "Device", minWidth: 360, dir: "ltr" },
    ];
  }

  if (tab === "ram") {
    return [
      ...base,
      { key: "RAMPartNumber", label: "Part Number", minWidth: 220, dir: "ltr" },
      { key: "RAMMemoryType", label: "Memory Type", minWidth: 140, dir: "ltr" },
      { key: "RAMSpeed", label: "Speed", minWidth: 120, dir: "ltr" },
      { key: "RAMCapacity", label: "Capacity", minWidth: 120, dir: "ltr" },
      { key: "RAMManufacturer", label: "Manufacturer", minWidth: 200, dir: "ltr" },
    ];
  }

  if (tab === "hdd") {
    return [
      ...base,
      { key: "Title", label: "Title", minWidth: 280, dir: "ltr" },
      { key: "Device", label: "Device", minWidth: 280, dir: "ltr" },
    ];
  }

  if (tab === "hw") {
    return [
      ...base,
      { key: "Title", label: "Title", minWidth: 280, dir: "ltr" },
      { key: "Device", label: "Device", minWidth: 320, dir: "ltr" },
    ];
  }

  if (tab === "sw") {
    return [
      ...base,
      { key: "Title", label: "Software", minWidth: 420, dir: "ltr" },
    ];
  }

  return [
    ...base,
    { key: "Caption", label: "OS", minWidth: 320, dir: "ltr" },
    { key: "BuildNumber", label: "Build", minWidth: 120, dir: "ltr" },
    { key: "Manufacturer", label: "Manufacturer", minWidth: 220, dir: "ltr" },
    { key: "OSArchitecture", label: "Architecture", minWidth: 150, dir: "ltr" },
    { key: "Version", label: "Version", minWidth: 140, dir: "ltr" },
    { key: "SerialNumber", label: "Serial Number", minWidth: 220, dir: "ltr" },
    { key: "RegisteredUser", label: "Registered User", minWidth: 170, dir: "ltr" },
  ];
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
      <div
        className="px-4 py-3 border-b border-slate-200 flex items-center justify-between rounded-t-2xl"
        style={{ backgroundColor: BRAND_DARK }}
      >
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
            .filter((option) => option.value !== "")
            .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
          ▾
        </span>
      </div>
    </div>
  );
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

    for (let p = start; p <= end; p += 1) {
      arr.push(p);
    }

    return arr;
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50" dir="rtl">
      <div className="text-[12px] text-slate-700 font-semibold">
        صفحه {page} از {totalPages}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
          onClick={() => onPage(Math.max(1, page - 1))}
          disabled={page === 1}
          title="قبلی"
        >
          ‹
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={cx(
              "w-8 h-8 rounded-full text-[12px] border font-extrabold",
              p === page
                ? "text-white border-transparent"
                : "bg-white border-slate-300 hover:bg-slate-50 text-slate-900"
            )}
            style={p === page ? { backgroundColor: BRAND_TOTAL } : undefined}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="w-8 h-8 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50"
          onClick={() => onPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
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
  const [tab, setTab] = useState<GeneralReportTabKey>("cpu");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<GeneralReportRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const columns = useMemo(() => getColumns(tab), [tab]);
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  const regionOptions = useMemo(() => {
    const uniqueRegions = Array.from(
      new Set(
        rows
          .map((row) => getText(row.ZoneNetworkTitle))
          .filter((item) => item !== "-")
      )
    );

    return [
      { label: "انتخاب کنید...", value: "" },
      ...uniqueRegions.map((item) => ({
        label: item,
        value: item,
      })),
    ];
  }, [rows]);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const result = await generalReportsService.getRows({
        tab,
        page,
        pageSize: PAGE_SIZE,
        region,
        search: q,
      });

      setRows(result.rows);
      setTotalRows(result.total);
    } catch (error) {
      console.log("GENERAL REPORTS ERROR:", error);
      setRows([]);
      setTotalRows(0);
      setErrorMessage("خطا در دریافت اطلاعات گزارش");
    } finally {
      setLoading(false);
    }
  }, [tab, page, region, q]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return (
    <div className="space-y-4" dir="rtl">
      <Card titleRight="گزارش کلی شبکه" titleLeft="گزارشات عمومی">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SelectInput
            label="انتخاب منطقه"
            placeholder="انتخاب کنید..."
            options={regionOptions}
            value={region}
            onChange={(value) => {
              setRegion(value);
              setPage(1);
            }}
          />

          <div className="hidden lg:block" />
          <div className="hidden lg:block" />
        </div>

        <div className="mt-5 border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-2 py-2">
            <div className="flex flex-wrap gap-2 justify-start" dir="rtl">
              {tabs.map((item) => {
                const active = item.key === tab;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setTab(item.key);
                      setPage(1);
                      setQ("");
                      setRegion("");
                    }}
                    className={cx(
                      "px-4 py-2 text-[13px] rounded-xl border font-extrabold transition",
                      active
                        ? "bg-white border-slate-300 text-slate-900"
                        : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-white"
                    )}
                    style={active ? { boxShadow: "0 1px 0 rgba(0,0,0,0.04)" } : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white px-3 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[13px] font-extrabold text-slate-900" dir="rtl">
              {tabs.find((item) => item.key === tab)?.label}
            </div>

            <div className="flex items-center gap-2" dir="rtl">
              <span className="text-[13px] font-bold text-slate-800">جستجو</span>

              <input
                value={q}
                onChange={(event) => {
                  setQ(event.target.value);
                  setPage(1);
                }}
                className="h-10 w-[260px] rounded-xl border border-slate-300 bg-white px-3 text-[13px] text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-slate-300"
              />

              <button
                type="button"
                className="h-10 px-4 rounded-xl text-[13px] font-extrabold text-white shadow-sm hover:opacity-95 transition"
                style={{ backgroundColor: BRAND_PRIMARY }}
                onClick={() => {
                  setQ("");
                  setPage(1);
                }}
              >
                پاک کردن
              </button>
            </div>
          </div>

          <div className="bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-center" dir="rtl">
                <thead>
                  <tr className="text-[13px] text-slate-900 bg-slate-50">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="py-3 px-3 font-extrabold text-center border-b border-slate-200 whitespace-nowrap"
                        style={{ minWidth: column.minWidth ?? 120 }}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="text-[13px] text-slate-900 font-semibold">
                  {loading && (
                    <tr>
                      <td colSpan={columns.length} className="py-10 text-center text-[13px] text-slate-700 font-bold">
                        در حال دریافت اطلاعات...
                      </td>
                    </tr>
                  )}

                  {!loading && errorMessage && (
                    <tr>
                      <td colSpan={columns.length} className="py-10 text-center text-[13px] text-rose-700 font-bold">
                        {errorMessage}
                        <button
                          type="button"
                          onClick={fetchRows}
                          className="mr-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
                        >
                          تلاش مجدد
                        </button>
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    !errorMessage &&
                    rows.map((row, index) => (
                      <tr
                        key={getText(row.Guid) + index}
                        className={cx(
                          "border-t border-slate-200 hover:bg-slate-50 transition",
                          index % 2 ? "bg-white" : "bg-[#fcfcfc]"
                        )}
                      >
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className="py-3 px-3 text-center whitespace-nowrap"
                            dir={column.dir ?? "rtl"}
                          >
                            {getText(row[column.key])}
                          </td>
                        ))}
                      </tr>
                    ))}

                  {!loading && !errorMessage && rows.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="py-10 text-center text-[13px] text-slate-700 font-bold">
                        دیتایی برای نمایش وجود ندارد
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination page={page} totalPages={totalPages} onPage={(targetPage) => setPage(targetPage)} />
          </div>
        </div>
      </Card>
    </div>
  );
}