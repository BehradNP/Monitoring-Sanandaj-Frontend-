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
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    const numberValue = Number(normalized);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  return fallback;
};

const toString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  return typeof value === "boolean" ? value : fallback;
};

const asRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
};

const normalizeNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toNumber(item));
};

const getValueFromAnyShape = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") return toNumber(value);

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + getValueFromAnyShape(item), 0);
  }

  if (value && typeof value === "object") {
    const row = asRecord(value);

    const directValue =
      row.count ??
      row.Count ??
      row.value ??
      row.Value ??
      row.total ??
      row.Total ??
      row.number ??
      row.Number ??
      row.y ??
      row.Y;

    const directNumber = getValueFromAnyShape(directValue);

    if (directNumber > 0) return directNumber;

    return getValueFromAnyShape(row.data ?? row.Data ?? row.datasets ?? row.Datasets ?? row.values ?? row.Values);
  }

  return 0;
};

const normalizeRadioList = (items: unknown): DashboardRadioItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = asRecord(item);

    return {
      source: toString(row.source ?? row.Source),
      info: toString(row.info ?? row.Info),
      dst: toString(row.dst ?? row.Dst),
    };
  });
};

const normalizeReportZone = (items: unknown): DashboardReportZoneItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = asRecord(item);

    return {
      tagid: (row.tagid ?? row.TagId ?? row.tagId ?? null) as number | string | null,
      borderRadius: toNumber(row.borderRadius ?? row.BorderRadius),
      borderWidth: toNumber(row.borderWidth ?? row.BorderWidth),
      data: normalizeNumberArray(row.data ?? row.Data),
      label: toString(row.label ?? row.Label),
      borderColor: toString(row.borderColor ?? row.BorderColor),
      backgroundColor: toString(row.backgroundColor ?? row.BackgroundColor),
      borderSkipped: toBoolean(row.borderSkipped ?? row.BorderSkipped),
    };
  });
};

const normalizeReportOs = (items: unknown): DashboardReportOsItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = asRecord(item);

    const label = toString(row.lable ?? row.label ?? row.Label ?? row.title ?? row.Title ?? row.name ?? row.Name, "نامشخص");
    const count = getValueFromAnyShape(row.count ?? row.Count ?? row.value ?? row.Value ?? row.data ?? row.Data ?? row.datasets ?? row.Datasets);

    return {
      lable: label,
      label,
      color: toString(row.color ?? row.Color),
      count,
      value: count,
      data: row.data ?? row.Data,
      datasets: row.datasets ?? row.Datasets,
      raw: item,
    };
  });
};

const normalizeReportHard = (items: unknown): DashboardReportHardItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const row = asRecord(item);

    const label = toString(row.lable ?? row.label ?? row.Label ?? row.title ?? row.Title ?? row.name ?? row.Name, "نامشخص");

    const value = getValueFromAnyShape(
      row.count ??
        row.Count ??
        row.value ??
        row.Value ??
        row.total ??
        row.Total ??
        row.number ??
        row.Number ??
        row.data ??
        row.Data ??
        row.datasets ??
        row.Datasets
    );

    return {
      lable: label,
      label,
      color: toString(row.color ?? row.Color),
      count: value,
      value,
      total: value,
      data: row.data ?? row.Data,
      datasets: row.datasets ?? row.Datasets,
      raw: item,
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