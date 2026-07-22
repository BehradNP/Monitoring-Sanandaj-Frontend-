import { apiClient, jsonPatchConfig } from "@/lib/api/client";
import dashboardReportService from "@/services/dashboard-report-service";
import type { DashboardRadioItem } from "@/types/dashboard-report";
import type {
  ApiListResponse,
  ApiResponse,
  LocationRouterApiItem,
  LocationRouterCreatePayload,
  LocationRouterEditPayload,
  LocationRouterFormValues,
  LocationRouterItem,
  LocationRouterListPayload,
  NetworkLocation,
  NetworkLocationStatus,
} from "@/types/network-monitoring";

const LOCATION_ROUTER_ENDPOINTS = {
  list: "/LocationRouter/List",
  create: "/LocationRouter/Create",
  edit: "/LocationRouter/Edit",
  delete: "/LocationRouter/Delete",
};

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
  const [lngRaw, latRaw] = String(value)
    .split(",")
    .map((item) => Number(item.trim()));

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

const formatLocationForApi = (lng: string | number, lat: string | number) => {
  return `${String(lng).trim()},${String(lat).trim()}`;
};

const cleanText = (value: unknown, fallback = "-") => {
  if (value === undefined || value === null) return fallback;

  const text = String(value).trim();

  return text || fallback;
};

const cleanEmpty = (value: unknown) => {
  if (value === undefined || value === null) return "";

  return String(value).trim();
};

const toNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const getArrayData = <T>(response: ApiListResponse<T>) => {
  return response.Data ?? response.data ?? [];
};

const getTotal = <T>(response: ApiListResponse<T>) => {
  const rows = getArrayData(response);
  return toNumber(response.Total ?? response.total, rows.length);
};

function createListPayload(
  page = 1,
  pageSize = 3000
): LocationRouterListPayload {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
    sort: [],
    group: [],
    filter: null,
  };
}

const normalizeRadioItem = (
  item: DashboardRadioItem,
  index: number
): NetworkLocation | null => {
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

function normalizeLocationRouterItem(
  item: LocationRouterApiItem
): LocationRouterItem {
  const location = cleanEmpty(item.Location ?? item.location);
  const parsedLocation = parseLngLat(location);

  return {
    id: toNumber(item.Id ?? item.id),
    guid: cleanEmpty(item.Guid ?? item.guid),
    title: cleanText(item.Title ?? item.title, "بدون عنوان"),
    location: location || "-",
    lat: parsedLocation?.lat ?? null,
    lng: parsedLocation?.lng ?? null,
    isValidLocation: Boolean(parsedLocation),
  };
}

function createLocationRouterPayload(
  values: LocationRouterFormValues
): LocationRouterCreatePayload {
  return {
    title: values.title.trim(),
    location: formatLocationForApi(values.lng, values.lat),
  };
}

function editLocationRouterPayload(
  item: LocationRouterItem,
  values: LocationRouterFormValues
): LocationRouterEditPayload {
  return {
    title: values.title.trim(),
    location: formatLocationForApi(values.lng, values.lat),
    id: item.id,
    guid: item.guid,
  };
}

export const networkMonitoringService = {
  async getLocations(): Promise<NetworkLocation[]> {
    const report = await dashboardReportService.getReport();
    const radioList = Array.isArray(report?.redioList) ? report.redioList : [];

    return radioList
      .map((item, index) => normalizeRadioItem(item, index))
      .filter((item): item is NetworkLocation => Boolean(item));
  },

  async getLocationRouters() {
    const response = await apiClient.post<ApiListResponse<LocationRouterApiItem>>(
      LOCATION_ROUTER_ENDPOINTS.list,
      createListPayload(1, 3000),
      jsonPatchConfig()
    );

    const rows = getArrayData(response.data)
      .map(normalizeLocationRouterItem)
      .filter((item) => item.id > 0);

    return {
      rows,
      total: getTotal(response.data),
    };
  },

  async createLocationRouter(
    values: LocationRouterFormValues
  ): Promise<ApiResponse<unknown>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      LOCATION_ROUTER_ENDPOINTS.create,
      createLocationRouterPayload(values),
      jsonPatchConfig()
    );

    return response.data;
  },

  async editLocationRouter(
    item: LocationRouterItem,
    values: LocationRouterFormValues
  ): Promise<ApiResponse<unknown>> {
    if (!item.guid) {
      throw new Error("شناسه لوکیشن برای ویرایش وجود ندارد.");
    }

    const response = await apiClient.post<ApiResponse<unknown>>(
      LOCATION_ROUTER_ENDPOINTS.edit,
      editLocationRouterPayload(item, values),
      jsonPatchConfig()
    );

    return response.data;
  },

  async deleteLocationRouter(
    item: LocationRouterItem
  ): Promise<ApiResponse<unknown>> {
    if (!item.guid) {
      throw new Error("شناسه لوکیشن برای حذف وجود ندارد.");
    }

    const response = await apiClient.post<ApiResponse<unknown>>(
      LOCATION_ROUTER_ENDPOINTS.delete,
      null,
      jsonPatchConfig({
        guid: item.guid,
      })
    );

    return response.data;
  },
};

export default networkMonitoringService;