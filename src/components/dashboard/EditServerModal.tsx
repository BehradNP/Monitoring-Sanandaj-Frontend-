"use client";

import { useState, useEffect } from "react";
import { Server } from "./ServersTable";

export default function EditServerModal({
  server,
  open,
  onClose,
  onSave,
}: {
  server: Server | null;
  open: boolean;
  onClose: () => void;
  onSave: (server: Server) => void;
}) {
  const [form, setForm] = useState<Server | null>(server);

  useEffect(() => {
    setForm(server);
  }, [server]);

  if (!open || !form) return null;

  const updateField = (key: keyof Server, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">

        <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-800">
          ویرایش رکورد
        </h2>

        <div className="space-y-3 ">

          <input
            className={inputClass}
            placeholder="عنوان"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <input
            className={inputClass}
            placeholder="IP"
            value={form.ip}
            onChange={(e) => updateField("ip", e.target.value)}
          />

          <input
            className={inputClass}
            placeholder="UserName"
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
          />

          <input
            className={inputClass}
            placeholder="ترتیب"
            type="number"
            value={form.order}
            onChange={(e) =>
              updateField("order", Number(e.target.value))
            }
          />

          <input
            className={inputClass}
            placeholder="زمان گرفتن اطلاعات (ثانیه)"
            type="number"
            value={form.interval}
            onChange={(e) =>
              updateField("interval", Number(e.target.value))
            }
          />

        </div>

        <div className="mt-5 flex justify-end gap-2">

          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            لغو
          </button>

          <button
            onClick={() => onSave(form)}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            ثبت
          </button>

        </div>

      </div>
    </div>
  );
}
