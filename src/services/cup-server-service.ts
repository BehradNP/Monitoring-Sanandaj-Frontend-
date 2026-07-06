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

const normalizeCupServerItem = (item: Partial<CupServerInfoItem>): CupServerInfoItem => {
  return {
    id: toNumber(item.id),
    title: String(item.title ?? ""),
    ip: String(item.ip ?? ""),
    isOnline: Boolean(item.isOnline),
    avgCup: toNumber(item.avgCup),
    timeSc: toNumber(item.timeSc),
    totalRam: toNumber(item.totalRam),
    avgCRam: toNumber(item.avgCRam),
    avgHDD: toNumber(item.avgHDD),
  };
};

const normalizeCupServerInfo = (
  data: Partial<CupServerInfoData> | null
): CupServerInfoData => {
  const lists = Array.isArray(data?.lists) ? data.lists : [];

  return {
    countOnline: toNumber(data?.countOnline),
    countOffline: toNumber(data?.countOffline),
    avgCup: toNumber(data?.avgCup),
    avgCRam: toNumber(data?.avgCRam),
    order: toNumber(data?.order),
    lists: lists.map(normalizeCupServerItem),
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
      name: server.title,
      status: server.isOnline ? "ONLINE" : "OFFLINE",
      ip: server.ip,
      cpu: server.avgCup,
      ram: server.avgCRam,
    }));
  },
};

export default cupServerService;