"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

const Map = dynamic(() => import("./RealMap"), {
  ssr: false,
}) as ComponentType;

export default function MapComponent() {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <Map />
    </div>
  );
}