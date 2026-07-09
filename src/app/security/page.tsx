"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import userService from "@/services/user-service";
import roleService from "@/services/role-service";
import type { SecurityUser as User } from "@/types/user";
import type { RoleOption } from "@/types/role";
import { FaEdit, FaTrash } from "react-icons/fa";

const PAGE_SIZE = 10;
const SEARCH_MIN_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 500;

function normalizeText(value: unknown) {
  return String(value ?? "").replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
}

function getSearchLength(value: string) {
  return normalizeText(value).replace(/\s+/g, "").length;
}

function splitFullName(fullName: string) {
  const cleanFullName = fullName.trim().replace(/\s+/g, " ");
  const parts = cleanFullName.split(" ").filter(Boolean);

  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function SecurityPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<number | null>(null);

  const searchLength = getSearchLength(searchQuery);
  const debouncedSearchLength = getSearchLength(debouncedSearch);
  const hasShortSearch = searchLength > 0 && searchLength < SEARCH_MIN_LENGTH;
  const activeSearch = debouncedSearchLength >= SEARCH_MIN_LENGTH ? normalizeText(debouncedSearch) : "";
  const totalPages = Math.max(Math.ceil(totalUsers / PAGE_SIZE), 1);

  const fromRow = totalUsers === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(page * PAGE_SIZE, totalUsers);

  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const result = await roleService.getRoles();
      setRoles(result);
    } catch (error) {
      console.log("ROLE LIST ERROR:", error);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (targetPage = 1, showLoading = false, search = "", currentRoles: RoleOption[] = roles) => {
    try {
      if (showLoading) setLoading(true);

      setErrorMessage("");

      const result = await userService.getUsers(targetPage, PAGE_SIZE, search, currentRoles);

      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (error) {
      console.log("USER LIST ERROR:", error);
      setUsers([]);
      setTotalUsers(0);
      setErrorMessage(search ? "خطا در جستجوی کاربران" : "خطا در دریافت اطلاعات کاربران");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [roles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (rolesLoading) return;
    if (hasShortSearch) return;

    fetchUsers(page, true, activeSearch, roles);
  }, [page, activeSearch, hasShortSearch, fetchUsers, rolesLoading, roles]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditUser(null);
    setModalError("");
  };

  const handleAddUser = () => {
    setEditUser(null);
    setModalError("");
    setShowModal(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handleEdit = async (user: User) => {
    setModalError("");
    setEditLoadingId(user.id);

    try {
      setEditUser(user);
      setShowModal(true);
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleSaveUser = async (user: User) => {
    try {
      setSaving(true);
      setModalError("");

      if (editUser?.guid) {
        await userService.editUser({
          ...editUser,
          ...user,
          id: editUser.id,
          guid: editUser.guid,
          passwordHash: user.password || editUser.passwordHash,
        });

        await fetchUsers(page, true, activeSearch, roles);
      } else {
        await userService.createUser(user);

        if (page !== 1) {
          setPage(1);
        } else {
          await fetchUsers(1, true, activeSearch, roles);
        }
      }

      setShowModal(false);
      setEditUser(null);
    } catch (error) {
      console.log("USER SAVE ERROR:", error);
      setModalError("خطا در ذخیره اطلاعات کاربر");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!user.guid) {
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      return;
    }

    const accepted = window.confirm(`آیا از حذف «${user.fullName}» مطمئن هستید؟`);

    if (!accepted) return;

    try {
      setDeleteLoadingId(user.id);
      setErrorMessage("");

      await userService.deleteUser(user.guid);

      const targetPage = users.length === 1 && page > 1 ? page - 1 : page;

      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        await fetchUsers(targetPage, true, activeSearch, roles);
      }
    } catch (error) {
      console.log("USER DELETE ERROR:", error);
      setErrorMessage("خطا در حذف کاربر");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const goToPrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const searchStatusText = useMemo(() => {
    if (hasShortSearch) return `برای جستجو حداقل ${SEARCH_MIN_LENGTH} حرف وارد کنید.`;
    if (activeSearch) return `نتیجه جستجو برای «${activeSearch}»`;
    return "";
  }, [activeSearch, hasShortSearch]);

  return (
    <div className="bg-slate-100 flex min-h-screen" dir="rtl">
      <Sidebar />

      <main className="flex-1 flex flex-col z-0">
        <Header />

        <div className="p-6 bg-slate-100 flex-1">
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">مدیریت کاربران</h1>
                <p className="text-slate-500 text-sm mt-1">مدیریت کاربران، ادمین‌ها و سطوح دسترسی</p>
              </div>

              <button onClick={handleAddUser} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
                افزودن کاربر
              </button>
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <div className="relative w-full sm:max-w-md">
                <input value={searchQuery} onChange={(event) => handleSearchChange(event.target.value)} type="text" placeholder="حداقل ۳ حرف برای جستجو وارد کنید..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100" />

                {searchQuery && (
                  <button type="button" onClick={handleClearSearch} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-200">
                    ✕
                  </button>
                )}
              </div>

              {searchStatusText && <div className={["text-xs font-bold", hasShortSearch ? "text-amber-600" : "text-slate-500"].join(" ")}>{searchStatusText}</div>}
            </div>

            {errorMessage && users.length > 0 && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow overflow-hidden">
              {(loading || rolesLoading) && users.length === 0 && <div className="py-10 text-center text-sm font-bold text-slate-500">در حال دریافت اطلاعات کاربران...</div>}

              {!loading && !rolesLoading && errorMessage && users.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-bold text-rose-700">{errorMessage}</p>

                  <button type="button" onClick={() => fetchUsers(page, true, activeSearch, roles)} className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700">
                    تلاش مجدد
                  </button>
                </div>
              )}

              {!loading && !rolesLoading && !errorMessage && users.length === 0 && <div className="py-10 text-center text-sm font-bold text-slate-500">{activeSearch ? "نتیجه‌ای برای جستجو یافت نشد." : "اطلاعاتی برای نمایش وجود ندارد."}</div>}

              {users.length > 0 && (
                <>
                  <table className="w-full text-sm text-center text-slate-700">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="p-3 font-bold">ردیف</th>
                        <th className="p-3 font-bold">نام و نام خانوادگی</th>
                        <th className="p-3 font-bold">نام کاربری</th>
                        <th className="p-3 font-bold">سمت</th>
                        <th className="p-3 font-bold">سازمان</th>
                        <th className="p-3 font-bold">سطوح دسترسی</th>
                        <th className="p-3 font-bold">عملیات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.guid || user.id} className="border-t border-slate-200 hover:bg-slate-50 transition">
                          <td className="p-3">{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="p-3 font-semibold">{user.fullName}</td>
                          <td className="p-3">{user.username}</td>
                          <td className="p-3">{user.post}</td>
                          <td className="p-3">{user.organizationTitle}</td>
                          <td className="p-3 text-right">{user.roleTitles.length > 0 ? user.roleTitles.join(", ") : user.roleIds.length > 0 ? user.roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.title || roleId).join(", ") : "-"}</td>

                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEdit(user)} disabled={editLoadingId === user.id} className={["p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200", editLoadingId === user.id ? "opacity-60 cursor-not-allowed" : ""].join(" ")}>
                                <FaEdit />
                              </button>

                              <button onClick={() => handleDelete(user)} disabled={deleteLoadingId === user.id} className={["p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200", deleteLoadingId === user.id ? "opacity-60 cursor-not-allowed" : ""].join(" ")}>
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-medium text-slate-600">نمایش {fromRow} تا {toRow} از {totalUsers} مورد</div>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={goToPrevPage} disabled={page === 1} className={["rounded-lg border px-3 py-2 text-xs font-bold transition", page === 1 ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"].join(" ")}>
                        قبلی
                      </button>

                      <span className="rounded-lg bg-[#163647] px-3 py-2 text-xs font-bold text-white">صفحه {page} از {totalPages}</span>

                      <button type="button" onClick={goToNextPage} disabled={page === totalPages} className={["rounded-lg border px-3 py-2 text-xs font-bold transition", page === totalPages ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"].join(" ")}>
                        بعدی
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {showModal &&
        createPortal(
          <UserModal editUser={editUser} roles={roles} rolesLoading={rolesLoading} saving={saving} modalError={modalError} onClose={closeModal} onSave={handleSaveUser} setModalError={setModalError} />,
          document.body
        )}
    </div>
  );
}

function UserModal({ editUser, roles, rolesLoading, saving, modalError, onClose, onSave, setModalError }: { editUser: User | null; roles: RoleOption[]; rolesLoading: boolean; saving: boolean; modalError: string; onClose: () => void; onSave: (user: User) => void; setModalError: (message: string) => void }) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>(editUser?.roleIds ?? []);

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) => (prev.includes(roleId) ? prev.filter((item) => item !== roleId) : [...prev, roleId]));
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6">{editUser ? "ویرایش کاربر" : "افزودن کاربر"}</h2>

        {modalError && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{modalError}</div>}

        <form
          onSubmit={(event) => {
            event.preventDefault();

            const form = event.target as HTMLFormElement;
            const formData = new FormData(form);

            const fullName = String(formData.get("fullName") || "").trim();
            const username = String(formData.get("username") || "").trim();
            const password = String(formData.get("password") || "").trim();
            const post = String(formData.get("post") || "").trim();
            const organizationTitle = String(formData.get("organizationTitle") || "").trim();

            if (!fullName) {
              setModalError("نام و نام خانوادگی را وارد کنید.");
              return;
            }

            if (!username) {
              setModalError("نام کاربری را وارد کنید.");
              return;
            }

            if (!editUser && !password) {
              setModalError("رمز عبور را وارد کنید.");
              return;
            }

            if (selectedRoleIds.length === 0) {
              setModalError("حداقل یک سطح دسترسی را انتخاب کنید.");
              return;
            }

            const { firstName, lastName } = splitFullName(fullName);

            onSave({
              id: editUser?.id || 0,
              guid: editUser?.guid || "",
              firstName,
              lastName,
              fullName,
              username,
              password,
              passwordHash: editUser?.passwordHash || "",
              post: post || "-",
              organizationId: editUser?.organizationId || 0,
              organizationTitle: organizationTitle || "-",
              imageUrl: editUser?.imageUrl || "",
              roleIds: selectedRoleIds,
              roleTitles: selectedRoleIds.map((roleId) => roles.find((role) => role.id === roleId)?.title).filter(Boolean) as string[],
            });
          }}
          className="flex flex-col gap-4"
        >
          <input name="fullName" type="text" placeholder="نام و نام خانوادگی" defaultValue={editUser?.fullName === "-" ? "" : editUser?.fullName} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400" />

          <input name="username" type="text" placeholder="نام کاربری / شماره موبایل" defaultValue={editUser?.username === "-" ? "" : editUser?.username} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400" />

          <input name="password" type="password" placeholder={editUser ? "رمز عبور جدید، اختیاری" : "رمز عبور"} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400" />

          <input name="post" type="text" placeholder="سمت" defaultValue={editUser?.post === "-" ? "" : editUser?.post} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400" />

          <input name="organizationTitle" type="text" placeholder="سازمان" defaultValue={editUser?.organizationTitle === "-" ? "" : editUser?.organizationTitle} className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400" />

          <div>
            <span className="font-semibold mb-2 block">سطوح دسترسی</span>

            {rolesLoading && <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500">در حال دریافت نقش‌ها...</div>}

            {!rolesLoading && roles.length === 0 && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">نقشی برای نمایش وجود ندارد.</div>}

            {!rolesLoading && roles.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
                    <input type="checkbox" checked={selectedRoleIds.includes(role.id)} onChange={() => toggleRole(role.id)} className="w-5 h-5 accent-teal-400" />
                    <span className="font-medium">{role.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition disabled:opacity-60">
              لغو
            </button>

            <button type="submit" disabled={saving || rolesLoading} className="px-5 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60">
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}