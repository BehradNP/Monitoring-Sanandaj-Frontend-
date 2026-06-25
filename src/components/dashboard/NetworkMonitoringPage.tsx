"use client";

import { useState } from "react";
import { FaMapMarkedAlt, FaListUl } from "react-icons/fa";
import MapComponent from "./MapComponent";
import LocationsTable from "./LocationsTable";

export default function NetworkMonitoringPage() {
  const [tab, setTab] = useState<"map" | "locations">("map");

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">

        <TabButton
          active={tab === "map"}
          onClick={() => setTab("map")}
        >
          <span className="flex items-center gap-2">
            <FaMapMarkedAlt />
            نقشه شبکه
          </span>
        </TabButton>

        <TabButton
          active={tab === "locations"}
          onClick={() => setTab("locations")}
        >
          <span className="flex items-center gap-2">
            <FaListUl />
            لیست لوکیشن‌ها
          </span>
        </TabButton>

      </div>

      {/* Content */}

      {tab === "map" && (
        <div className="bg-white border border-gray-100 rounded-xl shadow p-4">
          <MapComponent />
        </div>
      )}

      {tab === "locations" && (
        <div className="bg-white border border-gray-100 rounded-xl shadow p-4">
          <LocationsTable />
        </div>
      )}

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
      className={[
        "px-4 py-2 text-sm font-bold transition",
        active
          ? "border-b-2 border-teal-600 text-teal-700"
          : "text-gray-500 hover:text-gray-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
