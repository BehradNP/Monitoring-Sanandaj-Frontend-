export type NetworkLocationStatus = "ONLINE" | "OFFLINE";

export type NetworkLocation = {
  id: string;
  title: string;
  ip: string;
  hostname: string;
  status: NetworkLocationStatus;
  sourceLat: number;
  sourceLng: number;
  dstLat: number;
  dstLng: number;
  sourceGps: string;
  dstGps: string;
  infoHtml: string;
};