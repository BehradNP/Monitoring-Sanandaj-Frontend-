import { apiGet } from "@/lib/api/client";
import type {
  ApiResponse,
  DashboardRadioItem,
  DashboardReportData,
  DashboardReportHardItem,
  DashboardReportOsItem,
  DashboardReportZoneItem,
} from "@/types/dashboard-report";

const DASHBOARD_REPORT_ENDPOINT = "/Report/Get";

const getResponseData = <T>(response: ApiResponse<T>): T | null => {
  return response.data ?? response.Data ?? null;
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const toString = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value : fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  return typeof value === "boolean" ? value : fallback;
};

const normalizeNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toNumber(item));
};

const normalizeRadioList = (items: unknown): DashboardRadioItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = item as Partial<DashboardRadioItem>;

    return {
      source: toString(row.source),
      info: toString(row.info),
      dst: toString(row.dst),
    };
  });
};

const normalizeReportZone = (items: unknown): DashboardReportZoneItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = item as Partial<DashboardReportZoneItem>;

    return {
      tagid: row.tagid ?? null,
      borderRadius: toNumber(row.borderRadius),
      borderWidth: toNumber(row.borderWidth),
      data: normalizeNumberArray(row.data),
      label: toString(row.label),
      borderColor: toString(row.borderColor),
      backgroundColor: toString(row.backgroundColor),
      borderSkipped: toBoolean(row.borderSkipped),
    };
  });
};

const normalizeReportOs = (items: unknown): DashboardReportOsItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = item as Partial<DashboardReportOsItem>;

    return {
      lable: toString(row.lable ?? row.label),
      label: toString(row.label ?? row.lable),
      color: toString(row.color),
      count: toNumber(row.count),
    };
  });
};

const normalizeReportHard = (items: unknown): DashboardReportHardItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = item as Partial<DashboardReportHardItem>;

    return {
      lable: toString(row.lable ?? row.label),
      label: toString(row.label ?? row.lable),
      color: toString(row.color),
      datasets: Array.isArray(row.datasets) ? row.datasets : [],
    };
  });
};

const normalizeDashboardReport = (data: Partial<DashboardReportData> | null): DashboardReportData => {
  return {
    redio: toNumber(data?.redio),
    online: toNumber(data?.online),
    detials: toNumber(data?.detials),
    all: toNumber(data?.all),
    redioList: normalizeRadioList(data?.redioList),
    reportZone: normalizeReportZone(data?.reportZone),
    reportOs: normalizeReportOs(data?.reportOs),
    reportHard: normalizeReportHard(data?.reportHard),
  };
};

export const dashboardReportService = {
  async getReport(): Promise<DashboardReportData> {
    const response = await apiGet<ApiResponse<DashboardReportData>>(DASHBOARD_REPORT_ENDPOINT);
    const data = getResponseData(response);
    return normalizeDashboardReport(data);
  },
};

export default dashboardReportService;