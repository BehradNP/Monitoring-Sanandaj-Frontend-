"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import personalService from "@/services/personal-service";
import type { Role, SecurityUser as User } from "@/types/personal";
import { FaEdit, FaTrash } from "react-icons/fa";

const PAGE_SIZE = 10;
const ALL_ROLES: Role[] = ["مدیر", "مانیتورینگ", "گزارش گیری", "نمایش ساده"];

export default function SecurityPage() {
  const [users, setUsers] = useState<User[]>([]);
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

  const totalPages = Math.max(Math.ceil(totalUsers / PAGE_SIZE), 1);

  const fetchUsers = useCallback(async (targetPage = 1, showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      setErrorMessage("");

      const result = await personalService.getUsers(targetPage, PAGE_SIZE);

      setUsers(result.users);
      setTotalUsers(result.total);
    } catch (error) {
      console.log("PERSONAL LIST ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات کاربران");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, true);
  }, [page, fetchUsers]);

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

  const handleEdit = async (user: User) => {
    try {
      setModalError("");
      setEditLoadingId(user.id);

      if (!user.guid) {
        setEditUser(user);
        setShowModal(true);
        return;
      }

      const freshUser = await personalService.getUserByGuid(user.guid);

      setEditUser(
        freshUser
          ? {
              ...user,
              id: freshUser.id || user.id,
              guid: freshUser.guid || user.guid,
              fullName: freshUser.fullName || user.fullName,
              username: freshUser.username || user.username,
            }
          : user
      );

      setShowModal(true);
    } catch (error) {
      console.log("PERSONAL GET ERROR:", error);
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
        await personalService.editUser({
          ...editUser,
          ...user,
          id: editUser.id,
          guid: editUser.guid,
        });

        await fetchUsers(page, true);
      } else {
        await personalService.createUser(user);

        if (page !== 1) {
          setPage(1);
        } else {
          await fetchUsers(1, true);
        }
      }

      setShowModal(false);
      setEditUser(null);
    } catch (error) {
      console.log("PERSONAL SAVE ERROR:", error);
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

      await personalService.deleteUser(user.guid);

      const targetPage = users.length === 1 && page > 1 ? page - 1 : page;

      if (targetPage !== page) {
        setPage(targetPage);
      } else {
        await fetchUsers(targetPage, true);
      }
    } catch (error) {
      console.log("PERSONAL DELETE ERROR:", error);
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

  return (
    <div className="bg-slate-100 flex min-h-screen" dir="rtl">
      <Sidebar className="z-40" />

      <main className="flex-1 flex flex-col z-0">
        <Header />

        <div className="p-6 bg-slate-100 flex-1">
          <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">مدیریت کاربران</h1>
                <p className="text-slate-500 text-sm mt-1">
                  مدیریت کاربران، ادمین‌ها و سطوح دسترسی
                </p>
              </div>

              <button
                onClick={handleAddUser}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
              >
                افزودن کاربر
              </button>
            </div>

            {errorMessage && users.length > 0 && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl shadow overflow-hidden">
              {loading && users.length === 0 && (
                <div className="py-10 text-center text-sm font-bold text-slate-500">
                  در حال دریافت اطلاعات کاربران...
                </div>
              )}

              {!loading && errorMessage && users.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-bold text-rose-700">{errorMessage}</p>

                  <button
                    type="button"
                    onClick={() => fetchUsers(page, true)}
                    className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
                  >
                    تلاش مجدد
                  </button>
                </div>
              )}

              {!loading && !errorMessage && users.length === 0 && (
                <div className="py-10 text-center text-sm font-bold text-slate-500">
                  اطلاعاتی برای نمایش وجود ندارد.
                </div>
              )}

              {users.length > 0 && (
                <>
                  <table className="w-full text-sm text-center text-slate-700">
                    <thead className="bg-slate-100 text-slate-700">
                      <tr>
                        <th className="p-3 font-bold">ردیف</th>
                        <th className="p-3 font-bold">نام و نام خانوادگی</th>
                        <th className="p-3 font-bold">نام کاربری</th>
                        <th className="p-3 font-bold">کد ملی</th>
                        <th className="p-3 font-bold">سمت</th>
                        <th className="p-3 font-bold">سطوح دسترسی</th>
                        <th className="p-3 font-bold">عملیات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user, index) => (
                        <tr
                          key={user.guid || user.id}
                          className="border-t border-slate-200 hover:bg-slate-50 transition"
                        >
                          <td className="p-3">{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="p-3 font-semibold">{user.fullName}</td>
                          <td className="p-3">{user.username}</td>
                          <td className="p-3">{user.nationalId}</td>
                          <td className="p-3">{user.position}</td>
                          <td className="p-3 text-right">
                            {user.roles.length > 0 ? user.roles.join(", ") : "-"}
                          </td>

                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                disabled={editLoadingId === user.id}
                                className={[
                                  "p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200",
                                  editLoadingId === user.id ? "opacity-60 cursor-not-allowed" : "",
                                ].join(" ")}
                              >
                                <FaEdit />
                              </button>

                              <button
                                onClick={() => handleDelete(user)}
                                disabled={deleteLoadingId === user.id}
                                className={[
                                  "p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200",
                                  deleteLoadingId === user.id ? "opacity-60 cursor-not-allowed" : "",
                                ].join(" ")}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-medium text-slate-600">
                      نمایش {(page - 1) * PAGE_SIZE + 1} تا{" "}
                      {Math.min(page * PAGE_SIZE, totalUsers)} از {totalUsers} مورد
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={goToPrevPage}
                        disabled={page === 1}
                        className={[
                          "rounded-lg border px-3 py-2 text-xs font-bold transition",
                          page === 1
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        قبلی
                      </button>

                      <span className="rounded-lg bg-[#163647] px-3 py-2 text-xs font-bold text-white">
                        صفحه {page} از {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={goToNextPage}
                        disabled={page === totalPages}
                        className={[
                          "rounded-lg border px-3 py-2 text-xs font-bold transition",
                          page === totalPages
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
          </div>
        </div>
      </main>

      {showModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editUser ? "ویرایش کاربر" : "افزودن کاربر"}
              </h2>

              {modalError && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {modalError}
                </div>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  const form = event.target as HTMLFormElement;
                  const formData = new FormData(form);

                  const fullName = String(formData.get("fullName") || "").trim();
                  const username = String(formData.get("username") || "").trim();
                  const nationalId = String(formData.get("nationalId") || "").trim();
                  const password = String(formData.get("password") || "").trim();
                  const position = String(formData.get("position") || "").trim();

                  if (!fullName) {
                    setModalError("نام و نام خانوادگی را وارد کنید.");
                    return;
                  }

                  if (!username && !nationalId) {
                    setModalError("کد یا کد ملی را وارد کنید.");
                    return;
                  }

                  handleSaveUser({
                    id: editUser?.id || 0,
                    guid: editUser?.guid,
                    fullName,
                    username: username || nationalId,
                    nationalId: nationalId || username,
                    password,
                    position: position || "-",
                    roles: ALL_ROLES.filter((role) => formData.get(role)),
                  });
                }}
                className="flex flex-col gap-4"
              >
                <input
                  name="fullName"
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  defaultValue={editUser?.fullName === "-" ? "" : editUser?.fullName}
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400"
                />

                <input
                  name="username"
                  type="text"
                  placeholder="کد / نام کاربری"
                  defaultValue={editUser?.username === "-" ? "" : editUser?.username}
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400"
                />

                <input
                  name="nationalId"
                  type="text"
                  placeholder="کد ملی"
                  defaultValue={editUser?.nationalId === "-" ? "" : editUser?.nationalId}
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400"
                />

                <input
                  name="password"
                  type="password"
                  placeholder="رمز عبور"
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400"
                />

                <input
                  name="position"
                  type="text"
                  placeholder="سمت"
                  defaultValue={editUser?.position === "-" ? "" : editUser?.position}
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400"
                />

                <div>
                  <span className="font-semibold mb-2 block">سطوح دسترسی</span>

                  <div className="grid grid-cols-2 gap-3">
                    {ALL_ROLES.map((role) => (
                      <label
                        key={role}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name={role}
                          defaultChecked={editUser?.roles.includes(role)}
                          className="w-5 h-5 accent-teal-400"
                        />

                        <span className="font-medium">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition disabled:opacity-60"
                  >
                    لغو
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
                  >
                    {saving ? "در حال ذخیره..." : "ذخیره"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}