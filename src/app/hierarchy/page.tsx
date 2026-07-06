"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import hierarchyService from "@/services/hierarchy-service";
import type { HierarchyItem } from "@/types/hierarchy";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function HierarchyPage() {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await hierarchyService.getHierarchy();

      setHierarchyData(data);
    } catch (error) {
      console.log("HIERARCHY API ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات سلسله مراتب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const renderItem = (item: HierarchyItem, depth = 0) => {
    const hasChildren = item.children.length > 0;
    const isOpen = openIds.includes(item.id);

    return (
      <div key={item.id} className="w-full">
        <div
          className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm mb-1 cursor-pointer hover:bg-slate-50 transition"
          style={{ paddingRight: 16 + depth * 24 }}
          onClick={() => hasChildren && toggleOpen(item.id)}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <span className="text-slate-500">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
            ) : (
              <span className="w-4" />
            )}

            <span className="font-semibold text-slate-800">{item.title}</span>

            {item.code && <span className="text-slate-500 text-sm">({item.code})</span>}
          </div>
        </div>

        {hasChildren && isOpen && <div className="ml-4">{item.children.map((child) => renderItem(child, depth + 1))}</div>}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-100" dir="rtl">
      <Sidebar className="z-40" />

      <main className="flex-1 flex flex-col z-0">
        <Header />

        <div className="p-6 flex-1">
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">سلسله مراتب</h1>

            {loading && (
              <div className="py-10 text-center text-sm font-bold text-slate-500">
                در حال دریافت اطلاعات سلسله مراتب...
              </div>
            )}

            {!loading && errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-5 text-center">
                <p className="text-sm font-bold text-rose-700">{errorMessage}</p>

                <button
                  type="button"
                  onClick={fetchHierarchy}
                  className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
                >
                  تلاش مجدد
                </button>
              </div>
            )}

            {!loading && !errorMessage && hierarchyData.length === 0 && (
              <div className="py-10 text-center text-sm font-bold text-slate-500">
                اطلاعاتی برای نمایش وجود ندارد.
              </div>
            )}

            {!loading && !errorMessage && hierarchyData.length > 0 && (
              <div className="space-y-2">{hierarchyData.map((item) => renderItem(item))}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}