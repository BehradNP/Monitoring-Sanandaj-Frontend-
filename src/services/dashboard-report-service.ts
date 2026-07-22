import { apiClient } from "@/lib/api/client";
import type { DashboardReportData } from "@/types/dashboard-report";

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

const DASHBOARD_REPORT_ENDPOINT = "/Report/Get";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getNumber(
  item: Record<string, unknown>,
  keys: string[],
  fallback = 0
) {
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

function getString(
  item: Record<string, unknown>,
  keys: string[],
  fallback = ""
) {
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

function getBoolean(
  item: Record<string, unknown>,
  keys: string[],
  fallback = false
) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "boolean") return value;

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();

      if (normalized === "true") return true;
      if (normalized === "false") return false;
    }

    if (typeof value === "number") {
      return value === 1;
    }
  }

  return fallback;
}

function getArray<T = unknown>(
  item: Record<string, unknown>,
  keys: string[]
): T[] {
  for (const key of keys) {
    const value = item[key];

    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
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

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    if (typeof item === "number" && Number.isFinite(item)) return item;

    if (typeof item === "string") {
      const numberValue = Number(item.trim());
      return Number.isFinite(numberValue) ? numberValue : 0;
    }

    return 0;
  });
}

function normalizeRadioItem(item: unknown) {
  const record = asRecord(item);

  return {
    source: getString(record, ["source", "Source"]),
    dst: getString(record, ["dst", "Dst", "destination", "Destination"]),
    info: getString(record, ["info", "Info"]),
  };
}

function normalizeZoneItem(item: unknown) {
  const record = asRecord(item);

  const rawData =
    record.data ??
    record.Data ??
    record.values ??
    record.Values ??
    record.datasets ??
    record.Datasets;

  return {
    label: getString(
      record,
      ["label", "Label", "lable", "Lable", "title", "Title", "name", "Name"],
      ""
    ),
    data: normalizeNumberArray(rawData),
    borderRadius: getNumber(record, ["borderRadius", "BorderRadius"], 8),
    borderWidth: getNumber(record, ["borderWidth", "BorderWidth"], 1),
    borderColor: getString(record, ["borderColor", "BorderColor"], "#ffffff"),
    backgroundColor: getString(
      record,
      ["backgroundColor", "BackgroundColor"],
      "#2f7f86"
    ),
    borderSkipped: getBoolean(
      record,
      ["borderSkipped", "BorderSkipped"],
      false
    ),
  };
}

function normalizeSimpleReportItem(item: unknown) {
  const record = asRecord(item);

  return {
    ...record,
    label: getString(
      record,
      ["label", "Label", "lable", "Lable", "title", "Title", "name", "Name"],
      ""
    ),
    title: getString(
      record,
      ["title", "Title", "name", "Name", "label", "Label", "lable", "Lable"],
      ""
    ),
    name: getString(
      record,
      ["name", "Name", "title", "Title", "label", "Label", "lable", "Lable"],
      ""
    ),
    count: getNumber(
      record,
      [
        "count",
        "Count",
        "value",
        "Value",
        "total",
        "Total",
        "number",
        "Number",
        "y",
        "Y",
      ],
      0
    ),
    value: getNumber(
      record,
      [
        "value",
        "Value",
        "count",
        "Count",
        "total",
        "Total",
        "number",
        "Number",
        "y",
        "Y",
      ],
      0
    ),
  };
}

function normalizeDashboardReport(data: unknown): DashboardReportData {
  const item = asRecord(data);

  const redioList = getArray(
    item,
    ["redioList", "RedioList", "radioList", "RadioList"]
  ).map(normalizeRadioItem);

  const reportZone = getArray(item, ["reportZone", "ReportZone"]).map(
    normalizeZoneItem
  );

  const reportOs = getArray(
    item,
    ["reportOs", "ReportOs", "reportOS", "ReportOS"]
  ).map(normalizeSimpleReportItem);

  const reportHard = getArray(
    item,
    ["reportHard", "ReportHard", "reportHardware", "ReportHardware"]
  ).map(normalizeSimpleReportItem);

  const normalized = {
    redio: getNumber(item, ["redio", "Redio", "radio", "Radio"]),
    online: getNumber(item, ["online", "Online"]),
    detials: getNumber(
      item,
      ["detials", "Detials", "details", "Details"],
      0
    ),
    all: getNumber(item, ["all", "All", "total", "Total"]),
    redioList,
    reportZone,
    reportOs,
    reportHard,
  };

  return normalized as unknown as DashboardReportData;
}

export const dashboardReportService = {
  async getReport(): Promise<DashboardReportData> {
    const response = await apiClient.get<ApiResponse<DashboardReportData>>(
      DASHBOARD_REPORT_ENDPOINT
    );

    const data = getResponseData<DashboardReportData>(response.data);

    return normalizeDashboardReport(data);
  },

  async getDashboardReport(): Promise<DashboardReportData> {
    return this.getReport();
  },
};

export default dashboardReportService;