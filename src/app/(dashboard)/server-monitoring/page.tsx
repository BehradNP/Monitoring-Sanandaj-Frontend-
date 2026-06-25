"use client";

import { useState } from "react";
import ServersTable from "@/components/dashboard/ServersTable";
import ServersDashboard from "@/components/dashboard/ServersDashboard";
import EditServerModal from "@/components/dashboard/EditServerModal";

type Server = {
  id: number;
  title: string;
  ip: string;
  username: string;
  order: number;
  interval: number;
  status: "online" | "offline";
  cpu: number;
  ram: number;
  disk: number;
};

export default function ServerMonitoringPage() {
  const [tab, setTab] = useState<"dashboard" | "list">("dashboard");
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const servers: Server[] = [
    {
      id: 1,
      title: "Server-1",
      ip: "192.168.1.10",
      username: "root",
      order: 1,
      interval: 30,
      status: "online",
      cpu: 35,
      ram: 40,
      disk: 60,
    },
    {
      id: 2,
      title: "Server-2",
      ip: "192.168.1.11",
      username: "root",
      order: 2,
      interval: 30,
      status: "online",
      cpu: 75,
      ram: 68,
      disk: 52,
    },
    {
      id: 3,
      title: "Server-3",
      ip: "192.168.1.12",
      username: "admin",
      order: 3,
      interval: 60,
      status: "offline",
      cpu: 0,
      ram: 0,
      disk: 10,
    },
    {
      id: 4,
      title: "Server-4",
      ip: "192.168.1.13",
      username: "admin",
      order: 4,
      interval: 60,
      status: "offline",
      cpu: 0,
      ram: 0,
      disk: 70,
    },
  ];

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

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <TabButton
          active={tab === "dashboard"}
          onClick={() => setTab("dashboard")}
        >
          داشبورد
        </TabButton>

        <TabButton
          active={tab === "list"}
          onClick={() => setTab("list")}
        >
          لیست سرورها
        </TabButton>
      </div>

      {/* Dashboard */}
      {tab === "dashboard" && (
        <ServersDashboard servers={servers} />
      )}

      {/* Table */}
      {tab === "list" && (
        <ServersTable
          servers={servers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
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
