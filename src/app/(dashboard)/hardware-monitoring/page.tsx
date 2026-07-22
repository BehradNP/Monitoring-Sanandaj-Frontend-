"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Eye,
  HardDrive,
  Loader2,
  MonitorCog,
  Pencil,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import hardwareMonitoringService from "@/services/hardware-monitoring-service";
import type {
  CategoryOption,
  HardwareInfoField,
  HardwareMonitoringRow,
  HardwareMonitoringTab,
  HardwareSystemDetails,
  PersonalOption,
  SoftwareInfoItem,
} from "@/types/hardware-monitoring";

const PAGE_SIZE = 10;

type PopupState = {
  open: boolean;
  title: string;
  message: string;
  type: "error" | "success";
};

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .trim()
    .toLowerCase();
}

function TabBtn({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-all duration-200",
        active
          ? "bg-[#2f7f86] text-white shadow-lg shadow-[#2f7f86]/20"
          : "bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-800",
      ].join(" ")}
    >
      {icon}
      {children}
    </button>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-800">
            {toPersianNumber(value)}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PopupMessage({
  popup,
  onClose,
}: {
  popup: PopupState;
  onClose: () => void;
}) {
  if (!popup.open) return null;

  const isError = popup.type === "error";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className={`text-lg font-extrabold ${
                isError ? "text-rose-700" : "text-emerald-700"
              }`}
            >
              {popup.title}
            </h3>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
              {popup.message}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-3 text-slate-500 transition hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-7 text-left">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-2xl px-6 py-2.5 text-sm font-extrabold text-white transition ${
              isError
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRows({
  fields,
  emptyText,
}: {
  fields: HardwareInfoField[];
  emptyText: string;
}) {
  if (!fields.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-extrabold text-slate-400">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {fields.map((field, index) => (
        <div
          key={`${field.label}-${index}`}
          className={`grid grid-cols-1 gap-2 px-5 py-4 text-sm md:grid-cols-3 ${
            index !== fields.length - 1 ? "border-b border-slate-100" : ""
          }`}
        >
          <div className="font-extrabold text-slate-500">{field.label}</div>
          <div className="font-bold text-slate-900 md:col-span-2">
            {field.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSection({
  title,
  icon,
  fields,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  fields: HardwareInfoField[];
  emptyText: string;
}) {
  return (
    <section className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="flex items-center gap-2 text-slate-800">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
          {icon}
        </span>
        <h3 className="text-sm font-extrabold">{title}</h3>
      </div>

      <DetailRows fields={fields} emptyText={emptyText} />
    </section>
  );
}

function SoftwareTable({ items }: { items: SoftwareInfoItem[] }) {
  const [softwareSearch, setSoftwareSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = normalizeText(softwareSearch);

    if (!query) return items;

    return items.filter((item) =>
      normalizeText(`${item.title} ${item.ip} ${item.mac} ${item.zone}`).includes(
        query
      )
    );
  }, [items, softwareSearch]);

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm font-extrabold text-slate-400">
        اطلاعات نرم‌افزاری برای این سیستم ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={18}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={softwareSearch}
          onChange={(event) => setSoftwareSearch(event.target.value)}
          placeholder="جستجو در نرم‌افزارها..."
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
        />

        {softwareSearch ? (
          <button
            type="button"
            onClick={() => setSoftwareSearch("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">نام نرم‌افزار</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">MAC</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item, index) => (
              <tr
                key={item.guid || `${item.title}-${index}`}
                className="border-t border-slate-100 transition hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-bold text-slate-400">
                  {toPersianNumber(index + 1)}
                </td>
                <td className="px-4 py-3 font-bold text-slate-800">
                  {item.title}
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">{item.ip}</td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  {item.mac}
                </td>
              </tr>
            ))}

            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm font-bold text-slate-400"
                >
                  نرم‌افزاری با این عبارت پیدا نشد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoModal({
  open,
  row,
  details,
  loading,
  errorMessage,
  onClose,
}: {
  open: boolean;
  row: HardwareMonitoringRow | null;
  details: HardwareSystemDetails | null;
  loading: boolean;
  errorMessage: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"hardware" | "software">("hardware");

  useEffect(() => {
    if (open) setTab("hardware");
  }, [open, row?.id]);

  if (!open || !row) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-l from-[#163647] to-[#2f7f86] px-8 py-6 text-white">
          <div>
            <h2 className="text-2xl font-extrabold">جزئیات سیستم</h2>
            <p className="mt-2 text-xs font-bold text-white/75">
              IP: {row.ip} | MAC: {row.mac} | شماره:{" "}
              {toPersianNumber(row.number)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-200 bg-white px-8 py-5">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTab("hardware")}
              className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition ${
                tab === "hardware"
                  ? "bg-[#2f7f86] text-white shadow-lg shadow-[#2f7f86]/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              اطلاعات سخت‌افزار
            </button>

            <button
              type="button"
              onClick={() => setTab("software")}
              className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition ${
                tab === "software"
                  ? "bg-[#2f7f86] text-white shadow-lg shadow-[#2f7f86]/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              اطلاعات نرم‌افزار
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-24 text-sm font-extrabold text-slate-500">
              <Loader2 size={22} className="animate-spin" />
              در حال دریافت جزئیات سیستم...
            </div>
          ) : null}

          {!loading && errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-10 text-center text-sm font-extrabold text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {!loading && !errorMessage && tab === "hardware" ? (
            <div className="grid grid-cols-1 gap-5">
              <DetailSection
                title="CPU"
                icon={<Cpu size={18} />}
                fields={details?.cpu ?? []}
                emptyText="اطلاعات CPU برای این سیستم ثبت نشده است."
              />
              <DetailSection
                title="RAM"
                icon={<Boxes size={18} />}
                fields={details?.ram ?? []}
                emptyText="اطلاعات RAM برای این سیستم ثبت نشده است."
              />
              <DetailSection
                title="Device / Motherboard"
                icon={<MonitorCog size={18} />}
                fields={details?.motherboard ?? []}
                emptyText="اطلاعات Device/Motherboard برای این سیستم ثبت نشده است."
              />
              <DetailSection
                title="HDD / Storage"
                icon={<HardDrive size={18} />}
                fields={details?.hdd ?? []}
                emptyText="اطلاعات هارد برای این سیستم ثبت نشده است."
              />
              <DetailSection
                title="VGA / GPU"
                icon={<MonitorCog size={18} />}
                fields={details?.vga ?? []}
                emptyText="اطلاعات کارت گرافیک برای این سیستم ثبت نشده است."
              />
            </div>
          ) : null}

          {!loading && !errorMessage && tab === "software" ? (
            <SoftwareTable items={details?.software ?? []} />
          ) : null}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-5 text-end">
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-7 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100"
            onClick={onClose}
          >
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

function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  loading,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: number | null;
  options: SelectOption[];
  loading?: boolean;
  onChange: (value: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((item) => item.id === value) ?? null;

  const filteredOptions = useMemo(() => {
    const searchValue = normalizeText(search);

    if (!searchValue) return options;

    return options.filter((item) =>
      normalizeText(`${item.searchText} ${item.label} ${item.subLabel}`).includes(
        searchValue
      )
    );
  }, [options, search]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-extrabold text-slate-700">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-right text-sm font-bold text-slate-700 transition hover:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="text-slate-500">▾</span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[80px] z-[70] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو..."
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-[#2f7f86]"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-5 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span>در حال دریافت اطلاعات...</span>
              </div>
            ) : null}

            {!loading && filteredOptions.length === 0 ? (
              <div className="px-3 py-5 text-center text-sm text-slate-500">
                موردی یافت نشد
              </div>
            ) : null}

            {!loading
              ? filteredOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-3 py-3 text-right text-sm transition hover:bg-slate-50 ${
                      value === item.id
                        ? "bg-[#2f7f86]/10 text-[#2f7f86]"
                        : "text-slate-700"
                    }`}
                    style={{ paddingRight: `${12 + (item.level ?? 0) * 16}px` }}
                  >
                    <span className="block font-extrabold">{item.label}</span>
                    {item.subLabel ? (
                      <span className="mt-1 block text-[11px] text-slate-500">
                        {item.subLabel}
                      </span>
                    ) : null}
                  </button>
                ))
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EditModal({
  open,
  row,
  personals,
  categories,
  lookupsLoading,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  row: HardwareMonitoringRow | null;
  personals: PersonalOption[];
  categories: CategoryOption[];
  lookupsLoading: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (personalId: number, categoryId: number) => Promise<void>;
}) {
  const [personalId, setPersonalId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open || !row) return;

    const matchedPersonal = personals.find(
      (item) => row.nationalId !== "-" && item.nationalId === row.nationalId
    );
    const matchedCategory = categories.find(
      (item) =>
        row.pcFa !== "-" &&
        (item.title === row.pcFa ||
          item.subLabel === row.pcFa ||
          row.pcFa.includes(item.title))
    );

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="w-full max-w-[760px] overflow-visible rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 rounded-t-3xl border-b border-slate-200 bg-gradient-to-l from-[#163647] to-[#2f7f86] px-8 py-6 text-white">
          <div>
            <h2 className="text-xl font-extrabold">ویرایش رکورد</h2>
            <p className="mt-2 text-xs font-bold text-white/75">
              IP: {row.ip} | MAC: {row.mac}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-white/10 p-3 transition hover:bg-white/20"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <SearchableSelect
              label="پرسنل"
              placeholder="انتخاب کنید..."
              value={personalId}
              options={personals}
              loading={lookupsLoading}
              onChange={setPersonalId}
            />

            <SearchableSelect
              label="دسته‌بندی"
              placeholder="انتخاب آیتم مورد نظر..."
              value={categoryId}
              options={categories}
              loading={lookupsLoading}
              onChange={setCategoryId}
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3 rounded-b-3xl border-t border-slate-200 bg-slate-50 px-8 py-5">
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-7 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            onClick={onClose}
            disabled={saving}
          >
            بستن
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-[#2f7f86] px-7 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#276b71] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
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
  const [infoRow, setInfoRow] = useState<HardwareMonitoringRow | null>(null);
  const [infoDetails, setInfoDetails] = useState<HardwareSystemDetails | null>(
    null
  );
  const [editRow, setEditRow] = useState<HardwareMonitoringRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [detailsErrorMessage, setDetailsErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [popup, setPopup] = useState<PopupState>({
    open: false,
    title: "",
    message: "",
    type: "error",
  });

  const data = tab === "network" ? networkData : devicesData;

  const filteredData = useMemo(() => {
    const query = normalizeText(searchQuery);

    if (!query) return data;

    return data.filter((row) =>
      normalizeText(
        `${row.ip} ${row.mac} ${row.name} ${row.nationalId} ${row.username} ${row.pcFa} ${row.pcEn} ${row.number}`
      ).includes(query)
    );
  }, [data, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const fromRow = filteredData.length === 0 ? 0 : startIndex + 1;
  const toRow = Math.min(endIndex, filteredData.length);

  async function loadRows(selectedTab: HardwareMonitoringTab) {
    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        selectedTab === "network"
          ? await hardwareMonitoringService.getNetworkRows()
          : await hardwareMonitoringService.getDevicesRows();

      if (selectedTab === "network") {
        setNetworkData(response.rows);
      } else {
        setDevicesData(response.rows);
      }

      if (!response.isSuccess && response.message) {
        setErrorMessage(response.message);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.Message ??
        error?.message ??
        "خطا در دریافت اطلاعات";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLookups() {
    try {
      setLookupsLoading(true);

      const [personalResponse, categoryResponse] = await Promise.all([
        hardwareMonitoringService.getPersonalOptions(),
        hardwareMonitoringService.getCategoryOptions(),
      ]);

      setPersonals(personalResponse.rows);
      setCategories(categoryResponse.rows);
    } catch {
      setPersonals([]);
      setCategories([]);
    } finally {
      setLookupsLoading(false);
    }
  }

  async function handleOpenInfo(row: HardwareMonitoringRow) {
    try {
      setInfoRow(row);
      setInfoDetails(null);
      setDetailsErrorMessage("");
      setDetailsLoading(true);

      const details = await hardwareMonitoringService.getSystemDetails(row);

      setInfoDetails(details);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.Message ??
        error?.message ??
        "خطا در دریافت جزئیات سیستم";

      setDetailsErrorMessage(message);
    } finally {
      setDetailsLoading(false);
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
    setCurrentPage(1);
  }, [searchQuery]);

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

      setPopup({
        open: true,
        title: "عملیات موفق",
        message: "تغییرات با موفقیت ثبت شد.",
        type: "success",
      });

      await loadRows(tab);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.response?.data?.Message ??
        error?.message ??
        "خطا در ثبت تغییرات";

      setPopup({
        open: true,
        title: "خطا در ثبت اطلاعات",
        message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function goToPage(page: number) {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
  }

  return (
    <div className="space-y-6 px-4 pt-4" dir="rtl">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-l from-[#163647] to-[#2f7f86] p-6 text-white shadow-lg shadow-slate-200">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">مانیتورینگ سخت‌افزار</h1>
            <p className="mt-2 text-sm font-medium text-white/70">
              مشاهده، جستجو و ویرایش اطلاعات سیستم‌ها و تجهیزات شبکه
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadRows(tab)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#163647] shadow-lg transition hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            بروزرسانی
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="تعداد کل این بخش"
          value={data.length}
          icon={<MonitorCog size={22} />}
        />
        <StatCard
          title="نتیجه جستجو"
          value={filteredData.length}
          icon={<Search size={22} />}
        />
        <StatCard
          title="کاربران قابل انتخاب"
          value={personals.length}
          icon={<UserRound size={22} />}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <TabBtn
            active={tab === "network"}
            icon={<MonitorCog size={18} />}
            onClick={() => setTab("network")}
          >
            شبکه
          </TabBtn>

          <TabBtn
            active={tab === "devices"}
            icon={<HardDrive size={18} />}
            onClick={() => setTab("devices")}
          >
            تجهیزات
          </TabBtn>
        </div>

        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجو بر اساس IP، MAC، نام، کدملی، عنوان..."
            className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-11 pl-11 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-center text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="rounded-r-2xl px-4 py-4 font-extrabold">IP</th>
                <th className="px-4 py-4 font-extrabold">MAC</th>
                <th className="px-4 py-4 font-extrabold">نام</th>
                <th className="px-4 py-4 font-extrabold">کدملی</th>
                <th className="px-4 py-4 font-extrabold">یوزرنیم</th>
                <th className="px-4 py-4 font-extrabold">عنوان فارسی</th>
                <th className="px-4 py-4 font-extrabold">عنوان انگلیسی</th>
                <th className="px-4 py-4 font-extrabold">شماره</th>
                <th className="rounded-l-2xl px-4 py-4 font-extrabold">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-16">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="font-extrabold">
                        در حال دریافت اطلاعات...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading && errorMessage ? (
                <tr>
                  <td colSpan={9} className="px-3 py-10">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm font-extrabold text-rose-700">
                      {errorMessage}
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading && !errorMessage && filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-16">
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm font-extrabold text-slate-400">
                      {searchQuery
                        ? "نتیجه‌ای برای جستجو یافت نشد."
                        : "اطلاعاتی برای نمایش وجود ندارد."}
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading && !errorMessage
                ? paginatedData.map((row) => (
                    <tr
                      key={row.guid || row.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#2f7f86]/5"
                    >
                      <td className="px-4 py-4 font-mono font-bold text-slate-700">
                        {row.ip}
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-700">
                        {row.mac}
                      </td>
                      <td className="px-4 py-4 font-extrabold text-slate-800">
                        {row.name}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {row.nationalId}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {row.username}
                      </td>
                      <td className="min-w-[220px] px-4 py-4 font-bold text-slate-700">
                        {row.pcFa}
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-700">
                        {row.pcEn}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 font-extrabold text-slate-700">
                          {toPersianNumber(row.number)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenInfo(row)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2f7f86]/10 text-[#2f7f86] transition hover:bg-[#2f7f86] hover:text-white"
                            title="مشاهده جزئیات"
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditRow(row)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            title="ویرایش"
                          >
                            <Pencil size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {!loading && !errorMessage && filteredData.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row">
            <div className="text-xs font-bold text-slate-500">
              نمایش {toPersianNumber(fromRow)} تا {toPersianNumber(toRow)} از{" "}
              {toPersianNumber(filteredData.length)} ردیف
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>

              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`h-10 min-w-10 rounded-xl border px-3 text-xs font-extrabold transition ${
                      currentPage === page
                        ? "border-[#2f7f86] bg-[#2f7f86] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {toPersianNumber(page)}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <InfoModal
        open={Boolean(infoRow)}
        row={infoRow}
        details={infoDetails}
        loading={detailsLoading}
        errorMessage={detailsErrorMessage}
        onClose={() => {
          setInfoRow(null);
          setInfoDetails(null);
          setDetailsErrorMessage("");
        }}
      />

      <EditModal
        open={Boolean(editRow)}
        row={editRow}
        personals={personals}
        categories={categories}
        lookupsLoading={lookupsLoading}
        saving={saving}
        onClose={() => setEditRow(null)}
        onSave={handleSaveEdit}
      />

      <PopupMessage
        popup={popup}
        onClose={() =>
          setPopup({
            open: false,
            title: "",
            message: "",
            type: "error",
          })
        }
      />
    </div>
  );
}