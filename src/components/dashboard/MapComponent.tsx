"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type {
  LocationRouterItem,
  NetworkLocation,
} from "@/types/network-monitoring";

type RealMapProps = {
  locations?: NetworkLocation[];
  mapPoints?: LocationRouterItem[];
};

const Map = dynamic(() => import("./RealMap"), {
  ssr: false,
}) as ComponentType<RealMapProps>;

export default function MapComponent({
  locations = [],
  mapPoints = [],
}: RealMapProps) {
  return (
    <div className="relative h-[430px] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-sm sm:h-[560px] xl:h-[650px]">
      <Map locations={locations} mapPoints={mapPoints} />

      <div className="pointer-events-none absolute bottom-4 right-4 z-[400] rounded-2xl bg-white/90 px-4 py-3 text-[11px] font-black text-slate-700 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#0ea5e9]" />
            مبدا لینک
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#14b8a6]" />
            مقصد لینک
          </span>

          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            لوکیشن ثبت‌شده
          </span>
        </div>
      </div>
    </div>
  );
}