"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  LocationRouterItem,
  NetworkLocation,
} from "@/types/network-monitoring";

type RealMapProps = {
  locations?: NetworkLocation[];
  mapPoints?: LocationRouterItem[];
};

const DEFAULT_CENTER: [number, number] = [35.31940571971579, 46.993677914142616];

const createCircleIcon = (color: string) => {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:9999px;background:${color};border:4px solid white;box-shadow:0 8px 18px rgba(15,23,42,.35);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
};

const createMapPointIcon = () => {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:30px;
        height:30px;
        border-radius:9999px;
        background:#f59e0b;
        border:5px solid white;
        box-shadow:0 10px 24px rgba(15,23,42,.42);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width:8px;
          height:8px;
          border-radius:9999px;
          background:white;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
};

const sourceIcon = createCircleIcon("#0ea5e9");
const destinationIcon = createCircleIcon("#14b8a6");
const mapPointIcon = createMapPointIcon();

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function RealMap({
  locations = [],
  mapPoints = [],
}: RealMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const lastDataSignatureRef = useRef("");

  const safeLocations = useMemo(() => {
    return Array.isArray(locations) ? locations : [];
  }, [locations]);

  const safeMapPoints = useMemo(() => {
    return Array.isArray(mapPoints) ? mapPoints : [];
  }, [mapPoints]);

  const dataSignature = useMemo(() => {
    const linksSignature = safeLocations
      .map((item) => `${item.id}-${item.sourceLat}-${item.sourceLng}-${item.dstLat}-${item.dstLng}-${item.status}`)
      .join("|");

    const pointsSignature = safeMapPoints
      .map((item) => `${item.id}-${item.guid}-${item.title}-${item.location}`)
      .join("|");

    return `${linksSignature}__${pointsSignature}`;
  }, [safeLocations, safeMapPoints]);

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
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
      lastDataSignatureRef.current = "";
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

      const sourcePoint: [number, number] = [
        location.sourceLat,
        location.sourceLng,
      ];

      const destinationPoint: [number, number] = [
        location.dstLat,
        location.dstLng,
      ];

      const lineColor = location.status === "ONLINE" ? "#10b981" : "#ef4444";

      L.marker(sourcePoint, { icon: sourceIcon })
        .bindPopup(location.infoHtml || location.title)
        .addTo(layerGroup);

      L.marker(destinationPoint, { icon: destinationIcon })
        .bindPopup(
          `<div dir="rtl"><b>مقصد</b><br/>${escapeHtml(location.title)}<br/><b>IP:</b> ${escapeHtml(location.ip)}</div>`
        )
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

    safeMapPoints.forEach((point) => {
      if (
        !point.isValidLocation ||
        point.lat === null ||
        point.lng === null ||
        !Number.isFinite(point.lat) ||
        !Number.isFinite(point.lng)
      ) {
        return;
      }

      const mapPoint: [number, number] = [point.lat, point.lng];

      const popupHtml = `
        <div dir="rtl" style="min-width:180px">
          <b>${escapeHtml(point.title)}</b>
          <br/>
          <b>نوع:</b> لوکیشن ثبت‌شده
          <br/>
          <b>مختصات:</b>
          <span dir="ltr">${escapeHtml(point.location)}</span>
          <br/>
          <b>ID:</b> ${point.id}
        </div>
      `;

      L.marker(mapPoint, { icon: mapPointIcon })
        .bindPopup(popupHtml)
        .addTo(layerGroup);

      bounds.extend(mapPoint);
    });

    if (bounds.isValid()) {
      const shouldFitBounds = lastDataSignatureRef.current !== dataSignature;

      if (shouldFitBounds) {
        map.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: 15,
        });

        lastDataSignatureRef.current = dataSignature;
      }
    } else {
      map.setView(DEFAULT_CENTER, 12);
    }

    window.setTimeout(() => {
      invalidateMapSize();
    }, 100);
  }, [safeLocations, safeMapPoints, dataSignature]);

  return <div ref={containerRef} className="h-full w-full" />;
}