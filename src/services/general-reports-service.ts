import { apiPost, jsonPatchConfig } from "@/lib/api/client";
import type {
  GeneralReportRow,
  GeneralReportTabKey,
} from "@/types/general-reports";

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

type GeneralReportPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

const GENERAL_REPORT_ENDPOINTS: Record<string, string> = {
  cpu: "/IPNetwork/ListInfocpu",
  gpu: "/IPNetwork/ListInfovag",
  vga: "/IPNetwork/ListInfovag",
  mobo: "/IPNetwork/ListInfomotherboard",
  motherboard: "/IPNetwork/ListInfomotherboard",
  ram: "/IPNetwork/ListInforam",
  hw: "/IPNetwork/ListInfohdd",
  hdd: "/IPNetwork/ListInfohdd",
  sw: "/IPNetwork/InfoSoftall",
  software: "/IPNetwork/InfoSoftall",
  os: "/IPNetwork/InfoOS",
};

function getEndpoint(tab: GeneralReportTabKey) {
  return GENERAL_REPORT_ENDPOINTS[String(tab)] ?? "/IPNetwork/InfoOS";
}

function getArrayData<T>(response: ApiListResponse<T>): T[] {
  const rows = response.Data ?? response.data ?? [];

  return Array.isArray(rows) ? rows : [];
}

function getTotal<T>(response: ApiListResponse<T>) {
  const rows = getArrayData(response);
  const total = response.Total ?? response.total;

  if (typeof total === "number" && Number.isFinite(total)) {
    return total;
  }

  if (typeof total === "string") {
    const numericTotal = Number(total);

    if (Number.isFinite(numericTotal)) {
      return numericTotal;
    }
  }

  return rows.length;
}

function createFilter({
  region,
  search,
}: {
  region?: string;
  search?: string;
}) {
  const filters: unknown[] = [];

  const cleanRegion = region?.trim();
  const cleanSearch = search?.trim();

  if (cleanRegion) {
    filters.push({
      field: "ZoneNetworkTitle",
      operator: "contains",
      value: cleanRegion,
    });
  }

  if (cleanSearch) {
    filters.push({
      logic: "or",
      filters: [
        {
          field: "IP",
          operator: "contains",
          value: cleanSearch,
        },
        {
          field: "MacAdderss",
          operator: "contains",
          value: cleanSearch,
        },
        {
          field: "Title",
          operator: "contains",
          value: cleanSearch,
        },
        {
          field: "UserName",
          operator: "contains",
          value: cleanSearch,
        },
        {
          field: "ZoneNetworkTitle",
          operator: "contains",
          value: cleanSearch,
        },
      ],
    });
  }

  if (filters.length === 0) return null;

  if (filters.length === 1) return filters[0];

  return {
    logic: "and",
    filters,
  };
}

function createPayload({
  page,
  pageSize,
  region,
  search,
}: {
  page: number;
  pageSize: number;
  region?: string;
  search?: string;
}): GeneralReportPayload {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.max(Number(pageSize) || 10, 1);

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
    sort: [],
    group: [],
    filter: createFilter({
      region,
      search,
    }),
  };
}

export const generalReportsService = {
  async getRows({
    tab,
    page,
    pageSize,
    region,
    search,
  }: {
    tab: GeneralReportTabKey;
    page: number;
    pageSize: number;
    region?: string;
    search?: string;
  }): Promise<{
    rows: GeneralReportRow[];
    total: number;
  }> {
    const response = await apiPost<ApiListResponse<GeneralReportRow>>(
      getEndpoint(tab),
      createPayload({
        page,
        pageSize,
        region,
        search,
      }),
      jsonPatchConfig()
    );

    const rows = getArrayData(response.data);
    const total = getTotal(response.data);

    return {
      rows,
      total,
    };
  },
};

export default generalReportsService;