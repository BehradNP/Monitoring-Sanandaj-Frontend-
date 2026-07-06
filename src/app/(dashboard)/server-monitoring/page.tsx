"use client";

import { useCallback, useEffect, useState } from "react";
import ServersTable, { type Server } from "@/components/dashboard/ServersTable";
import ServersDashboard from "@/components/dashboard/ServersDashboard";
import EditServerModal from "@/components/dashboard/EditServerModal";
import cupServerService from "@/services/cup-server-service";
import type { CupServerInfoItem } from "@/types/cup-server";

const mapCupServerToServer = (item: CupServerInfoItem, index: number): Server => {
  return {
    id: item.id,
    title: item.title,
    name: item.title,
    ip: item.ip,
    username: "-",
    order: index + 1,
    interval: item.timeSc,
    status: item.isOnline ? "online" : "offline",
    cpu: item.avgCup,
    ram: item.avgCRam,
    disk: item.avgHDD,
  };
};

export default function ServerMonitoringPage() {
  const [tab, setTab] = useState<"dashboard" | "list">("dashboard");
  const [servers, setServers] = useState<Server[]>([]);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchServers = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      setErrorMessage("");

      const info = await cupServerService.getInfo();
      const mappedServers = info.lists.map(mapCupServerToServer);

      setServers(mappedServers);
    } catch (error) {
      console.log("SERVER MONITORING ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات مانیتورینگ سرور");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers(true);

    const intervalId = window.setInterval(() => {
      fetchServers(false);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchServers]);

  const handleEdit = (server: Server) => {
    setEditingServer(server);
    setModalOpen(true);
  };

  const handleSave = (updated: Server) => {
    console.log("saved", updated);
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    console.log("delete", id);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200">
        <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
          داشبورد
        </TabButton>

        <TabButton active={tab === "list"} onClick={() => setTab("list")}>
          لیست سرورها
        </TabButton>
      </div>

      {loading && servers.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm font-bold text-slate-500 shadow-sm">
          در حال دریافت اطلاعات سرورها...
        </div>
      )}

      {!loading && errorMessage && servers.length === 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 text-center">
          <p className="text-sm font-bold text-rose-700">{errorMessage}</p>

          <button
            type="button"
            onClick={() => fetchServers(true)}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {!loading && !errorMessage && servers.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white py-10 text-center text-sm font-bold text-slate-500 shadow-sm">
          اطلاعاتی برای نمایش وجود ندارد.
        </div>
      )}

      {servers.length > 0 && (
        <>
          {tab === "dashboard" && <ServersDashboard servers={servers} />}

          {tab === "list" && (
            <ServersTable
              servers={servers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      <EditServerModal
        server={editingServer}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-semibold transition-all duration-200
        border-b-2
        ${
          active
            ? "border-teal-600 text-teal-700"
            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
        }
      `}
    >
      {children}
    </button>
  );
}