//src/components/dashboard/StatCard.tsx
import { ReactNode } from "react";

type Tone = "blue" | "green" | "purple" | "orange";

const toneClasses: Record<Tone, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  purple: { bg: "bg-purple-100", text: "text-purple-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600" },
};

export default function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: Tone;
}) {
  const t = toneClasses[tone];

  return (
    <div
      className="
        bg-white rounded-2xl border border-gray-100
        px-5 py-4
        shadow-sm
        text-right
        transition
        hover:-translate-y-[2px] hover:shadow-md
      "
    >
      <div className="flex items-center justify-between">
        <div
          className={`
            w-10 h-10 ${t.bg} ${t.text}
            rounded-xl flex items-center justify-center
            text-[18px]
          `}
        >
          {icon}
        </div>

        <span className="text-3xl font-extrabold text-gray-900 leading-none">
          {value}
        </span>
      </div>

      <h3 className="mt-2 font-semibold text-[13px] text-gray-600">
        {title}
      </h3>
    </div>
  );
}
