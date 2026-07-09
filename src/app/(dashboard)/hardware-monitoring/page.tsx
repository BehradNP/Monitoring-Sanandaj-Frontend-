"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Loader2, Pencil } from "lucide-react";
import hardwareMonitoringService from "@/services/hardware-monitoring-service";
import type { CategoryOption, HardwareMonitoringRow, HardwareMonitoringTab, PersonalOption } from "@/types/hardware-monitoring";

const PAGE_SIZE = 10;

function TabBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-200 ${active ? "text-[#2f7f86] border-[#2f7f86]" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
      {children}
    </button>
  );
}

function InfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"hardware" | "software">("hardware");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[700px] rounded-2xl shadow-[0_8px_35px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-700">جزئیات سیستم</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition">✕</button>
        </div>

        <div className="px-8 pt-5 pb-3 border-b border-slate-200">
          <div className="flex gap-4">
            <button onClick={() => setTab("hardware")} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "hardware" ? "bg-[#2f7f86] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}>
              اطلاعات سخت‌افزار
            </button>

            <button onClick={() => setTab("software")} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${tab === "software" ? "bg-[#2f7f86] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}>
              اطلاعات نرم‌افزار
            </button>
          </div>
        </div>

        <div className="p-8">
          {tab === "hardware" && (
            <div className="space-y-4">
              {[
                ["CPU", "Intel i7"],
                ["RAM", "16GB DDR4"],
                ["Motherboard", "ASUS B560M"],
                ["Storage", "512GB NVMe SSD"],
                ["GPU", "NVIDIA GeForce RTX 3060"],
              ].map(([label, value], index, arr) => (
                <div key={label} className={`flex justify-between items-center pb-3 ${index !== arr.length - 1 ? "border-b border-slate-200" : ""}`}>
                  <span className="text-slate-600 font-medium">{label}:</span>
                  <span className="text-slate-900 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "software" && (
            <div className="space-y-4">
              {[
                ["OS", "Windows 11 Pro (23H2)"],
                ["Office", "Microsoft Office 2021 Professional"],
                ["Browser", "Google Chrome (v120)"],
                ["IDE", "Visual Studio Code (v1.85)"],
              ].map(([label, value], index, arr) => (
                <div key={label} className={`flex justify-between items-center pb-3 ${index !== arr.length - 1 ? "border-b border-slate-200" : ""}`}>
                  <span className="text-slate-600 font-medium">{label}:</span>
                  <span className="text-slate-900 font-semibold">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-5 bg-slate-50 text-end border-t border-slate-200">
          <button className="px-7 py-2.5 border rounded-lg bg-white hover:bg-slate-100 transition font-medium" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}

type SelectOption = {
  id: number;
  label: string;
  subLabel?: string;
  searchText: string;
  level?: number;
};

function SearchableSelect({ label, placeholder, value, options, loading, onChange }: { label: string; placeholder: string; value: number | null; options: SelectOption[]; loading?: boolean; onChange: (value: number) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((item) => item.id === value) ?? null;

  const filteredOptions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return options;
    return options.filter((item) => item.searchText.includes(searchValue) || item.label.toLowerCase().includes(searchValue) || item.subLabel?.toLowerCase().includes(searchValue));
  }, [options, search]);

  return (
    <div className="relative">
      <label className="block mb-2 text-sm font-semibold text-slate-700">{label}</label>

      <button type="button" onClick={() => setOpen((prev) => !prev)} className="w-full h-11 px-4 rounded-lg border border-slate-300 bg-white text-right text-sm text-slate-700 flex items-center justify-between hover:bg-slate-50 transition">
        <span className={selected ? "text-slate-800" : "text-slate-400"}>{selected ? selected.label : placeholder}</span>
        <span className="text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[74px] z-[70] rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو..." className="w-full h-10 px-3 rounded-md border border-slate-300 text-sm outline-none focus:border-[#2f7f86]" autoFocus />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span>در حال دریافت اطلاعات...</span>
              </div>
            )}

            {!loading && filteredOptions.length === 0 && <div className="px-3 py-5 text-center text-sm text-slate-500">موردی یافت نشد</div>}

            {!loading && filteredOptions.map((item) => (
              <button key={item.id} type="button" onClick={() => { onChange(item.id); setOpen(false); setSearch(""); }} className={`w-full px-3 py-2.5 text-right text-sm hover:bg-slate-50 transition ${value === item.id ? "bg-[#2f7f86]/10 text-[#2f7f86]" : "text-slate-700"}`} style={{ paddingRight: `${12 + (item.level ?? 0) * 16}px` }}>
                <span className="block font-semibold">{item.label}</span>
                {item.subLabel && <span className="block mt-1 text-[11px] text-slate-500">{item.subLabel}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EditModal({ open, row, personals, categories, lookupsLoading, saving, onClose, onSave }: { open: boolean; row: HardwareMonitoringRow | null; personals: PersonalOption[]; categories: CategoryOption[]; lookupsLoading: boolean; saving: boolean; onClose: () => void; onSave: (personalId: number, categoryId: number) => Promise<void> }) {
  const [personalId, setPersonalId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open || !row) return;

    const matchedPersonal = personals.find((item) => row.nationalId !== "-" && item.nationalId === row.nationalId);
    const matchedCategory = categories.find((item) => row.pcFa !== "-" && (item.title === row.pcFa || item.subLabel === row.pcFa || row.pcFa.includes(item.title)));

    setPersonalId(matchedPersonal?.id ?? null);
    setCategoryId(matchedCategory?.id ?? null);
    setErrorMessage("");
  }, [open, row, personals, categories]);

  if (!open || !row) return null;

  async function handleSubmit() {
    if (!personalId) {
      setErrorMessage("لطفاً پرسنل را انتخاب کنید.");
      return;
    }

    if (!categoryId) {
      setErrorMessage("لطفاً دسته‌بندی را انتخاب کنید.");
      return;
    }

    setErrorMessage("");
    await onSave(personalId, categoryId);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[760px] rounded-2xl shadow-[0_8px_35px_rgba(0,0,0,0.15)] overflow-visible">
        <div className="flex justify-between items-center px-8 py-6 bg-slate-50 border-b border-slate-200 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-700">ویرایش رکورد</h2>
            <p className="mt-1 text-xs text-slate-500">IP: {row.ip} | MAC: {row.mac}</p>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition">✕</button>
        </div>

        <div className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <SearchableSelect label="پرسنل" placeholder="انتخاب کنید..." value={personalId} options={personals} loading={lookupsLoading} onChange={setPersonalId} />
            <SearchableSelect label="دسته‌بندی" placeholder="انتخاب آیتم مورد نظر..." value={categoryId} options={categories} loading={lookupsLoading} onChange={setCategoryId} />
          </div>

          {errorMessage && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorMessage}</div>}
        </div>

        <div className="px-8 py-5 bg-slate-50 text-end border-t border-slate-200 rounded-b-2xl flex items-center justify-end gap-3">
          <button className="px-7 py-2.5 border rounded-lg bg-white hover:bg-slate-100 transition font-medium" onClick={onClose} disabled={saving}>
            بستن
          </button>

          <button className="px-7 py-2.5 rounded-lg bg-[#2f7f86] text-white hover:bg-[#276b71] transition font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2" onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            ثبت تغییرات
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HardwareMonitoringPage() {
  const [tab, setTab] = useState<HardwareMonitoringTab>("network");
  const [networkData, setNetworkData] = useState<HardwareMonitoringRow[]>([]);
  const [devicesData, setDevicesData] = useState<HardwareMonitoringRow[]>([]);
  const [personals, setPersonals] = useState<PersonalOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState<HardwareMonitoringRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const data = tab === "network" ? networkData : devicesData;
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = data.slice(startIndex, endIndex);
  const fromRow = data.length === 0 ? 0 : startIndex + 1;
  const toRow = Math.min(endIndex, data.length);

  async function loadRows(selectedTab: HardwareMonitoringTab) {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = selectedTab === "network" ? await hardwareMonitoringService.getNetworkRows() : await hardwareMonitoringService.getDevicesRows();

      if (selectedTab === "network") {
        setNetworkData(response.rows);
      } else {
        setDevicesData(response.rows);
      }

      if (!response.isSuccess && response.message) {
        setErrorMessage(response.message);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.Message ?? error?.message ?? "خطا در دریافت اطلاعات";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLookups() {
    try {
      setLookupsLoading(true);
      const [personalResponse, categoryResponse] = await Promise.all([hardwareMonitoringService.getPersonalOptions(), hardwareMonitoringService.getCategoryOptions()]);
      setPersonals(personalResponse.rows);
      setCategories(categoryResponse.rows);
    } catch {
      setPersonals([]);
      setCategories([]);
    } finally {
      setLookupsLoading(false);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
    loadRows(tab);
  }, [tab]);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  async function handleSaveEdit(personalId: number, categoryId: number) {
    if (!editRow) return;

    try {
      setSaving(true);

      await hardwareMonitoringService.editPersonalIPNetwork({
        personalId,
        categoryId,
        id: editRow.id,
        guid: editRow.guid,
      });

      setEditRow(null);
      await loadRows(tab);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.Message ?? error?.message ?? "خطا در ثبت تغییرات";
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  function goToPage(page: number) {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
  }

  return (
    <div className="space-y-6 pt-4 px-4">
      <div className="border-b border-slate-200">
        <div className="flex gap-6 -mb-px">
          <TabBtn active={tab === "network"} onClick={() => setTab("network")}>
            شبکه
          </TabBtn>

          <TabBtn active={tab === "devices"} onClick={() => setTab("devices")}>
            تجهیزات
          </TabBtn>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="min-w-full text-xs text-center">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-4">IP</th>
              <th className="px-3 py-4">MAC</th>
              <th className="px-3 py-4">نام</th>
              <th className="px-3 py-4">کدملی</th>
              <th className="px-3 py-4">یوزرنیم</th>
              <th className="px-3 py-4">عنوان فارسی</th>
              <th className="px-3 py-4">عنوان انگلیسی</th>
              <th className="px-3 py-4">شماره</th>
              <th className="px-3 py-4 w-24 text-center">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-3 py-10">
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    <span>در حال دریافت اطلاعات...</span>
                  </div>
                </td>
              </tr>
            )}

            {!loading && errorMessage && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-red-500">
                  {errorMessage}
                </td>
              </tr>
            )}

            {!loading && !errorMessage && data.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-slate-500">
                  اطلاعاتی برای نمایش وجود ندارد
                </td>
              </tr>
            )}

            {!loading && !errorMessage && paginatedData.map((row) => (
              <tr key={row.guid || row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3">{row.ip}</td>
                <td className="px-3 py-3">{row.mac}</td>
                <td className="px-3 py-3">{row.name}</td>
                <td className="px-3 py-3">{row.nationalId}</td>
                <td className="px-3 py-3">{row.username}</td>
                <td className="px-3 py-3">{row.pcFa}</td>
                <td className="px-3 py-3">{row.pcEn}</td>
                <td className="px-3 py-3">{row.number}</td>

                <td className="px-3 py-3 w-24">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setModalOpen(true)} className="text-[#2f7f86] hover:text-[#1f5f64]" title="مشاهده">
                      <Eye size={18} />
                    </button>

                    <button onClick={() => setEditRow(row)} className="text-[#2f7f86] hover:text-[#1f5f64]" title="ویرایش">
                      <Pencil size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && !errorMessage && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              نمایش {fromRow} تا {toRow} از {data.length} ردیف
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={17} />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

                return (
                  <button key={page} onClick={() => goToPage(page)} className={`w-9 h-9 rounded-lg border text-xs font-semibold transition ${currentPage === page ? "bg-[#2f7f86] border-[#2f7f86] text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {page}
                  </button>
                );
              })}

              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      <InfoModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <EditModal open={Boolean(editRow)} row={editRow} personals={personals} categories={categories} lookupsLoading={lookupsLoading} saving={saving} onClose={() => setEditRow(null)} onSave={handleSaveEdit} />
    </div>
  );
}