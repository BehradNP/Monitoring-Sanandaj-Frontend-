"use client";

import { useEffect, useState } from "react";
import type { NetworkLocation } from "@/types/network-monitoring";

export default function LocationsTable({
  locations,
  loading,
  errorMessage,
  onRetry,
}: {
  locations: NetworkLocation[];
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalItems = locations.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLocations = locations.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-700">لیست لوکیشن‌های شبکه</h3>
      </div>

      {loading && locations.length === 0 && (
        <div className="py-10 text-center text-sm font-bold text-slate-500">
          در حال دریافت اطلاعات لوکیشن‌ها...
        </div>
      )}

      {!loading && errorMessage && locations.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-sm font-bold text-rose-700">{errorMessage}</p>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
            >
              تلاش مجدد
            </button>
          )}
        </div>
      )}

      {!loading && !errorMessage && locations.length === 0 && (
        <div className="py-10 text-center text-sm font-bold text-slate-500">
          اطلاعاتی برای نمایش وجود ندارد.
        </div>
      )}

      {locations.length > 0 && (
        <>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-6 py-3 text-right font-bold">عنوان لوکیشن</th>
                <th className="px-6 py-3 text-right font-bold">IP</th>
                <th className="px-6 py-3 text-right font-bold">موقعیت مبدا (GPS)</th>
                <th className="px-6 py-3 text-right font-bold">موقعیت مقصد (GPS)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {paginatedLocations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-800">{loc.title}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{loc.ip}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{loc.sourceGps}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{loc.dstGps}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-medium text-slate-600">
              نمایش {startIndex + 1} تا {Math.min(startIndex + pageSize, totalItems)} از {totalItems} مورد
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={[
                  "rounded-lg border px-3 py-2 text-xs font-bold transition",
                  currentPage === 1
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                قبلی
              </button>

              <span className="rounded-lg bg-[#163647] px-3 py-2 text-xs font-bold text-white">
                صفحه {currentPage} از {totalPages}
              </span>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={[
                  "rounded-lg border px-3 py-2 text-xs font-bold transition",
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
    </div>
  );
}