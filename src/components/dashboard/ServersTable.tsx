"use client";

import { FaEdit, FaTrash } from "react-icons/fa";

export type Server = {
  id: number;
  title: string;
  name?: string;
  ip: string;
  username: string;
  order: number;
  interval: number;
  status: "online" | "offline";
  cpu: number;
  ram: number;
  disk: number;
};

export default function ServersTable({
  servers,
  onEdit,
  onDelete,
}: {
  servers: Server[];
  onEdit: (server: Server) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow overflow-hidden">
      <table className="w-full text-sm text-center text-slate-700">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="p-3 font-bold">ردیف</th>
            <th className="p-3 font-bold">عنوان</th>
            <th className="p-3 font-bold">IP</th>
            <th className="p-3 font-bold">UserName</th>
            <th className="p-3 font-bold">ترتیب</th>
            <th className="p-3 font-bold">زمان گرفتن اطلاعات (ثانیه)</th>
            <th className="p-3 font-bold">وضعیت</th>
            <th className="p-3 font-bold">عملیات</th>
          </tr>
        </thead>

        <tbody>
          {servers.map((server, index) => (
            <tr
              key={server.id}
              className="border-t border-slate-200 hover:bg-slate-50 transition"
            >
              <td className="p-3">{index + 1}</td>
              <td className="p-3 font-semibold">{server.title}</td>
              <td className="p-3">{server.ip}</td>
              <td className="p-3">{server.username}</td>
              <td className="p-3">{server.order}</td>
              <td className="p-3">{server.interval}</td>

              <td className="p-3">
                <span
                  className={[
                    "rounded px-2 py-1 text-xs font-bold",
                    server.status === "online"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700",
                  ].join(" ")}
                >
                  {server.status === "online" ? "آنلاین" : "آفلاین"}
                </span>
              </td>

              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(server)}
                    className="p-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => onDelete(server.id)}
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
  );
}