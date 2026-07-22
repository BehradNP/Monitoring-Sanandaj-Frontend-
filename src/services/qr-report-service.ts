import { apiClient, apiPost, jsonPatchConfig } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  QrReportRow,
  QrReportSearchParams,
} from "@/types/qr-report";

export type { QrReportRow, QrReportSearchParams } from "@/types/qr-report";

type ApiListResponse<T> = {
  Data?: T[];
  data?: T[];
  Total?: number;
  total?: number;
  Group?: unknown;
  group?: unknown;
  Aggregates?: unknown;
  aggregates?: unknown;
  Errors?: unknown;
  errors?: unknown;
};

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

type KendoListPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

export type QrZoneOption = {
  id: number;
  guid: string;
  title: string;
  label: string;
  value: number;
};

export type QrCategoryOption = {
  id: number;
  guid: string;
  title: string;
  label: string;
  value: number;
  parentId: number | null;
  code: string;
  children: QrCategoryOption[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function cleanString(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;

  const text = String(value).trim();

  return text || fallback;
}

function getString(
  item: Record<string, unknown>,
  keys: string[],
  fallback = ""
) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "string" && value.trim()) return value.trim();

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
}

function getNumber(
  item: Record<string, unknown>,
  keys: string[],
  fallback = 0
) {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
      const numberValue = Number(value.trim());

      if (Number.isFinite(numberValue)) return numberValue;
    }
  }

  return fallback;
}

function getNullableNumber(
  item: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = item[key];

    if (value === null || value === undefined || value === "") continue;

    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
      const numberValue = Number(value.trim());

      if (Number.isFinite(numberValue)) return numberValue;
    }
  }

  return null;
}

function getArrayData<T>(response: ApiListResponse<T>): T[] {
  const rows = response.Data ?? response.data ?? [];

  return Array.isArray(rows) ? rows : [];
}

function getResponseInnerData<T>(response: ApiResponse<T> | T): T {
  const record = asRecord(response);
  const data = record.data ?? record.Data;

  if (data !== undefined && data !== null) {
    return data as T;
  }

  return response as T;
}

function createListPayload(page = 1, pageSize = 3000): KendoListPayload {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.max(Number(pageSize) || 3000, 1);

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

function normalizeZoneOption(item: unknown): QrZoneOption {
  const record = asRecord(item);

  const id = getNumber(record, ["Id", "id", "Value", "value"]);
  const title = getString(
    record,
    ["Title", "title", "Name", "name", "Label", "label"],
    "بدون عنوان"
  );

  return {
    id,
    guid: getString(record, ["Guid", "guid"]),
    title,
    label: title,
    value: id,
  };
}

function normalizeCategoryOption(item: unknown): QrCategoryOption {
  const record = asRecord(item);

  const id = getNumber(record, ["Id", "id", "Value", "value"]);
  const title = getString(
    record,
    ["Title", "title", "Name", "name", "Label", "label"],
    "بدون عنوان"
  );

  return {
    id,
    guid: getString(record, ["Guid", "guid"]),
    title,
    label: title,
    value: id,
    parentId: getNullableNumber(record, ["ParentId", "parentId"]),
    code: getString(record, ["Tag", "tag", "Code", "code"]),
    children: [],
  };
}

function buildCategoryTree(items: QrCategoryOption[]) {
  const map = new Map<number, QrCategoryOption>();
  const roots: QrCategoryOption[] = [];

  items.forEach((item) => {
    map.set(item.id, {
      ...item,
      children: [],
    });
  });

  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)?.children.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}

function normalizeSearchValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined;

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function createDownloadParams(params: QrReportSearchParams) {
  const record = asRecord(params);

  const zoneId = normalizeSearchValue(
    record.zoneId as number | string | null | undefined
  );

  const regionId = normalizeSearchValue(
    record.regionId as number | string | null | undefined
  );

  const tableId = normalizeSearchValue(
    record.tableId as number | string | null | undefined
  );

  const categoryId = normalizeSearchValue(
    record.categoryId as number | string | null | undefined
  );

  return {
    ZoneId: zoneId ?? regionId,
    TableId: tableId,
    categoryid: categoryId,
    startIp: cleanString(record.startIp),
    endIp: cleanString(record.endIp),
  };
}

function normalizeQrReportRow(item: unknown, index: number): QrReportRow {
  const record = asRecord(item);

  const name = getString(record, ["name", "Name", "fullName", "FullName"]);
  const number = getString(record, ["number", "Number", "qrCode", "QrCode"]).replace(
    /^QR[-_\s]*/i,
    ""
  );
  const mac = getString(record, [
    "mac",
    "Mac",
    "MAC",
    "MacAdderss",
    "macAdderss",
    "macAddress",
    "MacAddress",
  ]);

  const ip = getString(record, ["ip", "IP"], "-");
  const fullName = getString(
    record,
    ["fullName", "FullName", "name", "Name"],
    name || "-"
  );
  const nationalId = getString(
    record,
    ["nationalId", "NationalId", "code", "Code", "number", "Number"],
    number || "-"
  );

  const normalized = {
    id: getNumber(record, ["id", "Id"], index + 1),
    ip,
    fullName,
    nationalId,
    name: name || fullName,
    number: number || nationalId,
    mac,
    macAddress: mac,
    qrCode: number || nationalId,
    title: getString(record, ["title", "Title"], name || fullName),
    categoryTitle: getString(
      record,
      ["categoryTitle", "CategoryTitle", "tagFull", "TagFull"],
      "-"
    ),
    organizationTitle: getString(
      record,
      ["organizationTitle", "OrganizationTitle", "zoneTitle", "ZoneTitle"],
      "-"
    ),
    username: getString(record, ["username", "Username", "userName", "UserName"], "-"),
    userName: getString(record, ["userName", "UserName", "username", "Username"], "-"),
  };

  return normalized as unknown as QrReportRow;
}

export const qrReportService = {
  async getZones(): Promise<QrZoneOption[]> {
    const response = await apiPost<ApiListResponse<Record<string, unknown>>>(
      API_ENDPOINTS.zoneNetwork.list,
      createListPayload(),
      jsonPatchConfig()
    );

    return getArrayData(response.data)
      .map(normalizeZoneOption)
      .filter((item) => item.id > 0);
  },

  async getRegions(): Promise<QrZoneOption[]> {
    return this.getZones();
  },

  async getCategories(): Promise<QrCategoryOption[]> {
    const response = await apiPost<ApiListResponse<Record<string, unknown>>>(
      API_ENDPOINTS.category.list,
      createListPayload(),
      jsonPatchConfig()
    );

    return getArrayData(response.data)
      .map(normalizeCategoryOption)
      .filter((item) => item.id > 0);
  },

  async getHierarchy(): Promise<QrCategoryOption[]> {
    const categories = await this.getCategories();

    return buildCategoryTree(categories);
  },

  async getCategoryTree(): Promise<QrCategoryOption[]> {
    return this.getHierarchy();
  },

  async getQrRows(params: QrReportSearchParams): Promise<QrReportRow[]> {
    const response = await apiClient.get<ApiResponse<unknown[]> | unknown[]>(
      API_ENDPOINTS.category.downloadAll,
      jsonPatchConfig(createDownloadParams(params))
    );

    const data = getResponseInnerData<unknown[]>(response.data);

    return Array.isArray(data)
      ? data.map((item, index) => normalizeQrReportRow(item, index))
      : [];
  },

  async search(params: QrReportSearchParams): Promise<{
    rows: QrReportRow[];
    total: number;
  }> {
    const rows = await this.getQrRows(params);

    return {
      rows,
      total: rows.length,
    };
  },

  async getRows(params: QrReportSearchParams): Promise<QrReportRow[]> {
    return this.getQrRows(params);
  },

  async downloadAll(params: QrReportSearchParams): Promise<QrReportRow[]> {
    return this.getQrRows(params);
  },
};

export default qrReportService;