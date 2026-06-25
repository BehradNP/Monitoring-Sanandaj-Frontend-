"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


const locations = [
  {
    id: 1,
    title: "سازمان آرامستان‌ها",
    lat: 35.087499,
    lng: 47.0395833,
  },
  {
    id: 2,
    title: "کارخانه آسفالت",
    lat: 35.178801,
    lng: 46.9875517,
  },
  {
    id: 3,
    title: "معاونت شهرسازی",
    lat: 35.331549,
    lng: 47.0067813,
  },
  {
    id: 4,
    title: "مدیریت مشاغل شهری",
    lat: 35.259807,
    lng: 47.0099155,
  },
];

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function RealMap() {
  return (
    <MapContainer
      center={[35.25, 47.0]}
      zoom={12}
      scrollWheelZoom
      className="w-full h-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={icon}>
          <Popup>
            <strong>{loc.title}</strong>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
