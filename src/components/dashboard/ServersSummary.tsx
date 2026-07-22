import type { Server } from "./ServersTable";

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export default function ServersSummary({ servers }: { servers: Server[] }) {
  const online = servers.filter((server) => server.status === "online").length;
  const offline = servers.filter((server) => server.status === "offline").length;

  const avgCpu = servers.reduce((acc, server) => acc + (Number(server.cpu) || 0), 0) / (servers.length || 1);
  const avgRam = servers.reduce((acc, server) => acc + (Number(server.ram) || 0), 0) / (servers.length || 1);

  const cards = [
    {
      title: "سرور آنلاین",
      value: online,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "سرور آفلاین",
      value: offline,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "میانگین CPU",
      value: `${avgCpu.toFixed(0)}%`,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "میانگین RAM",
      value: `${avgRam.toFixed(0)}%`,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/80">
          <div className="text-sm font-extrabold text-slate-400">{card.title}</div>

          <div className={`mt-3 inline-flex rounded-2xl ${card.bg} px-4 py-2 text-3xl font-black ${card.color}`}>
            {toPersianNumber(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}