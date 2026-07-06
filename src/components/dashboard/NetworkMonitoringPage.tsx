"use client";

import { useCallback, useEffect, useState } from "react";
import { FaMapMarkedAlt, FaListUl } from "react-icons/fa";
import MapComponent from "./MapComponent";
import LocationsTable from "./LocationsTable";
import networkMonitoringService from "@/services/network-monitoring-service";
import type { NetworkLocation } from "@/types/network-monitoring";

export default function NetworkMonitoringPage() {
  const [tab, setTab] = useState<"map" | "locations">("map");
  const [locations, setLocations] = useState<NetworkLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchLocations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      setErrorMessage("");

      const data = await networkMonitoringService.getLocations();

      setLocations(data);
    } catch (error) {
      console.log("NETWORK MONITORING ERROR:", error);
      setErrorMessage("خطا در دریافت اطلاعات مانیتورینگ شبکه");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations(true);

    const intervalId = window.setInterval(() => {
      fetchLocations(false);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchLocations]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        <TabButton active={tab === "map"} onClick={() => setTab("map")}>
          <span className="flex items-center gap-2">
            <FaMapMarkedAlt />
            نقشه شبکه
          </span>
        </TabButton>

        <TabButton active={tab === "locations"} onClick={() => setTab("locations")}>
          <span className="flex items-center gap-2">
            <FaListUl />
            لیست لوکیشن‌ها
          </span>
        </TabButton>
      </div>

      {tab === "map" && (
        <div className="bg-white border border-gray-100 rounded-xl shadow p-4">
          {loading && locations.length === 0 && (
            <div className="flex h-[500px] items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-slate-500">
              در حال دریافت اطلاعات نقشه...
            </div>
          )}

          {!loading && errorMessage && locations.length === 0 && (
            <ErrorBox message={errorMessage} onRetry={() => fetchLocations(true)} />
          )}

          {locations.length > 0 && <MapComponent locations={locations} />}
        </div>
      )}

      {tab === "locations" && (
        <div className="bg-white border border-gray-100 rounded-xl shadow p-4">
          <LocationsTable
            locations={locations}
            loading={loading}
            errorMessage={errorMessage}
            onRetry={() => fetchLocations(true)}
          />
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
        active ? "border-b-2 border-teal-600 text-teal-700" : "text-gray-500 hover:text-gray-700",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-[500px] flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-center">
      <p className="text-sm font-bold text-rose-700">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
      >
        تلاش مجدد
      </button>
    </div>
  );
}