type Server = {
  name: string;
  status: "online" | "offline";
  ip: string;
  cpu: number;
  ram: number;
  disk: number;
};

export default function ServersSummary({ servers }: { servers: Server[] }) {
  const online = servers.filter((s) => s.status === "online").length;
  const offline = servers.filter((s) => s.status === "offline").length;

  const avgCpu =
    servers.reduce((acc, s) => acc + s.cpu, 0) / (servers.length || 1);

  const avgRam =
    servers.reduce((acc, s) => acc + s.ram, 0) / (servers.length || 1);

  const cards = [
    {
      title: "سرور آنلاین",
      value: online,
      color: "text-green-600",
    },
    {
      title: "سرور آفلاین",
      value: offline,
      color: "text-red-600",
    },
    {
      title: "میانگین CPU",
      value: `${avgCpu.toFixed(0)}%`,
      color: "text-teal-600",
    },
    {
      title: "میانگین RAM",
      value: `${avgRam.toFixed(0)}%`,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.title}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
        >
          <div className="text-sm font-medium text-slate-500 mb-1">
            {c.title}
          </div>

          <div className={`text-3xl font-bold ${c.color}`}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
