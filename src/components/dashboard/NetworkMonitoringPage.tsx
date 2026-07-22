"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaBroadcastTower,
  FaCheckCircle,
  FaExclamationCircle,
  FaListUl,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaRedo,
} from "react-icons/fa";
import MapComponent from "./MapComponent";
import LocationsTable from "./LocationsTable";
import networkMonitoringService from "@/services/network-monitoring-service";
import type {
  LocationRouterFormValues,
  LocationRouterItem,
  NetworkLocation,
} from "@/types/network-monitoring";

type TabKey = "map" | "locations";

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold text-slate-400 sm:text-xs">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
            {toPersianNumber(value)}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2f7f86]/10 text-[#2f7f86]">
          {icon}
        </div>
      </div>
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
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition sm:text-sm",
        active
          ? "bg-white text-[#163647] shadow-sm"
          : "bg-white/5 text-white/85 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-rose-200 bg-rose-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-rose-600 shadow-sm">
        <FaExclamationCircle size={24} />
      </div>

      <p className="mt-4 text-sm font-black text-rose-700">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs font-black text-white transition hover:bg-rose-700"
      >
        <FaRedo />
        تلاش مجدد
      </button>
    </div>
  );
}

export default function NetworkMonitoringPage() {
  const [tab, setTab] = useState<TabKey>("map");

  const [locations, setLocations] = useState<NetworkLocation[]>([]);
  const [mapPoints, setMapPoints] = useState<LocationRouterItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [mapPointsLoading, setMapPointsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [mapPointsErrorMessage, setMapPointsErrorMessage] = useState("");

  const onlineCount = useMemo(
    () => locations.filter((item) => item.status === "ONLINE").length,
    [locations]
  );

  const offlineCount = useMemo(
    () => locations.filter((item) => item.status === "OFFLINE").length,
    [locations]
  );

  const validMapPointsCount = useMemo(
    () => mapPoints.filter((item) => item.isValidLocation).length,
    [mapPoints]
  );

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

  const fetchMapPoints = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setMapPointsLoading(true);

      setMapPointsErrorMessage("");

      const data = await networkMonitoringService.getLocationRouters();

      setMapPoints(data.rows);
    } catch (error) {
      console.log("LOCATION ROUTER ERROR:", error);
      setMapPointsErrorMessage("خطا در دریافت لوکیشن‌های نقشه");
    } finally {
      if (showLoading) setMapPointsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations(true);
    fetchMapPoints(true);

    const intervalId = window.setInterval(() => {
      fetchLocations(false);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchLocations, fetchMapPoints]);

  async function handleCreateMapPoint(values: LocationRouterFormValues) {
    await networkMonitoringService.createLocationRouter(values);
    await fetchMapPoints(true);
  }

  async function handleEditMapPoint(
    item: LocationRouterItem,
    values: LocationRouterFormValues
  ) {
    await networkMonitoringService.editLocationRouter(item, values);
    await fetchMapPoints(true);
  }

  async function handleDeleteMapPoint(item: LocationRouterItem) {
    await networkMonitoringService.deleteLocationRouter(item);
    await fetchMapPoints(true);
  }

  return (
    <div className="space-y-5" dir="rtl">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-l from-[#163647] to-[#2f7f86] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-black sm:text-2xl">مانیتورینگ شبکه</h1>

            <p className="mt-2 text-xs font-bold leading-6 text-white/70 sm:text-sm">
              نمایش لینک‌های رادیویی، وضعیت ارتباطات و مدیریت لوکیشن‌های نقشه
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchLocations(true);
              fetchMapPoints(true);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#163647] shadow-lg transition hover:bg-slate-50 sm:w-fit"
          >
            <FaRedo />
            بروزرسانی
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="لینک‌های شبکه"
          value={locations.length}
          icon={<FaBroadcastTower />}
        />
        <StatCard
          title="لینک‌های آنلاین"
          value={onlineCount}
          icon={<FaCheckCircle />}
        />
        <StatCard
          title="لینک‌های آفلاین"
          value={offlineCount}
          icon={<FaExclamationCircle />}
        />
        <StatCard
          title="لوکیشن‌های نقشه"
          value={validMapPointsCount}
          icon={<FaMapMarkerAlt />}
        />
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#163647] p-3">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <TabButton active={tab === "map"} onClick={() => setTab("map")}>
              <FaMapMarkedAlt />
              نقشه شبکه
            </TabButton>

            <TabButton
              active={tab === "locations"}
              onClick={() => setTab("locations")}
            >
              <FaListUl />
              مدیریت لوکیشن‌ها
            </TabButton>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          {tab === "map" ? (
            <>
              {loading && locations.length === 0 && mapPoints.length === 0 ? (
                <div className="flex min-h-[420px] items-center justify-center rounded-[28px] bg-slate-50 text-sm font-black text-slate-500">
                  در حال دریافت اطلاعات نقشه...
                </div>
              ) : null}

              {!loading &&
              errorMessage &&
              locations.length === 0 &&
              mapPoints.length === 0 ? (
                <ErrorBox
                  message={errorMessage}
                  onRetry={() => {
                    fetchLocations(true);
                    fetchMapPoints(true);
                  }}
                />
              ) : null}

              {locations.length > 0 || mapPoints.length > 0 ? (
                <MapComponent locations={locations} mapPoints={mapPoints} />
              ) : null}
            </>
          ) : null}

          {tab === "locations" ? (
            <LocationsTable
              networkLocations={locations}
              networkLocationsLoading={loading}
              networkLocationsError={errorMessage}
              onRetryNetworkLocations={() => fetchLocations(true)}
              points={mapPoints}
              loading={mapPointsLoading}
              errorMessage={mapPointsErrorMessage}
              onRetry={() => fetchMapPoints(true)}
              onCreate={handleCreateMapPoint}
              onEdit={handleEditMapPoint}
              onDelete={handleDeleteMapPoint}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}