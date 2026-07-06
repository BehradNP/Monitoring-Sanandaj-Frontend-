import { apiPost, jsonPatchConfig } from "@/lib/api/client";
import type {
  ApiListResponse,
  GeneralReportPayload,
  GeneralReportRow,
  GeneralReportTabKey,
} from "@/types/general-reports";

const GENERAL_REPORT_ENDPOINTS: Record<GeneralReportTabKey, string> = {
  cpu: "/v1/IPNetwork/ListInfocpu",
  gpu: "/v1/IPNetwork/ListInfovag",
  mobo: "/v1/IPNetwork/ListInfomotherboard",
  ram: "/v1/IPNetwork/ListInforam",
  hdd: "/v1/IPNetwork/ListInfohdd",
  hw: "/v1/IPNetwork/ListInfo",
  sw: "/v1/IPNetwork/InfoSoftall",
  os: "/v1/IPNetwork/InfoOS",
};

const SEARCH_FIELDS: Record<GeneralReportTabKey, string[]> = {
  cpu: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "CPU", "CPUManufacturer", "CPUProcessorId"],
  gpu: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "VGAVideoProcessor", "VGAname", "VGAStatus"],
  mobo: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "Device"],
  ram: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "RAMPartNumber", "RAMManufacturer", "RAMCapacity"],
  hdd: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "Title", "Device"],
  hw: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "Title", "Device"],
  sw: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "Title"],
  os: ["ZoneNetworkTitle", "IP", "MacAdderss", "UserName", "Caption", "Manufacturer", "Version", "SerialNumber"],
};

const getArrayData = <T>(response: ApiListResponse<T>) => {
  return response.Data ?? response.data ?? [];
};

const getTotal = <T>(response: ApiListResponse<T>) => {
  return Number(response.Total ?? response.total ?? 0);
};

const createSearchFilter = (tab: GeneralReportTabKey, search: string) => {
  const cleanSearch = search.trim();

  if (!cleanSearch) return null;

  return {
    logic: "or",
    filters: SEARCH_FIELDS[tab].map((field) => ({
      field,
      operator: "contains",
      value: cleanSearch,
    })),
  };
};

const createRegionFilter = (region: string) => {
  const cleanRegion = region.trim();

  if (!cleanRegion) return null;

  return {
    field: "ZoneNetworkTitle",
    operator: "eq",
    value: cleanRegion,
  };
};

const createFilter = (tab: GeneralReportTabKey, region: string, search: string) => {
  const filters = [createRegionFilter(region), createSearchFilter(tab, search)].filter(Boolean);

  if (filters.length === 0) return null;

  if (filters.length === 1) return filters[0];

  return {
    logic: "and",
    filters,
  };
};

const createPayload = ({
  tab,
  page,
  pageSize,
  region,
  search,
}: {
  tab: GeneralReportTabKey;
  page: number;
  pageSize: number;
  region: string;
  search: string;
}): GeneralReportPayload => {
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    sort: [],
    group: [],
    filter: createFilter(tab, region, search),
  };
};

export const generalReportsService = {
  async getRows({
    tab,
    page,
    pageSize,
    region = "",
    search = "",
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
    const response = await apiPost<ApiListResponse<GeneralReportRow>, GeneralReportPayload>(
      GENERAL_REPORT_ENDPOINTS[tab],
      createPayload({ tab, page, pageSize, region, search }),
      jsonPatchConfig()
    );

    const rows = getArrayData(response);
    const total = getTotal(response) || rows.length;

    return {
      rows,
      total,
    };
  },
};

export default generalReportsService;