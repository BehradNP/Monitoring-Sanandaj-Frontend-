"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiSearch, FiDownload, FiX } from "react-icons/fi";
import qrReportService from "@/services/qr-report-service";
import { exportQrRowsToPdf } from "@/services/qr-stimulsoft-service";
import type { QrCategoryNode, QrReportRow, QrReportSearchParams, QrZoneOption } from "@/types/qr-report";

const BRAND_DARK = "#163647";
const BRAND_PRIMARY = "#2f7f86";
const BRAND_TOTAL = "#429195";

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
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between rounded-t-2xl" style={{ backgroundColor: BRAND_DARK }}>
        <div className="text-white font-bold text-[13px]">{titleRight}</div>
        {titleLeft ? <div className="text-white/70 text-[12px]">{titleLeft}</div> : null}
      </div>

      <div className="p-4 overflow-visible">{children}</div>
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
  options: QrZoneOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-full">
      <label className="block text-[12px] font-bold text-slate-700 mb-2">{label}</label>

      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none px-3 py-3 rounded-xl border border-slate-300 bg-white text-[13px] text-slate-800 font-medium outline-none focus:ring-2 focus:ring-slate-300" dir="rtl">
          <option value="" className="text-slate-500">
            {placeholder}
          </option>

          {options.map((option) => (
            <option key={option.id} value={String(option.id)}>
              {option.title}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">▾</span>
      </div>
    </div>
  );
}

function TextInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-full">
      <label className="block text-[12px] font-bold text-slate-700 mb-2">{label}</label>

      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full px-3 py-3 rounded-xl border border-slate-300 bg-white text-[13px] text-slate-800 placeholder:text-slate-500 font-medium outline-none focus:ring-2 focus:ring-slate-300" dir="rtl" />
    </div>
  );
}

function HierarchySelect({
  label,
  placeholder,
  data,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  data: QrCategoryNode[];
  value: QrCategoryNode | null;
  onChange: (node: QrCategoryNode | null) => void;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const recalc = () => {
    const element = btnRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    setPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;

    recalc();

    const onScroll = () => recalc();
    const onResize = () => recalc();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const flatMatches = useMemo(() => {
    if (!query.trim()) return null;

    const q = query.trim().toLowerCase();
    const results: QrCategoryNode[] = [];

    const walk = (nodes: QrCategoryNode[]) => {
      nodes.forEach((node) => {
        const text = `${node.title} ${node.code ?? ""}`.toLowerCase();

        if (text.includes(q)) results.push(node);
        if (node.children?.length) walk(node.children);
      });
    };

    walk(data);

    return results;
  }, [query, data]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: QrCategoryNode, depth = 0) => {
    const hasChildren = !!node.children?.length;
    const isExpanded = !!expanded[node.id];

    if (query.trim()) return null;

    return (
      <div key={node.id}>
        <div
          className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg hover:bg-slate-50 cursor-pointer"
          onClick={() => {
            if (hasChildren) {
              toggleExpand(node.id);
              return;
            }

            onChange(node);
            close();
          }}
          dir="rtl"
          style={{ paddingRight: 8 + depth * 14 }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <span
                className="inline-flex w-6 h-6 items-center justify-center rounded-md hover:bg-slate-100"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpand(node.id);
                }}
                title="باز/بسته"
              >
                <span className={["transition-transform", isExpanded ? "rotate-180" : ""].join(" ")}>▾</span>
              </span>
            ) : (
              <span className="inline-block w-6" />
            )}

            <span className="text-[13px] text-slate-800 font-semibold">{node.title}</span>

            {node.code ? <span className="text-[12px] text-slate-500">({node.code})</span> : null}
          </div>
        </div>

        {hasChildren && isExpanded ? <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div> : null}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-[12px] font-bold text-slate-700">{label}</label>

        {value ? (
          <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700">
            <FiX size={13} />
            پاک کردن
          </button>
        ) : null}
      </div>

      <button ref={btnRef} type="button" onClick={() => setOpen((prev) => !prev)} className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer" dir="rtl">
        <span className="text-[13px] text-slate-700 truncate">
          {value ? (
            <>
              {value.title} {value.code ? <span className="text-slate-500">({value.code})</span> : null}
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>

        <FiChevronDown className="text-slate-500 shrink-0" />
      </button>

      {mounted && open && pos
        ? createPortal(
            <div className="fixed inset-0 z-[9999]" onMouseDown={close}>
              <div className="fixed bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden" style={{ top: pos.top, left: pos.left, width: pos.width }} onMouseDown={(event) => event.stopPropagation()}>
                <div className="p-3 border-b border-slate-200">
                  <div className="relative">
                    <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو..." className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-slate-200" dir="rtl" autoFocus />
                  </div>
                </div>

                <div className="max-h-[320px] overflow-auto p-2">
                  {query.trim() && flatMatches ? (
                    flatMatches.length ? (
                      <div className="space-y-1">
                        {flatMatches.map((node) => (
                          <button
                            key={node.id}
                            type="button"
                            className="w-full text-right px-3 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                            dir="rtl"
                            onClick={() => {
                              onChange(node);
                              close();
                            }}
                          >
                            <div className="text-[13px] font-semibold text-slate-800">
                              {node.title}
                              {node.code ? <span className="text-slate-500"> ({node.code})</span> : null}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-[13px] text-slate-500 py-10">چیزی پیدا نشد</div>
                    )
                  ) : (
                    <div>{data.map((node) => renderNode(node))}</div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default function QrReportsPage() {
  const [region, setRegion] = useState("");
  const [hier, setHier] = useState<QrCategoryNode | null>(null);
  const [number, setNumber] = useState("");

  const [regions, setRegions] = useState<QrZoneOption[]>([]);
  const [hierarchy, setHierarchy] = useState<QrCategoryNode[]>([]);
  const [rows, setRows] = useState<QrReportRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedParams = useMemo<QrReportSearchParams>(() => {
    const cleanedNumber = number.trim().replace(/^QR[-_\s]*/i, "");

    return {
      zoneId: region ? Number(region) : "",
      categoryId: hier?.id ? Number(hier.id) : "",
      tableId: cleanedNumber,
      startIp: "",
      endIp: "",
    };
  }, [region, hier, number]);

  const loadOptions = useCallback(async () => {
    try {
      setLoadingInit(true);
      setErrorMessage("");

      const [zoneOptions, categoryOptions] = await Promise.all([qrReportService.getZones(), qrReportService.getCategories()]);

      setRegions(zoneOptions);
      setHierarchy(categoryOptions);
    } catch (error) {
      console.log("QR OPTIONS ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات اولیه صفحه");
    } finally {
      setLoadingInit(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const handleSearch = async () => {
    try {
      setLoadingSearch(true);
      setErrorMessage("");

      const result = await qrReportService.search(selectedParams);

      setRows(result.rows);
      setTotalRows(result.total);
    } catch (error) {
      console.log("QR SEARCH ERROR:", error);
      setRows([]);
      setTotalRows(0);
      setErrorMessage(error instanceof Error ? error.message : "خطا در جستجوی اطلاعات کیو آر کد");
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloading(true);
      setErrorMessage("");

      let rowsForReport = rows;

      if (!rowsForReport.length) {
        const result = await qrReportService.search(selectedParams);
        rowsForReport = result.rows;
        setRows(result.rows);
        setTotalRows(result.total);
      }

      await exportQrRowsToPdf(rowsForReport, "qr-report.pdf");
    } catch (error) {
      console.log("QR STIMULSOFT DOWNLOAD ERROR:", error);
      setErrorMessage(error instanceof Error ? error.message : "خطا در ساخت گزارش کیو آر کد");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadRow = async (row: QrReportRow) => {
    try {
      setDownloading(true);
      setErrorMessage("");

      await exportQrRowsToPdf([row], `qr-${row.number}.pdf`);
    } catch (error) {
      console.log("QR STIMULSOFT ROW DOWNLOAD ERROR:", error);
      setErrorMessage(error instanceof Error ? error.message : "خطا در ساخت کیو آر کد");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card titleRight="چاپ کیو آر کد" titleLeft="گزارشات تکمیلی">
        {errorMessage ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorMessage}</div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SelectInput label="انتخاب منطقه" placeholder={loadingInit ? "در حال دریافت..." : "انتخاب کنید..."} options={regions} value={region} onChange={setRegion} />

          <HierarchySelect label="دسته (سلسله مراتب)" placeholder={loadingInit ? "در حال دریافت..." : "انتخاب آیتم مورد نظر..."} data={hierarchy} value={hier} onChange={setHier} />

          <TextInput label="شماره" placeholder="مثلاً QR-1521" value={number} onChange={setNumber} />
        </div>

        <div className="mt-6 pt-2 flex flex-wrap gap-3 justify-start">
          <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ backgroundColor: BRAND_TOTAL }} onClick={handleSearch} disabled={loadingInit || loadingSearch || downloading}>
            <FiSearch />
            {loadingSearch ? "در حال جستجو..." : "جستجو"}
          </button>

          <button type="button" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold border-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ borderColor: BRAND_PRIMARY, color: BRAND_PRIMARY, backgroundColor: "white" }} onClick={handleDownloadAll} disabled={loadingInit || loadingSearch || downloading}>
            <FiDownload />
            {downloading ? "در حال ساخت گزارش..." : "دانلود گزارشات"}
          </button>
        </div>
      </Card>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="font-bold text-[13px] text-slate-900">نتایج</div>
          <div className="text-[12px] text-slate-600" dir="rtl">
            تعداد: {totalRows || rows.length}
          </div>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="text-[13px] text-slate-700 bg-slate-50">
                  <th className="py-3 px-3 font-bold text-center">IP</th>
                  <th className="py-3 px-3 font-bold text-center">MAC</th>
                  <th className="py-3 px-3 font-bold text-center">نام و نام خانوادگی</th>
                  <th className="py-3 px-3 font-bold text-center">کد ملی</th>
                  <th className="py-3 px-3 font-bold text-center">UserName</th>
                  <th className="py-3 px-3 font-bold text-center">عنوان فارسی کامپیوتر</th>
                  <th className="py-3 px-3 font-bold text-center">Computer Name</th>
                  <th className="py-3 px-3 font-bold text-center">شماره</th>
                  <th className="py-3 px-3 font-bold text-center">عملیات</th>
                </tr>
              </thead>

              <tbody className="text-[13px] text-slate-900">
                {loadingSearch ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm font-bold text-slate-500">
                      در حال دریافت اطلاعات...
                    </td>
                  </tr>
                ) : null}

                {!loadingSearch && rows.length
                  ? rows.map((row, index) => (
                      <tr key={`${row.guid || row.id || row.number}-${index}`} className="border-t border-slate-200 hover:bg-slate-50 transition">
                        <td className="py-3 px-3 text-center">{row.ip}</td>
                        <td className="py-3 px-3 text-center">{row.mac}</td>
                        <td className="py-3 px-3 text-center font-semibold">{row.fullName}</td>
                        <td className="py-3 px-3 text-center">{row.nationalId}</td>
                        <td className="py-3 px-3 text-center">{row.userName}</td>
                        <td className="py-3 px-3 text-center">{row.faTitle}</td>
                        <td className="py-3 px-3 text-center font-mono">{row.computerName}</td>
                        <td className="py-3 px-3 text-center">{row.number}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm" title="مشاهده اطلاعات سیستم" onClick={() => console.log("show system info", row)}>
                              i
                            </button>

                            <button type="button" className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed" style={{ backgroundColor: BRAND_DARK }} onClick={() => handleDownloadRow(row)} disabled={downloading}>
                              دانلود
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}

                {!loadingSearch && !rows.length ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm font-bold text-slate-500">
                      دیتایی برای نمایش وجود ندارد
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}