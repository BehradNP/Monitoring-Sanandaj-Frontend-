import dashboardReportService from "@/services/dashboard-report-service";
import type { DashboardRadioItem } from "@/types/dashboard-report";
import type { NetworkLocation, NetworkLocationStatus } from "@/types/network-monitoring";

const removeHtmlTags = (value: string) => {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
};

const sanitizeHtml = (value: string) => {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
};

const extractFirstBoldText = (info: string) => {
  const match = info.match(/<b>(.*?)<\/b>/i);
  return removeHtmlTags(match?.[1] ?? "لوکیشن شبکه");
};

const extractFieldFromInfo = (info: string, field: string) => {
  const pattern = new RegExp(`<b>\\s*${field}:\\s*<\\/b>\\s*([^<]*)`, "i");
  const match = info.match(pattern);
  return removeHtmlTags(match?.[1] ?? "");
};

const extractStatus = (info: string): NetworkLocationStatus => {
  return info.includes("فعال") || info.includes("✅") ? "ONLINE" : "OFFLINE";
};

const parseLngLat = (value: string) => {
  const [lngRaw, latRaw] = value.split(",").map((item) => Number(item.trim()));

  if (!Number.isFinite(latRaw) || !Number.isFinite(lngRaw)) {
    return null;
  }

  return {
    lat: latRaw,
    lng: lngRaw,
  };
};

const formatGps = (lat: number, lng: number) => {
  return `${lat}, ${lng}`;
};

const normalizeRadioItem = (item: DashboardRadioItem, index: number): NetworkLocation | null => {
  const source = parseLngLat(item.source);
  const dst = parseLngLat(item.dst);

  if (!source || !dst) return null;

  const title = extractFirstBoldText(item.info);
  const ip = extractFieldFromInfo(item.info, "IP");
  const hostname = extractFieldFromInfo(item.info, "Hostname");
  const status = extractStatus(item.info);

  return {
    id: `${index}-${item.source}-${item.dst}`,
    title,
    ip: ip || "-",
    hostname: hostname || "-",
    status,
    sourceLat: source.lat,
    sourceLng: source.lng,
    dstLat: dst.lat,
    dstLng: dst.lng,
    sourceGps: formatGps(source.lat, source.lng),
    dstGps: formatGps(dst.lat, dst.lng),
    infoHtml: sanitizeHtml(item.info),
  };
};

export const networkMonitoringService = {
  async getLocations(): Promise<NetworkLocation[]> {
    const report = await dashboardReportService.getReport();

    return report.redioList
      .map((item, index) => normalizeRadioItem(item, index))
      .filter((item): item is NetworkLocation => Boolean(item));
  },
};

export default networkMonitoringService;