"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { NetworkLocation } from "@/types/network-monitoring";

type RealMapProps = {
  locations?: NetworkLocation[];
};

const DEFAULT_CENTER: [number, number] = [35.31940571971579, 46.993677914142616];

const createLocationIcon = (color: string) => {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:${color};border:4px solid white;box-shadow:0 6px 16px rgba(15,23,42,.35);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
};

const sourceIcon = createLocationIcon("#0ea5e9");
const destinationIcon = createLocationIcon("#14b8a6");

export default function RealMap({ locations = [] }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const hasFitBoundsRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const safeLocations = useMemo(() => {
    return Array.isArray(locations) ? locations : [];
  }, [locations]);

  const invalidateMapSize = () => {
    const map = mapRef.current;

    if (!map) return;

    const container = map.getContainer();

    if (!container || !document.body.contains(container)) return;

    map.invalidateSize();
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    mapRef.current = map;
    layerRef.current = layerGroup;

    [100, 300, 700, 1200].forEach((delay) => {
      const timeoutId = window.setTimeout(() => {
        invalidateMapSize();
      }, delay);

      timeoutsRef.current.push(timeoutId);
    });

    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      layerRef.current = null;
      hasFitBoundsRef.current = false;
    };
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      invalidateMapSize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerRef.current;

    if (!map || !layerGroup) return;

    invalidateMapSize();
    layerGroup.clearLayers();

    if (safeLocations.length === 0) return;

    const bounds = L.latLngBounds([]);

    safeLocations.forEach((location) => {
      if (
        !Number.isFinite(location.sourceLat) ||
        !Number.isFinite(location.sourceLng) ||
        !Number.isFinite(location.dstLat) ||
        !Number.isFinite(location.dstLng)
      ) {
        return;
      }

      const sourcePoint: [number, number] = [location.sourceLat, location.sourceLng];
      const destinationPoint: [number, number] = [location.dstLat, location.dstLng];
      const lineColor = location.status === "ONLINE" ? "#10b981" : "#ef4444";

      L.marker(sourcePoint, { icon: sourceIcon })
        .bindPopup(location.infoHtml || location.title)
        .addTo(layerGroup);

      L.marker(destinationPoint, { icon: destinationIcon })
        .bindPopup(`<div dir="rtl"><b>مقصد</b><br/>${location.title}<br/><b>IP:</b> ${location.ip}</div>`)
        .addTo(layerGroup);

      L.polyline([sourcePoint, destinationPoint], {
        color: lineColor,
        weight: 3,
        opacity: 0.75,
      })
        .bindPopup(location.infoHtml || location.title)
        .addTo(layerGroup);

      bounds.extend(sourcePoint);
      bounds.extend(destinationPoint);
    });

    if (!hasFitBoundsRef.current && bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
      });

      hasFitBoundsRef.current = true;
    }

    window.setTimeout(() => {
      invalidateMapSize();
    }, 100);
  }, [safeLocations]);

  return <div ref={containerRef} className="h-full w-full min-h-[500px]" />;
}