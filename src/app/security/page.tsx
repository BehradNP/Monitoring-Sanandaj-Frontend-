"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { FaEdit, FaTrash } from "react-icons/fa";

export type Role = "مدیر" | "مانیتورینگ" | "گزارش گیری" | "نمایش ساده";

export interface User {
  id: number;
  fullName: string;
  username: string;
  nationalId: string;
  password?: string;
  position: string;
  roles: Role[];
}

export default function SecurityPage() {
  const allRoles: Role[] = ["مدیر", "مانیتورینگ", "گزارش گیری", "نمایش ساده"];

  const [users, setUsers] = useState<User[]>([
    { id: 1, fullName: "محمد محمدی", username: "mohammad", nationalId: "1234567890", position: "مدیر", roles: ["مدیر","مانیتورینگ"] },
    { id: 2, fullName: "علی رضایی", username: "ali", nationalId: "0987654321", position: "کاربر", roles: ["گزارش گیری"] },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const handleDelete = (id: number) => setUsers(users.filter(u => u.id !== id));
  const handleEdit = (user: User) => { setEditUser(user); setShowModal(true); };
  const handleAddUser = () => { setEditUser(null); setShowModal(true); };
  const handleSaveUser = (user: User) => {
    if (editUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers([...users, { ...user, id: Date.now() }]);
    }
    setShowModal(false);
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
                <p className="text-slate-500 text-sm mt-1">مدیریت کاربران، ادمین‌ها و سطوح دسترسی</p>
              </div>
              <button
                onClick={handleAddUser}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
              >
                افزودن کاربر
              </button>
            </div>

            {/* جدول کاربران */}
            <div className="bg-white border border-slate-200 rounded-xl shadow overflow-hidden">
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
                    <tr key={user.id} className="border-t border-slate-200 hover:bg-slate-50 transition">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-semibold">{user.fullName}</td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3">{user.nationalId}</td>
                      <td className="p-3">{user.position}</td>
                      <td className="p-3 text-right">{user.roles.join(", ")}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>

      {/* مودال پاپ‌آپ با Portal */}
{showModal && createPortal(
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
      <h2 className="text-2xl font-bold mb-6">{editUser ? "ویرایش کاربر" : "افزودن کاربر"}</h2>

      <form
        onSubmit={e => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          handleSaveUser({
            id: editUser?.id || Date.now(),
            fullName: formData.get("fullName") as string,
            username: formData.get("username") as string,
            nationalId: formData.get("nationalId") as string,
            password: formData.get("password") as string,
            position: formData.get("position") as string,
            roles: allRoles.filter(role => formData.get(role)),
          });
        }}
        className="flex flex-col gap-4"
      >
        {/* Input Fields */}
        {["fullName", "username", "nationalId", "password", "position"].map((field, idx) => (
          <input
            key={idx}
            name={field}
            type={field === "password" ? "password" : "text"}
            placeholder={{
              fullName: "نام و نام خانوادگی",
              username: "نام کاربری (انگلیسی)",
              nationalId: "کد ملی (10 رقم)",
              password: "رمز عبور",
              position: "سمت"
            }[field]}
            defaultValue={editUser?.[field as keyof User] as string | undefined}
            className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm w-full placeholder-gray-400"
            required={field !== "position"}
            pattern={field === "username" ? "[a-zA-Z0-9]+" : field === "nationalId" ? "\\d{10}" : undefined}
          />
        ))}

        {/* Roles */}
<div>
  <span className="font-semibold mb-2 block">سطوح دسترسی</span>
  <div className="grid grid-cols-2 gap-3">
    {allRoles.map(role => (
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

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            لغو
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition"
          >
            ذخیره
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