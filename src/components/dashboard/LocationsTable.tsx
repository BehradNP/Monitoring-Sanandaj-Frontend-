"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaBroadcastTower,
  FaEdit,
  FaEye,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaPlus,
  FaRedo,
  FaSearch,
  FaSpinner,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import type {
  LocationRouterFormValues,
  LocationRouterItem,
  NetworkLocation,
  NetworkLocationStatus,
} from "@/types/network-monitoring";

const PAGE_SIZE = 10;

type ViewMode = "network-links" | "map-points";

type ModalMode = "create" | "edit";

type ModalState = {
  open: boolean;
  mode: ModalMode;
  item: LocationRouterItem | null;
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

const emptyForm: LocationRouterFormValues = {
  title: "",
  lat: "",
  lng: "",
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const record = error as {
      response?: {
        data?: {
          message?: string;
          Message?: string;
        };
      };
      message?: string;
    };

    return (
      record.response?.data?.message ??
      record.response?.data?.Message ??
      record.message ??
      fallback
    );
  }

  return fallback;
}

function StatusBadge({ status }: { status: NetworkLocationStatus }) {
  const isOnline = status === "ONLINE";

  return (
    <span
      className={[
        "inline-flex min-w-[82px] items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-black",
        isOnline
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700",
      ].join(" ")}
    >
      {isOnline ? "فعال" : "غیرفعال"}
    </span>
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                isDanger || isError
                  ? "bg-rose-50 text-rose-600"
                  : "bg-emerald-50 text-emerald-600",
              ].join(" ")}
            >
              <FaExclamationTriangle />
            </div>

            <div>
              <h3
                className={[
                  "text-base font-black sm:text-lg",
                  isDanger || isError ? "text-rose-700" : "text-emerald-700",
                ].join(" ")}
              >
                {popup.title}
              </h3>

              <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                {popup.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl bg-slate-100 p-3 text-slate-500 transition hover:bg-slate-200 disabled:opacity-60"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          {popup.onConfirm ? (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {popup.cancelText || "انصراف"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={popup.onConfirm || onClose}
            disabled={loading}
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-white transition disabled:opacity-60",
              isDanger || isError
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-600 hover:bg-emerald-700",
            ].join(" ")}
          >
            {loading ? <FaSpinner className="animate-spin" /> : null}
            {loading ? "در حال انجام..." : popup.confirmText || "متوجه شدم"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NetworkDetailsModal({
  location,
  onClose,
}: {
  location: NetworkLocation | null;
  onClose: () => void;
}) {
  if (!location) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-gradient-to-l from-[#163647] to-[#2f7f86] px-5 py-5 text-white sm:px-6">
          <div>
            <h2 className="text-lg font-black sm:text-xl">جزئیات لوکیشن</h2>
            <p className="mt-1 text-xs font-bold text-white/70">
              همان اطلاعاتی که در Popup نقشه نمایش داده می‌شود
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[calc(92dvh-100px)] overflow-y-auto p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {location.title}
              </h3>
              <p className="mt-1 font-mono text-xs font-bold text-slate-400">
                IP: {location.ip}
              </p>
            </div>

            <StatusBadge status={location.status} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-400">
                Hostname
              </div>
              <div className="mt-2 font-bold text-slate-800">
                {location.hostname}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-400">
                وضعیت
              </div>
              <div className="mt-2">
                <StatusBadge status={location.status} />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-400">
                مختصات مبدا
              </div>
              <div className="mt-2 font-mono text-xs font-bold text-slate-700">
                {location.sourceGps}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-[11px] font-black text-slate-400">
                مختصات مقصد
              </div>
              <div className="mt-2 font-mono text-xs font-bold text-slate-700">
                {location.dstGps}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-black text-slate-900">
              جزئیات کامل
            </div>

            <div
              className="network-details-content text-sm font-bold leading-7 text-slate-700"
              dangerouslySetInnerHTML={{ __html: location.infoHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationModal({
  modal,
  form,
  error,
  saving,
  onChange,
  onClose,
  onSave,
}: {
  modal: ModalState;
  form: LocationRouterFormValues;
  error: string;
  saving: boolean;
  onChange: (values: LocationRouterFormValues) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!modal.open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="max-h-[92dvh] w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-gradient-to-l from-[#163647] to-[#2f7f86] px-5 py-5 text-white sm:px-6">
          <div>
            <h2 className="text-lg font-black sm:text-xl">
              {modal.mode === "edit" ? "ویرایش لوکیشن" : "افزودن لوکیشن"}
            </h2>

            <p className="mt-1 text-xs font-bold text-white/70">
              مختصات باید با فرمت longitude و latitude ذخیره شود.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl bg-white/10 p-3 text-white transition hover:bg-white/20 disabled:opacity-60"
          >
            <FaTimes />
          </button>
        </div>

        <div className="max-h-[calc(92dvh-160px)] overflow-y-auto p-5 sm:p-6">
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-black text-slate-600">
                عنوان لوکیشن
              </label>

              <input
                value={form.title}
                onChange={(event) =>
                  onChange({
                    ...form,
                    title: event.target.value,
                  })
                }
                placeholder="مثلاً سازمان آرامستانها"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-black text-slate-600">
                  Longitude / طول جغرافیایی
                </label>

                <input
                  value={form.lng}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      lng: event.target.value,
                    })
                  }
                  placeholder="47.03952223062516"
                  dir="ltr"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left font-mono text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-slate-600">
                  Latitude / عرض جغرافیایی
                </label>

                <input
                  value={form.lat}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      lat: event.target.value,
                    })
                  }
                  placeholder="35.30087990974823"
                  dir="ltr"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left font-mono text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold leading-6 text-slate-500">
              مقدار ارسالی به API به شکل{" "}
              <span className="font-mono text-slate-800">lng,lat</span> ساخته
              می‌شود.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            لغو
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2f7f86] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#276b72] disabled:opacity-60"
          >
            {saving ? <FaSpinner className="animate-spin" /> : null}
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationsTable({
  networkLocations = [],
  networkLocationsLoading,
  networkLocationsError,
  onRetryNetworkLocations,
  points,
  loading,
  errorMessage,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
}: {
  networkLocations?: NetworkLocation[];
  networkLocationsLoading?: boolean;
  networkLocationsError?: string;
  onRetryNetworkLocations?: () => void;
  points: LocationRouterItem[];
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onCreate: (values: LocationRouterFormValues) => Promise<void>;
  onEdit: (
    item: LocationRouterItem,
    values: LocationRouterFormValues
  ) => Promise<void>;
  onDelete: (item: LocationRouterItem) => Promise<void>;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("network-links");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetworkLocation, setSelectedNetworkLocation] =
    useState<NetworkLocation | null>(null);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "create",
    item: null,
  });

  const [form, setForm] = useState<LocationRouterFormValues>(emptyForm);
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingGuid, setDeletingGuid] = useState<string | null>(null);

  const [popup, setPopup] = useState<PopupState>({
    open: false,
    title: "",
    message: "",
    type: "success",
  });

  const safePoints = Array.isArray(points) ? points : [];
  const safeNetworkLocations = Array.isArray(networkLocations)
    ? networkLocations
    : [];

  const filteredNetworkLocations = useMemo(() => {
    const query = normalizeText(searchQuery);

    if (!query) return safeNetworkLocations;

    return safeNetworkLocations.filter((item) =>
      normalizeText(
        `${item.title} ${item.ip} ${item.hostname} ${item.sourceGps} ${item.dstGps} ${item.infoHtml}`
      ).includes(query)
    );
  }, [safeNetworkLocations, searchQuery]);

  const filteredPoints = useMemo(() => {
    const query = normalizeText(searchQuery);

    if (!query) return safePoints;

    return safePoints.filter((item) =>
      normalizeText(
        `${item.title} ${item.location} ${item.id} ${item.guid}`
      ).includes(query)
    );
  }, [safePoints, searchQuery]);

  const activeItemsCount =
    viewMode === "network-links"
      ? filteredNetworkLocations.length
      : filteredPoints.length;

  const totalPages = Math.max(Math.ceil(activeItemsCount / PAGE_SIZE), 1);
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const paginatedNetworkLocations = filteredNetworkLocations.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const paginatedPoints = filteredPoints.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, viewMode]);

  function openCreateModal() {
    setModal({
      open: true,
      mode: "create",
      item: null,
    });

    setForm(emptyForm);
    setModalError("");
  }

  function openEditModal(item: LocationRouterItem) {
    setModal({
      open: true,
      mode: "edit",
      item,
    });

    setForm({
      title: item.title === "-" ? "" : item.title,
      lat: item.lat === null ? "" : String(item.lat),
      lng: item.lng === null ? "" : String(item.lng),
    });

    setModalError("");
  }

  function closeModal() {
    if (saving) return;

    setModal({
      open: false,
      mode: "create",
      item: null,
    });

    setForm(emptyForm);
    setModalError("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setModalError("");

      const title = form.title.trim();
      const lat = Number(form.lat);
      const lng = Number(form.lng);

      if (!title) {
        setModalError("عنوان لوکیشن را وارد کنید.");
        return;
      }

      if (!Number.isFinite(lng)) {
        setModalError("طول جغرافیایی معتبر نیست.");
        return;
      }

      if (!Number.isFinite(lat)) {
        setModalError("عرض جغرافیایی معتبر نیست.");
        return;
      }

      if (modal.mode === "edit" && modal.item) {
        await onEdit(modal.item, {
          title,
          lat: String(lat),
          lng: String(lng),
        });
      } else {
        await onCreate({
          title,
          lat: String(lat),
          lng: String(lng),
        });
      }

      closeModal();

      setPopup({
        open: true,
        title: "عملیات موفق",
        message:
          modal.mode === "edit"
            ? "لوکیشن با موفقیت ویرایش شد."
            : "لوکیشن جدید با موفقیت ثبت شد.",
        type: "success",
      });
    } catch (error) {
      setModalError(getErrorMessage(error, "خطا در ذخیره لوکیشن"));
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(item: LocationRouterItem) {
    setPopup({
      open: true,
      title: "حذف لوکیشن",
      message: `آیا از حذف «${item.title}» مطمئن هستید؟`,
      type: "danger",
      confirmText: "بله، حذف شود",
      cancelText: "انصراف",
      onConfirm: () => handleDelete(item),
    });
  }

  async function handleDelete(item: LocationRouterItem) {
    try {
      setDeletingGuid(item.guid);

      await onDelete(item);

      setPopup({
        open: true,
        title: "عملیات موفق",
        message: "لوکیشن با موفقیت حذف شد.",
        type: "success",
      });
    } catch (error) {
      setPopup({
        open: true,
        title: "خطا در حذف",
        message: getErrorMessage(error, "خطا در حذف لوکیشن"),
        type: "error",
      });
    } finally {
      setDeletingGuid(null);
    }
  }

  function closePopup() {
    if (deletingGuid) return;

    setPopup({
      open: false,
      title: "",
      message: "",
      type: "success",
    });
  }

  const goToPrevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
              {viewMode === "network-links" ? (
                <FaBroadcastTower />
              ) : (
                <FaMapMarkerAlt />
              )}
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900">
                {viewMode === "network-links"
                  ? "لینک‌های مانیتورینگ"
                  : "مدیریت لوکیشن‌های نقشه"}
              </h3>

              <p className="mt-1 text-[11px] font-bold text-slate-400">
                {toPersianNumber(activeItemsCount)} مورد قابل نمایش
              </p>
            </div>
          </div>

          {viewMode === "map-points" ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7f86] px-5 py-3 text-xs font-black text-white shadow-lg transition hover:bg-[#276b72] sm:w-fit"
            >
              <FaPlus />
              افزودن لوکیشن
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-1 ring-1 ring-slate-200 sm:flex sm:w-fit">
          <button
            type="button"
            onClick={() => setViewMode("network-links")}
            className={[
              "rounded-xl px-4 py-2.5 text-xs font-black transition",
              viewMode === "network-links"
                ? "bg-[#163647] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50",
            ].join(" ")}
          >
            لینک‌ها و وضعیت
          </button>

          <button
            type="button"
            onClick={() => setViewMode("map-points")}
            className={[
              "rounded-xl px-4 py-2.5 text-xs font-black transition",
              viewMode === "map-points"
                ? "bg-[#163647] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50",
            ].join(" ")}
          >
            لوکیشن‌های نقشه
          </button>
        </div>

        <div className="relative mt-4">
          <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              viewMode === "network-links"
                ? "جستجو بر اساس عنوان، IP، Hostname یا جزئیات..."
                : "جستجو بر اساس عنوان، مختصات یا شناسه..."
            }
            className="h-[52px] w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-11 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2f7f86] focus:ring-4 focus:ring-[#2f7f86]/10"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-rose-500"
            >
              <FaTimes />
            </button>
          ) : null}
        </div>
      </div>

      {viewMode === "network-links" ? (
        <>
          {networkLocationsLoading && safeNetworkLocations.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-14 text-center text-sm font-black text-slate-500">
              <FaSpinner className="animate-spin" />
              در حال دریافت لینک‌های مانیتورینگ...
            </div>
          ) : null}

          {!networkLocationsLoading &&
          networkLocationsError &&
          safeNetworkLocations.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-black text-rose-700">
                {networkLocationsError}
              </p>

              {onRetryNetworkLocations ? (
                <button
                  type="button"
                  onClick={onRetryNetworkLocations}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs font-black text-white transition hover:bg-rose-700"
                >
                  <FaRedo />
                  تلاش مجدد
                </button>
              ) : null}
            </div>
          ) : null}

          {!networkLocationsLoading &&
          !networkLocationsError &&
          filteredNetworkLocations.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
                <FaBroadcastTower size={24} />
              </div>

              <p className="mt-4 text-sm font-black text-slate-400">
                {searchQuery
                  ? "نتیجه‌ای برای جستجو یافت نشد."
                  : "لینکی برای نمایش وجود ندارد."}
              </p>
            </div>
          ) : null}

          {filteredNetworkLocations.length > 0 ? (
            <>
              <div className="space-y-3 p-3 md:hidden">
                {paginatedNetworkLocations.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">
                          {item.title}
                        </div>
                        <div className="mt-1 font-mono text-xs font-bold text-slate-400">
                          {item.ip}
                        </div>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-500">
                      <div>Hostname: {item.hostname}</div>
                      <div className="font-mono">مبدا: {item.sourceGps}</div>
                      <div className="font-mono">مقصد: {item.dstGps}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNetworkLocation(item)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2f7f86] px-4 py-3 text-xs font-black text-white transition hover:bg-[#276b72]"
                    >
                      <FaEye />
                      جزئیات
                    </button>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto p-4 md:block">
                <table className="w-full min-w-[920px] text-right text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="rounded-r-2xl px-4 py-4 font-black">
                        عنوان
                      </th>
                      <th className="px-4 py-4 font-black">IP</th>
                      <th className="px-4 py-4 font-black">Hostname</th>
                      <th className="px-4 py-4 font-black">وضعیت</th>
                      <th className="px-4 py-4 font-black">مبدا</th>
                      <th className="px-4 py-4 font-black">مقصد</th>
                      <th className="rounded-l-2xl px-4 py-4 text-center font-black">
                        عملیات
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedNetworkLocations.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#2f7f86]/5"
                      >
                        <td className="max-w-[260px] px-4 py-4 font-black text-slate-900">
                          {item.title}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs font-bold text-slate-700">
                          {item.ip}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {item.hostname}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-4 font-mono text-[11px] text-slate-500">
                          {item.sourceGps}
                        </td>
                        <td className="px-4 py-4 font-mono text-[11px] text-slate-500">
                          {item.dstGps}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => setSelectedNetworkLocation(item)}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#2f7f86]/10 px-4 py-2.5 text-xs font-black text-[#2f7f86] transition hover:bg-[#2f7f86] hover:text-white"
                            >
                              <FaEye />
                              جزئیات
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {viewMode === "map-points" ? (
        <>
          {loading && safePoints.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-14 text-center text-sm font-black text-slate-500">
              <FaSpinner className="animate-spin" />
              در حال دریافت لوکیشن‌ها...
            </div>
          ) : null}

          {!loading && errorMessage && safePoints.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-black text-rose-700">
                {errorMessage}
              </p>

              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs font-black text-white transition hover:bg-rose-700"
                >
                  <FaRedo />
                  تلاش مجدد
                </button>
              ) : null}
            </div>
          ) : null}

          {!loading && !errorMessage && filteredPoints.length === 0 ? (
            <div className="px-4 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
                <FaMapMarkerAlt size={24} />
              </div>

              <p className="mt-4 text-sm font-black text-slate-400">
                {searchQuery
                  ? "نتیجه‌ای برای جستجو یافت نشد."
                  : "لوکیشنی برای نمایش وجود ندارد."}
              </p>
            </div>
          ) : null}

          {filteredPoints.length > 0 ? (
            <>
              <div className="space-y-3 p-3 md:hidden">
                {paginatedPoints.map((item) => {
                  const isDeleting = deletingGuid === item.guid;

                  return (
                    <div
                      key={item.guid || item.id}
                      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-slate-900">
                            {item.title}
                          </div>

                          <div className="mt-1 text-[11px] font-bold text-slate-400">
                            ID: {toPersianNumber(item.id)}
                          </div>
                        </div>

                        <span
                          className={[
                            "rounded-full px-3 py-1 text-[11px] font-black",
                            item.isValidLocation
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700",
                          ].join(" ")}
                        >
                          {item.isValidLocation ? "معتبر" : "نامعتبر"}
                        </span>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 font-mono text-xs font-bold text-slate-600">
                        {item.location}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          disabled={!item.guid}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-2.5 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                        >
                          <FaEdit />
                          ویرایش
                        </button>

                        <button
                          type="button"
                          onClick={() => requestDelete(item)}
                          disabled={!item.guid || isDeleting}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 px-3 py-2.5 text-xs font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          <FaTrash />
                          {isDeleting ? "حذف..." : "حذف"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto p-4 md:block">
                <table className="w-full min-w-[760px] text-right text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      <th className="rounded-r-2xl px-4 py-4 font-black">
                        عنوان لوکیشن
                      </th>
                      <th className="px-4 py-4 font-black">مختصات lng,lat</th>
                      <th className="px-4 py-4 font-black">وضعیت مختصات</th>
                      <th className="px-4 py-4 font-black">شناسه</th>
                      <th className="rounded-l-2xl px-4 py-4 text-center font-black">
                        عملیات
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedPoints.map((item) => {
                      const isDeleting = deletingGuid === item.guid;

                      return (
                        <tr
                          key={item.guid || item.id}
                          className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#2f7f86]/5"
                        >
                          <td className="px-4 py-4 font-black text-slate-900">
                            {item.title}
                          </td>

                          <td className="px-4 py-4 font-mono text-xs font-bold text-slate-600">
                            {item.location}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={[
                                "rounded-full px-3 py-1.5 text-[11px] font-black",
                                item.isValidLocation
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700",
                              ].join(" ")}
                            >
                              {item.isValidLocation ? "معتبر" : "نامعتبر"}
                            </span>
                          </td>

                          <td className="px-4 py-4 font-bold text-slate-600">
                            {toPersianNumber(item.id)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                disabled={!item.guid}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white disabled:opacity-50"
                                title="ویرایش"
                              >
                                <FaEdit />
                              </button>

                              <button
                                type="button"
                                onClick={() => requestDelete(item)}
                                disabled={!item.guid || isDeleting}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:opacity-50"
                                title="حذف"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {activeItemsCount > 0 ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center text-xs font-bold text-slate-500 sm:text-right">
            نمایش {toPersianNumber(startIndex + 1)} تا{" "}
            {toPersianNumber(Math.min(startIndex + PAGE_SIZE, activeItemsCount))}{" "}
            از {toPersianNumber(activeItemsCount)} مورد
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              قبلی
            </button>

            <span className="rounded-xl bg-[#163647] px-4 py-2 text-xs font-black text-white">
              {toPersianNumber(currentPage)} / {toPersianNumber(totalPages)}
            </span>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        </div>
      ) : null}

      <NetworkDetailsModal
        location={selectedNetworkLocation}
        onClose={() => setSelectedNetworkLocation(null)}
      />

      <LocationModal
        modal={modal}
        form={form}
        error={modalError}
        saving={saving}
        onChange={setForm}
        onClose={closeModal}
        onSave={handleSave}
      />

      <Popup popup={popup} loading={Boolean(deletingGuid)} onClose={closePopup} />
    </div>
  );
}