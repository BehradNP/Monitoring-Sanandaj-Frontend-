"use client";

import { FaEdit, FaTrash } from "react-icons/fa";

export type Role = "مدیر" | "مانیتورینگ" | "گزارش گیری" | "نمایش ساده";

export interface User {
  id: number;
  fullName: string;
  username: string;
  nationalId: string;
  position: string;
  roles: Role[];
}

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
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
              <td className="p-3">{user.roles.join(", ")}</td>
              <td className="p-3 flex justify-center gap-2">
                <button onClick={() => onEdit(user)} className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"><FaEdit /></button>
                <button onClick={() => onDelete(user.id)} className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}