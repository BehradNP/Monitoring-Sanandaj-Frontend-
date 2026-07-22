"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import hierarchyService from "@/services/hierarchy-service";
import type { HierarchyFormValues, HierarchyItem } from "@/types/hierarchy";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaExclamationTriangle,
  FaFolder,
  FaFolderOpen,
  FaPlus,
  FaSearch,
  FaSitemap,
  FaSpinner,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

type ModalMode = "create-root" | "create-child" | "edit";

type ModalState = {
  open: boolean;
  mode: ModalMode;
  item: HierarchyItem | null;
  parent: HierarchyItem | null;
};

type ConfirmPopupProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const initialModal: ModalState = {
  open: false,
  mode: "create-root",
  item: null,
  parent: null,
};

const emptyValues: HierarchyFormValues = {
  title: "",
  code: "",
  parentId: null,
};

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function normalizeText(value: string) {
  return value.replace(/ي/g, "ی").replace(/ك/g, "ک").trim().toLowerCase();
}

function filterTree(items: HierarchyItem[], query: string): HierarchyItem[] {
  const cleanQuery = normalizeText(query);

  if (!cleanQuery) return items;

  const walk = (nodes: HierarchyItem[]): HierarchyItem[] => {
    return nodes
      .map((node) => {
        const children = walk(node.children);
        const text = normalizeText(`${node.title} ${node.code} ${node.numericId}`);

        if (text.includes(cleanQuery) || children.length > 0) {
          return {
            ...node,
            children,
          };
        }

        return null;
      })
      .filter(Boolean) as HierarchyItem[];
  };

  return walk(items);
}

function flattenItems(items: HierarchyItem[]): HierarchyItem[] {
  const result: HierarchyItem[] = [];

  const walk = (nodes: HierarchyItem[]) => {
    nodes.forEach((node) => {
      result.push(node);
      walk(node.children);
    });
  };

  walk(items);

  return result;
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
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold text-slate-400 sm:text-xs">
            {title}
          </div>

          <div className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            {toPersianNumber(value)}
          </div>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ConfirmPopup({
  open,
  title,
  message,
  confirmText = "تأیید",
  cancelText = "لغو",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmPopupProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <FaExclamationTriangle />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 sm:text-lg">
                {title}
              </h3>

              <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                {message}
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

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-rose-700 disabled:opacity-60"
          >
            {loading ? <FaSpinner className="animate-spin" /> : null}
            {loading ? "در حال انجام..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HierarchyPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [openIds, setOpenIds] = useState<string[]>([]);
  const [hierarchyData, setHierarchyData] = useState<HierarchyItem[]>([]);
  const [flatItems, setFlatItems] = useState<HierarchyItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(initialModal);
  const [formValues, setFormValues] = useState<HierarchyFormValues>(emptyValues);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<HierarchyItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalError, setModalError] = useState("");

  const visibleTree = useMemo(
    () => filterTree(hierarchyData, searchQuery),
    [hierarchyData, searchQuery]
  );

  const visibleFlat = useMemo(() => flattenItems(visibleTree), [visibleTree]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileSidebarOpen]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openAll = () => {
    setOpenIds(flattenItems(hierarchyData).map((item) => item.id));
  };

  const closeAll = () => {
    setOpenIds([]);
  };

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await hierarchyService.getHierarchyData();

      setHierarchyData(data.tree);
      setFlatItems(data.flat);
      setTotalItems(data.total);

      if (data.tree.length > 0 && openIds.length === 0) {
        setOpenIds(data.tree.map((item) => item.id));
      }
    } catch (error) {
      console.log("HIERARCHY API ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات سلسله مراتب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateRootModal = () => {
    setModal({
      open: true,
      mode: "create-root",
      item: null,
      parent: null,
    });

    setFormValues(emptyValues);
    setModalError("");
  };

  const openCreateChildModal = (parent: HierarchyItem) => {
    setModal({
      open: true,
      mode: "create-child",
      item: null,
      parent,
    });

    setFormValues({
      title: "",
      code: "",
      parentId: parent.numericId,
    });

    setModalError("");
  };

  const openEditModal = (item: HierarchyItem) => {
    setModal({
      open: true,
      mode: "edit",
      item,
      parent: null,
    });

    setFormValues({
      title: item.title,
      code: item.code,
      parentId: item.parentId,
    });

    setModalError("");
  };

  const closeModal = () => {
    if (actionLoading) return;

    setModal(initialModal);
    setFormValues(emptyValues);
    setModalError("");
  };

  const handleSave = async () => {
    try {
      setActionLoading(true);
      setModalError("");

      const title = formValues.title.trim();

      if (!title) {
        setModalError("عنوان را وارد کنید.");
        return;
      }

      if (modal.mode === "edit" && modal.item) {
        await hierarchyService.editCategory(modal.item, {
          title,
          code: formValues.code.trim(),
          parentId: formValues.parentId,
        });
      } else {
        await hierarchyService.createCategory({
          title,
          code: formValues.code.trim(),
          parentId: formValues.parentId,
        });
      }

      await fetchHierarchy();
      closeModal();
    } catch (error) {
      console.log("HIERARCHY SAVE ERROR:", error);
      setModalError("خطا در ذخیره اطلاعات سلسله مراتب");
    } finally {
      setActionLoading(false);
    }
  };

  const requestDelete = (item: HierarchyItem) => {
    if (!item.guid) {
      setErrorMessage("این آیتم قابل حذف نیست.");
      return;
    }

    setConfirmDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;

    try {
      setDeleteLoadingId(confirmDeleteItem.id);
      setErrorMessage("");

      await hierarchyService.deleteCategory(confirmDeleteItem);
      await fetchHierarchy();

      setConfirmDeleteItem(null);
    } catch (error) {
      console.log("HIERARCHY DELETE ERROR:", error);
      setErrorMessage("خطا در حذف آیتم سلسله مراتب");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const closeDeletePopup = () => {
    if (deleteLoadingId) return;
    setConfirmDeleteItem(null);
  };

  const renderItem = (item: HierarchyItem, depth = 0) => {
    const hasChildren = item.children.length > 0;
    const isOpen = openIds.includes(item.id);
    const isDeleting = deleteLoadingId === item.id;
    const indent = Math.min(depth * 18, 54);

    return (
      <div key={item.id} className="w-full">
        <div
          className={[
            "group relative mb-3 rounded-[24px] border bg-white p-3 shadow-sm transition hover:border-[#2f7f86]/30 hover:bg-[#2f7f86]/5 hover:shadow-md sm:p-4",
            depth === 0 ? "border-slate-200" : "border-slate-100",
          ].join(" ")}
          style={{ marginRight: indent }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <button
                type="button"
                onClick={() => hasChildren && toggleOpen(item.id)}
                className={[
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border text-sm transition sm:mt-0",
                  hasChildren
                    ? "cursor-pointer border-[#2f7f86]/20 bg-[#2f7f86]/10 text-[#2f7f86] hover:bg-[#2f7f86]/15"
                    : "cursor-default border-slate-100 bg-slate-50 text-slate-300",
                ].join(" ")}
              >
                {hasChildren ? isOpen ? <FaChevronUp /> : <FaChevronDown /> : <FaSitemap />}
              </button>

              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 sm:flex">
                {hasChildren && isOpen ? <FaFolderOpen /> : <FaFolder />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-words text-sm font-black text-slate-900 sm:text-base">
                    {item.title || "بدون عنوان"}
                  </span>

                  {item.code ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-500">
                      {item.code}
                    </span>
                  ) : null}

                  <span className="rounded-full bg-[#2f7f86]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#2f7f86]">
                    ID: {toPersianNumber(item.numericId)}
                  </span>
                </div>

                <div className="mt-1 text-[12px] font-bold text-slate-400">
                  {hasChildren
                    ? `${toPersianNumber(item.children.length)} زیرمجموعه`
                    : "بدون زیرمجموعه"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => openCreateChildModal(item)}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 px-3 py-2.5 text-[11px] font-black text-emerald-700 transition hover:bg-emerald-100 sm:text-xs"
              >
                <FaPlus />
                <span className="hidden sm:inline">زیرمجموعه</span>
                <span className="sm:hidden">افزودن</span>
              </button>

              <button
                type="button"
                onClick={() => openEditModal(item)}
                disabled={!item.guid}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-50 px-3 py-2.5 text-[11px] font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
              >
                <FaEdit />
                ویرایش
              </button>

              <button
                type="button"
                onClick={() => requestDelete(item)}
                disabled={!item.guid || isDeleting}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-rose-50 px-3 py-2.5 text-[11px] font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
              >
                <FaTrash />
                {isDeleting ? "حذف..." : "حذف"}
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isOpen ? (
          <div className="relative">
            <div
              className="absolute top-0 h-full w-px bg-slate-200"
              style={{ right: indent + 18 }}
            />

            <div>
              {item.children.map((child) => renderItem(child, depth + 1))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]" dir="rtl">
      <div className="fixed bottom-0 right-0 top-0 z-40 hidden xl:block" dir="rtl">
        <Sidebar />
      </div>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-[9990] xl:hidden" dir="rtl">
          <button
            type="button"
            aria-label="بستن منو"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
          />

          <div className="absolute bottom-0 right-0 top-0">
            <Sidebar
              variant="mobile"
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <main className="min-h-screen transition-all xl:pr-[292px]" dir="rtl">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <div className="px-3 pb-5 pt-4 sm:px-5 md:px-6 xl:px-8 xl:pb-8">
          <div className="mx-auto w-full max-w-[2100px] space-y-5">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-l from-[#163647] to-[#2f7f86] p-5 text-white shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-xl font-black sm:text-2xl">
                    مدیریت سلسله مراتب
                  </h1>

                  <p className="mt-2 text-xs font-bold leading-6 text-white/70 sm:text-sm">
                    مدیریت دسته‌بندی‌ها، آیتم‌های اصلی و زیرمجموعه‌های سازمانی
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateRootModal}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#163647] shadow-lg transition hover:bg-slate-50 sm:w-fit"
                >
                  <FaPlus />
                  افزودن آیتم اصلی
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                title="تعداد کل"
                value={totalItems || flatItems.length}
                icon={<FaSitemap />}
              />

              <StatCard
                title="آیتم‌های اصلی"
                value={hierarchyData.length}
                icon={<FaFolder />}
              />

              <StatCard
                title="نتیجه قابل نمایش"
                value={visibleFlat.length}
                icon={<FaSearch />}
              />
            </div>

            <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="جستجو بر اساس عنوان، کد یا شناسه..."
                    className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-11 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
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

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <button
                    type="button"
                    onClick={openAll}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    باز کردن همه
                  </button>

                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    بستن همه
                  </button>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
                    <FaSitemap />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-slate-900">
                      درخت سلسله مراتب
                    </h2>

                    <p className="mt-1 text-[11px] font-bold text-slate-400">
                      {toPersianNumber(visibleFlat.length)} آیتم قابل نمایش
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-5">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 rounded-3xl bg-slate-50 px-4 py-14 text-center text-sm font-black text-slate-500">
                    <FaSpinner className="animate-spin" />
                    در حال دریافت اطلاعات سلسله مراتب...
                  </div>
                ) : null}

                {!loading && errorMessage ? (
                  <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-8 text-center">
                    <p className="text-sm font-black text-rose-700">
                      {errorMessage}
                    </p>

                    <button
                      type="button"
                      onClick={fetchHierarchy}
                      className="mt-4 rounded-2xl bg-rose-600 px-5 py-3 text-xs font-black text-white transition hover:bg-rose-700"
                    >
                      تلاش مجدد
                    </button>
                  </div>
                ) : null}

                {!loading && !errorMessage && visibleTree.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-400 shadow-sm">
                      <FaSitemap size={24} />
                    </div>

                    <p className="mt-4 text-sm font-black text-slate-500">
                      {searchQuery
                        ? "نتیجه‌ای برای جستجو یافت نشد."
                        : "اطلاعاتی برای نمایش وجود ندارد."}
                    </p>
                  </div>
                ) : null}

                {!loading && !errorMessage && visibleTree.length > 0 ? (
                  <div className="space-y-1">
                    {visibleTree.map((item) => renderItem(item))}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>

      {modal.open ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92dvh] w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl" dir="rtl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-l from-[#163647] to-[#2f7f86] px-5 py-5 text-white sm:px-6">
              <div>
                <h2 className="text-lg font-black sm:text-xl">
                  {modal.mode === "edit"
                    ? "ویرایش آیتم"
                    : modal.mode === "create-child"
                      ? "افزودن زیرمجموعه"
                      : "افزودن آیتم اصلی"}
                </h2>

                <p className="mt-1 text-xs font-bold text-white/70">
                  {modal.parent
                    ? `والد: ${modal.parent.title}`
                    : modal.item
                      ? `شناسه: ${toPersianNumber(modal.item.numericId)}`
                      : "ایجاد آیتم در سطح اصلی"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="rounded-2xl bg-white/10 p-3 text-white transition hover:bg-white/20 disabled:opacity-60"
              >
                <FaTimes />
              </button>
            </div>

            <div className="max-h-[calc(92dvh-160px)] overflow-y-auto p-5 sm:p-6">
              {modalError ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">
                  {modalError}
                </div>
              ) : null}

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-black text-slate-600">
                    عنوان
                  </label>

                  <input
                    value={formValues.title}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                    placeholder="مثلاً سازمان فاوا"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-600">
                    کد / Tag
                  </label>

                  <input
                    value={formValues.code}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        code: event.target.value,
                      }))
                    }
                    placeholder="مثلاً FAVA"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black text-slate-600">
                    والد
                  </label>

                  <select
                    value={formValues.parentId ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;

                      setFormValues((prev) => ({
                        ...prev,
                        parentId: value ? Number(value) : null,
                      }));
                    }}
                    disabled={modal.mode === "create-child"}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-[#2f7f86] focus:bg-white focus:ring-4 focus:ring-[#2f7f86]/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">آیتم اصلی</option>

                    {flatItems
                      .filter((item) => item.numericId !== modal.item?.numericId)
                      .map((item) => (
                        <option key={item.id} value={item.numericId}>
                          {item.title} {item.code ? `(${item.code})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                لغو
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2f7f86] px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-[#276b72] disabled:opacity-60"
              >
                {actionLoading ? <FaSpinner className="animate-spin" /> : null}
                {actionLoading ? "در حال ذخیره..." : "ذخیره"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmPopup
        open={!!confirmDeleteItem}
        title="حذف آیتم سلسله مراتب"
        message={
          confirmDeleteItem?.children.length
            ? `آیا از حذف «${confirmDeleteItem.title}» مطمئن هستید؟ این آیتم دارای زیرمجموعه است.`
            : `آیا از حذف «${confirmDeleteItem?.title || ""}» مطمئن هستید؟`
        }
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        loading={!!deleteLoadingId}
        onClose={closeDeletePopup}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}