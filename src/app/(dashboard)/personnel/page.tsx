"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import personalService from "@/services/personal-service";
import type { PersonnelFormValues, PersonnelRow } from "@/types/personal";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

const PAGE_SIZE = 10;

type PaginationItem = number | "dots-start" | "dots-end";

type ModalMode = "create" | "edit";

type ModalState = {
  open: boolean;
  mode: ModalMode;
  row: PersonnelRow | null;
};

type PopupState = {
  open: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "danger";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

const emptyForm: PersonnelFormValues = {
  firstName: "",
  lastName: "",
  code: "",
};

function getPaginationItems(totalPages: number, currentPage: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "dots-end", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "dots-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "dots-start", currentPage - 1, currentPage, currentPage + 1, "dots-end", totalPages];
}

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

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-800">{toPersianNumber(value)}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Popup({
  popup,
  loading,
  onClose,
}: {
  popup: PopupState;
  loading?: boolean;
  onClose: () => void;
}) {
  if (!popup.open) return null;

  const isDanger = popup.type === "danger";
  const isError = popup.type === "error";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={["text-lg font-extrabold", isDanger || isError ? "text-rose-700" : "text-emerald-700"].join(" ")}>
              {popup.title}
            </h3>

            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{popup.message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl bg-slate-100 p-3 text-slate-500 transition hover:bg-slate-200 disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          {popup.onConfirm ? (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {popup.cancelText || "انصراف"}
            </button>
          ) : null}

          <button
            type="button"
            disabled={loading}
            onClick={popup.onConfirm || onClose}
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-extrabold text-white transition disabled:opacity-60",
              isDanger || isError ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700",
            ].join(" ")}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "در حال انجام..." : popup.confirmText || "متوجه شدم"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonnelModal({
  modal,
  form,
  saving,
  error,
  onChange,
  onClose,
  onSave,
}: {
  modal: ModalState;
  form: PersonnelFormValues;
  saving: boolean;
  error: string;
  onChange: (values: PersonnelFormValues) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!modal.open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-gradient-to-l from-[#163647] to-[#2f7f86] px-7 py-6 text-white">
          <div>
            <h2 className="text-xl font-extrabold">{modal.mode === "edit" ? "ویرایش پرسنل" : "افزودن پرسنل"}</h2>
            <p className="mt-2 text-xs font-bold text-white/70">اطلاعات اصلی پرسنل را وارد کنید.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl bg-white/10 p-3 transition hover:bg-white/20 disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-7">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-600">نام</label>
              <input
                value={form.firstName}
                onChange={(event) => onChange({ ...form, firstName: event.target.value })}
                placeholder="مثلاً محمد"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-extrabold text-slate-600">نام خانوادگی</label>
              <input
                value={form.lastName}
                onChange={(event) => onChange({ ...form, lastName: event.target.value })}
                placeholder="مثلاً محمدی"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold text-slate-600">کد / نام کاربری</label>
            <input
              value={form.code}
              onChange={(event) => onChange({ ...form, code: event.target.value })}
              placeholder="کد پرسنلی یا شماره"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
          >
            بستن
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2f7f86] px-7 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#276b71] disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PersonnelPage() {
  const [rows, setRows] = useState<PersonnelRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "create",
    row: null,
  });

  const [form, setForm] = useState<PersonnelFormValues>(emptyForm);

  const [popup, setPopup] = useState<PopupState>({
    open: false,
    title: "",
    message: "",
    type: "success",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalError, setModalError] = useState("");

  const filteredRows = useMemo(() => {
    const query = normalizeText(searchQuery);

    if (!query) return rows;

    return rows.filter((row) =>
      normalizeText(
        `${row.fullName} ${row.firstName} ${row.lastName} ${row.code} ${row.nationalId} ${row.fatherName} ${row.currentJobHeld} ${row.employment} ${row.educational} ${row.fieldOfStudy} ${row.ip} ${row.mac}`
      ).includes(query)
    );
  }, [rows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);
  const fromRow = filteredRows.length === 0 ? 0 : startIndex + 1;
  const toRow = Math.min(endIndex, filteredRows.length);

  const paginationItems = useMemo(() => getPaginationItems(totalPages, currentPage), [totalPages, currentPage]);

  async function loadPersonnel() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await personalService.getPersonnel(1, 3000);

      setRows(response.rows);
      setTotalRows(response.total);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.Message ?? error?.message ?? "خطا در دریافت لیست پرسنل";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPersonnel();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  function openCreateModal() {
    setModal({
      open: true,
      mode: "create",
      row: null,
    });

    setForm(emptyForm);
    setModalError("");
  }

  function openEditModal(row: PersonnelRow) {
    setModal({
      open: true,
      mode: "edit",
      row,
    });

    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      code: row.code === "-" ? "" : row.code,
    });

    setModalError("");
  }

  function closeModal() {
    if (saving) return;

    setModal({
      open: false,
      mode: "create",
      row: null,
    });

    setForm(emptyForm);
    setModalError("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setModalError("");

      if (!form.firstName.trim()) {
        setModalError("نام را وارد کنید.");
        return;
      }

      if (!form.lastName.trim()) {
        setModalError("نام خانوادگی را وارد کنید.");
        return;
      }

      if (!form.code.trim()) {
        setModalError("کد / نام کاربری را وارد کنید.");
        return;
      }

      if (modal.mode === "edit" && modal.row) {
        await personalService.editPersonnel(modal.row, form);
      } else {
        await personalService.createPersonnel(form);
      }

      setModal({
        open: false,
        mode: "create",
        row: null,
      });
      setForm(emptyForm);
      setModalError("");

      setPopup({
        open: true,
        title: "عملیات موفق",
        message: modal.mode === "edit" ? "اطلاعات پرسنل با موفقیت ویرایش شد." : "پرسنل جدید با موفقیت ثبت شد.",
        type: "success",
      });

      await loadPersonnel();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.Message ?? error?.message ?? "خطا در ذخیره اطلاعات پرسنل";
      setModalError(message);
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(row: PersonnelRow) {
    setPopup({
      open: true,
      title: "حذف پرسنل",
      message: `آیا از حذف «${row.fullName}» مطمئن هستید؟`,
      type: "danger",
      confirmText: "بله، حذف شود",
      cancelText: "انصراف",
      onConfirm: () => handleDelete(row),
    });
  }

  async function handleDelete(row: PersonnelRow) {
    try {
      setDeleting(true);

      await personalService.deletePersonnel(row);

      setPopup({
        open: true,
        title: "عملیات موفق",
        message: "پرسنل با موفقیت حذف شد.",
        type: "success",
      });

      await loadPersonnel();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.response?.data?.Message ?? error?.message ?? "خطا در حذف پرسنل";

      setPopup({
        open: true,
        title: "خطا در حذف",
        message,
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  function closePopup() {
    if (deleting) return;

    setPopup({
      open: false,
      title: "",
      message: "",
      type: "success",
    });
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
            <h1 className="text-2xl font-extrabold">مدیریت پرسنل</h1>
            <p className="mt-2 text-sm font-medium text-white/70">مشاهده، جستجو، افزودن، ویرایش و حذف اطلاعات پرسنل</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPersonnel}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/20 disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              بروزرسانی
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#163647] shadow-lg transition hover:bg-slate-50"
            >
              <Plus size={18} />
              افزودن پرسنل
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="تعداد کل پرسنل" value={totalRows || rows.length} icon={<UsersRound size={22} />} />
        <StatCard title="نتیجه جستجو" value={filteredRows.length} icon={<Search size={22} />} />
        <StatCard title="پرسنل دارای سمت" value={rows.filter((row) => row.currentJobHeld !== "-").length} icon={<BriefcaseBusiness size={22} />} />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجو بر اساس نام، کد، کد ملی، سمت، IP، MAC..."
            className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 pr-11 pl-11 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
          />

          {searchQuery ? (
            <button type="button" onClick={() => setSearchQuery("")} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500">
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
                <th className="rounded-r-2xl px-4 py-4 font-extrabold">نام و نام خانوادگی</th>
                <th className="px-4 py-4 font-extrabold">کد</th>
                <th className="px-4 py-4 font-extrabold">کد ملی</th>
                <th className="px-4 py-4 font-extrabold">نام پدر</th>
                <th className="px-4 py-4 font-extrabold">سمت</th>
                <th className="px-4 py-4 font-extrabold">استخدام</th>
                <th className="px-4 py-4 font-extrabold">IP</th>
                <th className="rounded-l-2xl px-4 py-4 font-extrabold">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-16">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="font-extrabold">در حال دریافت اطلاعات پرسنل...</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading && errorMessage ? (
                <tr>
                  <td colSpan={8} className="px-3 py-10">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm font-extrabold text-rose-700">
                      {errorMessage}
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading && !errorMessage && filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-16">
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm font-extrabold text-slate-400">
                      {searchQuery ? "نتیجه‌ای برای جستجو یافت نشد." : "پرسنلی برای نمایش وجود ندارد."}
                    </div>
                  </td>
                </tr>
              ) : null}

              {!loading && !errorMessage
                ? paginatedRows.map((row) => (
                    <tr key={row.guid || row.id} className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#2f7f86]/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
                            <UserRound size={18} />
                          </div>

                          <div className="text-right">
                            <div className="font-extrabold text-slate-800">{row.fullName}</div>
                            <div className="mt-1 text-[11px] font-bold text-slate-400">ID: {toPersianNumber(row.id)}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-mono font-bold text-slate-700">{row.code}</td>
                      <td className="px-4 py-4 text-slate-700">{row.nationalId}</td>
                      <td className="px-4 py-4 text-slate-700">{row.fatherName}</td>
                      <td className="min-w-[160px] px-4 py-4 font-bold text-slate-700">{row.currentJobHeld}</td>
                      <td className="px-4 py-4 text-slate-700">{row.employment}</td>
                      <td className="px-4 py-4 font-mono text-slate-700">{row.ip}</td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            title="ویرایش"
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDelete(row)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                            title="حذف"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {!loading && !errorMessage && filteredRows.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row">
            <div className="text-xs font-bold text-slate-500">
              نمایش {toPersianNumber(fromRow)} تا {toPersianNumber(toRow)} از {toPersianNumber(filteredRows.length)} ردیف
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

              <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-500">
                صفحه {toPersianNumber(currentPage)} از {toPersianNumber(totalPages)}
              </div>

              {paginationItems.map((item) => {
                if (typeof item === "string") {
                  return (
                    <span key={item} className="flex h-10 min-w-10 items-center justify-center rounded-xl text-sm font-extrabold text-slate-400">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goToPage(item)}
                    className={`h-10 min-w-10 rounded-xl border px-3 text-xs font-extrabold transition ${
                      currentPage === item
                        ? "border-[#2f7f86] bg-[#2f7f86] text-white shadow-md shadow-[#2f7f86]/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {toPersianNumber(item)}
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

      <PersonnelModal modal={modal} form={form} saving={saving} error={modalError} onChange={setForm} onClose={closeModal} onSave={handleSave} />

      <Popup popup={popup} loading={deleting} onClose={closePopup} />
    </div>
  );
}