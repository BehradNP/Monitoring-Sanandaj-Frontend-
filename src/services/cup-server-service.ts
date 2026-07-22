import { apiClient } from "@/lib/api/client";
import type {
  CupServerInfoData,
  CupServerInfoItem,
  ServerStatusRow,
} from "@/types/cup-server";

type ApiResponse<T> = {
  data?: T;
  Data?: T;
  isSuccess?: boolean;
  issuccess?: boolean;
  statusCode?: number;
  statuscode?: number;
  message?: string | null;
  Message?: string | null;
};

const CUP_SERVER_INFO_ENDPOINT = "/CupServer/Info";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function getString(item: Record<string, unknown>, keys: string[], fallback = "-") {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function getNumber(item: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const numberValue = Number(value.trim());

      if (Number.isFinite(numberValue)) {
        return numberValue;
      }
    }
  }

  return fallback;
}

function getBoolean(item: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "true") return true;
      if (normalized === "false") return false;
      if (normalized === "online") return true;
      if (normalized === "offline") return false;
      if (normalized === "فعال") return true;
      if (normalized === "غیرفعال") return false;
    }

    if (typeof value === "number") {
      return value === 1;
    }
  }

  return fallback;
}

function getResponseData<T>(responseData: unknown): T | null {
  const payload = asRecord(responseData);
  const firstLevelData = payload.data ?? payload.Data;

  if (!firstLevelData) {
    return null;
  }

  const firstLevelRecord = asRecord(firstLevelData);
  const nestedData = firstLevelRecord.data ?? firstLevelRecord.Data;

  if (nestedData) {
    return nestedData as T;
  }

  return firstLevelData as T;
}

function normalizeCupServerItem(value: unknown): CupServerInfoItem {
  const item = asRecord(value);

  return {
    id: getNumber(item, ["id", "Id"]),
    title: getString(item, ["title", "Title", "name", "Name"], "-"),
    ip: getString(item, ["ip", "IP"], "-"),
    isOnline: getBoolean(item, ["isOnline", "IsOnline", "online", "Online"]),
    avgCup: getNumber(item, ["avgCup", "AvgCup", "avgCPU", "AvgCPU", "cpu", "CPU"]),
    timeSc: getNumber(item, ["timeSc", "TimeSc", "interval", "Interval"]),
    totalRam: getNumber(item, ["totalRam", "TotalRam"]),
    avgCRam: getNumber(item, ["avgCRam", "AvgCRam", "ram", "RAM"]),
    avgHDD: getNumber(item, ["avgHDD", "AvgHDD", "disk", "Disk", "hdd", "HDD"]),
    order: getNumber(item, ["order", "Order"]),
  };
}

function normalizeCupServerInfo(data: Partial<CupServerInfoData> | null): CupServerInfoData {
  const item = asRecord(data);
  const rawLists = item.lists ?? item.Lists ?? [];

  const lists = Array.isArray(rawLists) ? rawLists.map(normalizeCupServerItem) : [];

  return {
    countOnline: getNumber(item, ["countOnline", "CountOnline"]),
    countOffline: getNumber(item, ["countOffline", "CountOffline"]),
    avgCup: getNumber(item, ["avgCup", "AvgCup", "avgCPU", "AvgCPU"]),
    avgCRam: getNumber(item, ["avgCRam", "AvgCRam"]),
    order: getNumber(item, ["order", "Order"]),
    lists,
  };
}

function mapCupServerItemToStatusRow(item: CupServerInfoItem): ServerStatusRow {
  return {
    id: item.id || 0,
    name: item.title || "-",
    ip: item.ip || "-",
    status: item.isOnline ? "ONLINE" : "OFFLINE",
    cpu: Number(item.avgCup) || 0,
    ram: Number(item.avgCRam) || 0,
    disk: Number(item.avgHDD) || 0,
    interval: Number(item.timeSc) || 0,
    order: Number(item.order) || 0,
  };
}

export const cupServerService = {
  async getInfo(): Promise<CupServerInfoData> {
    const response = await apiClient.get<ApiResponse<CupServerInfoData>>(
      CUP_SERVER_INFO_ENDPOINT
    );

    const data = getResponseData<CupServerInfoData>(response.data);

    return normalizeCupServerInfo(data);
  },

  async getInfoHome(): Promise<CupServerInfoData> {
    return this.getInfo();
  },

  async getServerStatusRows(): Promise<ServerStatusRow[]> {
    const info = await this.getInfo();

    return info.lists.map(mapCupServerItemToStatusRow);
  },

  async getServers() {
    const info = await this.getInfo();

    return info.lists.map((item) => ({
      id: item.id || 0,
      title: item.title || "-",
      name: item.title || "-",
      ip: item.ip || "-",
      username: "-",
      order: item.order || 0,
      interval: item.timeSc || 0,
      status: item.isOnline ? "online" : "offline",
      cpu: item.avgCup || 0,
      ram: item.avgCRam || 0,
      disk: item.avgHDD || 0,
    }));
  },
};

export default cupServerService;