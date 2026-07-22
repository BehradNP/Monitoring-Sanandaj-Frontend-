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

type ServersTableProps = {
  servers?: Server[];
  onEdit?: (server: Server) => void;
  onDelete?: (id: number) => void;
};

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export default function ServersTable({
  servers = [],
  onEdit,
  onDelete,
}: ServersTableProps) {
  const safeServers = Array.isArray(servers) ? servers : [];

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto p-4">
        <table className="min-w-[900px] w-full text-center text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="rounded-r-2xl px-4 py-4 font-extrabold">ردیف</th>
              <th className="px-4 py-4 font-extrabold">عنوان</th>
              <th className="px-4 py-4 font-extrabold">IP</th>
              <th className="px-4 py-4 font-extrabold">UserName</th>
              <th className="px-4 py-4 font-extrabold">ترتیب</th>
              <th className="px-4 py-4 font-extrabold">زمان دریافت</th>
              <th className="px-4 py-4 font-extrabold">وضعیت</th>
              <th className="rounded-l-2xl px-4 py-4 font-extrabold">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {safeServers.map((server, index) => (
              <tr
                key={server.id || `${server.ip}-${index}`}
                className="border-b border-slate-100 transition last:border-b-0 hover:bg-[#2f7f86]/5"
              >
                <td className="px-4 py-4 font-bold text-slate-500">
                  {toPersianNumber(index + 1)}
                </td>

                <td className="px-4 py-4 font-extrabold text-slate-900">
                  {server.title || server.name || "-"}
                </td>

                <td className="px-4 py-4 font-mono text-slate-700">
                  {server.ip || "-"}
                </td>

                <td className="px-4 py-4 text-slate-700">
                  {server.username || "-"}
                </td>

                <td className="px-4 py-4 font-bold text-slate-700">
                  {toPersianNumber(server.order ?? "-")}
                </td>

                <td className="px-4 py-4 font-bold text-slate-700">
                  {toPersianNumber(server.interval ?? "-")} ثانیه
                </td>

                <td className="px-4 py-4">
                  <span
                    className={[
                      "inline-flex min-w-[78px] items-center justify-center rounded-full px-3 py-1.5 text-xs font-extrabold",
                      server.status === "online"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700",
                    ].join(" ")}
                  >
                    {server.status === "online" ? "آنلاین" : "آفلاین"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit?.(server)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      title="ویرایش"
                      disabled={!onEdit}
                    >
                      <FaEdit />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.(server.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      title="حذف"
                      disabled={!onDelete}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {safeServers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm font-extrabold text-slate-400"
                >
                  اطلاعاتی برای نمایش وجود ندارد.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}