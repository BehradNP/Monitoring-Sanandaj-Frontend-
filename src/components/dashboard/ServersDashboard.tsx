import ServersSummary from "./ServersSummary";

type Server = {
  name: string;
  status: "online" | "offline";
  ip: string;
  cpu: number;
  ram: number;
  disk: number;
};

function StatusBadge({ status }: { status: "online" | "offline" }) {
  if (status === "online") {
    return (
      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 font-medium">
        آنلاین
      </span>
    );
  }

  return (
    <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 font-medium">
      آفلاین
    </span>
  );
}

export default function ServersDashboard({ servers }: { servers: Server[] }) {
  return (
    <div className="space-y-6">
      <ServersSummary servers={servers} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {servers.map((s) => (
          <div
            key={s.ip}
            className="bg-white rounded-xl shadow border border-gray-100 p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="text-slate-800 font-semibold flex items-center gap-2">
                🖥 {s.name}
              </div>

              <StatusBadge status={s.status} />
            </div>

            <div className="text-sm text-slate-600 font-mono">{s.ip}</div>

            <Metric label="CPU" value={s.cpu} />
            <Metric label="RAM" value={s.ram} />
            <Metric label="HARD" value={s.disk} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  const safeValue = value ?? 0;

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>

      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-2 rounded bg-teal-500 transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
