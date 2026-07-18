import { apiGet } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiResponse,
  CupServerInfoData,
  CupServerInfoItem,
  ServerStatusRow,
} from "@/types/cup-server";

const getResponseData = <T>(response: ApiResponse<T>): T | null => {
  return response.data ?? response.Data ?? null;
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const toString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  if (typeof value === "number") return value === 1;
  return fallback;
};

const normalizeCupServerItem = (
  item: Partial<CupServerInfoItem>
): CupServerInfoItem => {
  return {
    id: toNumber(item.id ?? item.Id),
    title: toString(item.title ?? item.Title),
    ip: toString(item.ip ?? item.IP),
    isOnline: toBoolean(item.isOnline ?? item.IsOnline),
    avgCup: toNumber(item.avgCup ?? item.AvgCup),
    timeSc: toNumber(item.timeSc ?? item.TimeSc),
    totalRam: toNumber(item.totalRam ?? item.TotalRam),
    avgCRam: toNumber(item.avgCRam ?? item.AvgCRam),
    avgHDD: toNumber(item.avgHDD ?? item.AvgHDD),
    order: toNumber(item.order ?? item.Order),
    guid: toString(item.guid ?? item.Guid),

    Id: item.Id,
    Title: item.Title,
    IP: item.IP,
    IsOnline: item.IsOnline,
    AvgCup: item.AvgCup,
    TimeSc: item.TimeSc,
    TotalRam: item.TotalRam,
    AvgCRam: item.AvgCRam,
    AvgHDD: item.AvgHDD,
    Order: item.Order,
    Guid: item.Guid,
  };
};

const normalizeCupServerInfo = (
  data: Partial<CupServerInfoData> | null
): CupServerInfoData => {
  const lists = Array.isArray(data?.lists)
    ? data.lists
    : Array.isArray(data?.Lists)
      ? data.Lists
      : [];

  return {
    countOnline: toNumber(data?.countOnline ?? data?.CountOnline),
    countOffline: toNumber(data?.countOffline ?? data?.CountOffline),
    avgCup: toNumber(data?.avgCup ?? data?.AvgCup),
    avgCRam: toNumber(data?.avgCRam ?? data?.AvgCRam),
    order: toNumber(data?.order ?? data?.Order),
    lists: lists.map(normalizeCupServerItem),

    CountOnline: data?.CountOnline,
    CountOffline: data?.CountOffline,
    AvgCup: data?.AvgCup,
    AvgCRam: data?.AvgCRam,
    Order: data?.Order,
    Lists: data?.Lists,
  };
};

export const cupServerService = {
  async getInfo(): Promise<CupServerInfoData> {
    const response = await apiGet<ApiResponse<CupServerInfoData>>(
      API_ENDPOINTS.cupServer.info
    );

    const data = getResponseData(response);

    return normalizeCupServerInfo(data);
  },

  async getServerStatusRows(): Promise<ServerStatusRow[]> {
    const info = await this.getInfo();

    return info.lists.map((server) => ({
      id: server.id,
      guid: server.guid,
      name: server.title,
      status: server.isOnline ? "ONLINE" : "OFFLINE",
      ip: server.ip,
      cpu: server.avgCup,
      ram: server.avgCRam,
      disk: server.avgHDD,
      interval: server.timeSc,
      order: server.order,
      username: "-",
      raw: server,
    }));
  },
};

export default cupServerService;