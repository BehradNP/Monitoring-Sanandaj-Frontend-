import type { ReactNode } from "react";

type Tone = "blue" | "green" | "purple" | "orange";

const toneClasses: Record<Tone, { bg: string; text: string; ring: string; gradient: string }> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-100",
    gradient: "from-blue-500/10 to-blue-50",
  },
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "ring-emerald-100",
    gradient: "from-emerald-500/10 to-emerald-50",
  },
  purple: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    ring: "ring-violet-100",
    gradient: "from-violet-500/10 to-violet-50",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    ring: "ring-orange-100",
    gradient: "from-orange-500/10 to-orange-50",
  },
};

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export default function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  tone: Tone;
}) {
  const t = toneClasses[tone];

  return (
    <div className={`group overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-br ${t.gradient} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80`}>
      <div className="flex items-center justify-between gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${t.bg} ${t.text} ring-1 ${t.ring} text-[19px] transition group-hover:scale-105`}>
          {icon}
        </div>

        <div className="min-w-0 text-left" dir="ltr">
          <span className="block text-3xl font-black leading-none text-slate-900 sm:text-4xl">
            {toPersianNumber(value)}
          </span>
        </div>
      </div>

      <h3 className="mt-4 truncate text-right text-[13px] font-extrabold text-slate-600 sm:text-sm">{title}</h3>
    </div>
  );
}