"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface HierarchyItem {
  id: string;
  title: string;
  code?: string;
  children?: HierarchyItem[];
}

// نمونه داده با زیرمجموعه‌های چند سطحی
const hierarchyData: HierarchyItem[] = [
  {
    id: "may",
    title: "شهرداری",
    code: "MAY",
    children: [
      {
        id: "mks",
        title: "سازمان حمل و نقل بار و مسافر",
        code: "MKS",
        children: [
          { id: "to-mks-may", title: "کارشناس پایانه", code: "TO-MKS-MAY" },
          {
            id: "to-mks-02",
            title: "پشتیبانی",
            code: "TO-MKS-02",
            children: [
              { id: "to-mks-02-1", title: "پشتیبانی داخلی", code: "TO-MKS-02-1" },
              { id: "to-mks-02-2", title: "پشتیبانی خارجی", code: "TO-MKS-02-2" },
            ],
          },
        ],
      },
      {
        id: "san",
        title: "سازمان آتش نشانی",
        code: "SAN",
        children: [
          { id: "to-san-ctrl", title: "اتاق فرمان", code: "TO-SAN-CTRL" },
          { id: "to-san-02", title: "پشتیبانی", code: "TO-SAN-02" },
        ],
      },
    ],
  },
];

export default function HierarchyPage() {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleOpen = (id: string) =>
    setOpenIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const renderItem = (item: HierarchyItem, depth = 0) => {
    const isOpen = openIds.includes(item.id);

    return (
      <div key={item.id} className="w-full">
        <div
          className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm mb-1 cursor-pointer hover:bg-slate-50 transition"
          style={{ paddingRight: 16 + depth * 24 }} // فاصله تو رفتگی بیشتر برای زیرمجموعه‌ها
          onClick={() => item.children && toggleOpen(item.id)}
        >
          <div className="flex items-center gap-2">
            {item.children ? (
              <span className="text-slate-500">
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            ) : (
              <span className="w-4" />
            )}
            <span className="font-semibold text-slate-800">{item.title}</span>
            {item.code && <span className="text-slate-500 text-sm">({item.code})</span>}
          </div>
        </div>

        {item.children && isOpen && (
          <div className="ml-4">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
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
            <div className="space-y-2">
              {hierarchyData.map(item => renderItem(item))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}