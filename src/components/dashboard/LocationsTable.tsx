"use client";

type Location = {
  id: number;
  title: string;
  gps: string;
};

const mockLocations: Location[] = [
  {
    id: 1,
    title: "سازمان آرمستان‌ها",
    gps: "35.087499 , 47.0395833",
  },
  {
    id: 2,
    title: "کارخانه آسفالت",
    gps: "35.178801 , 46.9875517",
  },
  {
    id: 3,
    title: "معاونت شهرسازی و معماری",
    gps: "35.331549 , 47.0067813",
  },
  {
    id: 4,
    title: "سازمان مدیریت مشاغل شهری",
    gps: "35.259807 , 47.0099155",
  },
];

export default function LocationsTable() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-bold text-slate-700">
          لیست لوکیشن‌های شبکه
        </h3>
      </div>

      <table className="w-full text-sm">

        <thead className="bg-slate-100 text-slate-700">
          <tr>

            <th className="px-6 py-3 text-right font-bold">
              عنوان لوکیشن
            </th>

            <th className="px-6 py-3 text-right font-bold">
              موقعیت (GPS)
            </th>

          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">

          {mockLocations.map((loc) => (
            <tr key={loc.id} className="hover:bg-slate-50 transition">

              {/* Title */}

              <td className="px-6 py-4 font-semibold text-slate-800">
                {loc.title}
              </td>

              {/* GPS */}

              <td className="px-6 py-4 text-slate-600 font-mono">
                {loc.gps}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}
