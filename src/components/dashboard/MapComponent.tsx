"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { NetworkLocation } from "@/types/network-monitoring";

type RealMapProps = {
  locations?: NetworkLocation[];
};

const Map = dynamic(() => import("./RealMap"), {
  ssr: false,
}) as ComponentType<RealMapProps>;

export default function MapComponent({ locations = [] }: RealMapProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <Map locations={locations} />
    </div>
  );
}