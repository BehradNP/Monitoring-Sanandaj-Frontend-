import { apiGet, apiPost, jsonPatchConfig } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiListResponse,
  ApiResponse,
  KendoListPayload,
  QrCategoryApiItem,
  QrCategoryNode,
  QrReportApiRow,
  QrReportRow,
  QrReportSearchParams,
  QrZoneOption,
} from "@/types/qr-report";

const toString = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getArrayData = <T>(response: ApiListResponse<T> | ApiResponse<T[]>) => {
  return response.Data ?? response.data ?? [];
};

const getTotal = <T>(response: ApiListResponse<T>) => {
  return Number(response.Total ?? response.total ?? 0);
};

const createListPayload = (page = 1, pageSize = 1000): KendoListPayload => {
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    sort: [],
    group: [],
    filter: null,
  };
};

const normalizeZone = (item: Record<string, unknown>): QrZoneOption => {
  return {
    id: toNumber(item.Id ?? item.id),
    title:
      toString(item.Title ?? item.title) ||
      toString(item.Name ?? item.name) ||
      toString(item.ZoneNetworkTitle ?? item.zoneNetworkTitle) ||
      "-",
  };
};

const normalizeCategory = (item: QrCategoryApiItem): QrCategoryNode => {
  return {
    id: toNumber(item.Id ?? item.id),
    title: toString(item.Title ?? item.title) || "-",
    code: toString(item.Tag ?? item.tag),
    parentId: item.ParentId ?? item.parentId ?? null,
    guid: toString(item.Guid ?? item.guid),
    children: [],
  };
};

const buildCategoryTree = (items: QrCategoryNode[]) => {
  const map = new Map<number, QrCategoryNode>();
  const roots: QrCategoryNode[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId);

      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(item);
      }
    } else {
      roots.push(item);
    }
  });

  const sortTree = (nodes: QrCategoryNode[]) => {
    nodes.sort((a, b) => a.id - b.id);

    nodes.forEach((node) => {
      if (node.children?.length) {
        sortTree(node.children);
      }
    });
  };

  sortTree(roots);

  return roots;
};

const normalizeRow = (item: QrReportApiRow): QrReportRow => {
  const apiName =
    toString(item.name) ||
    toString(item.Name) ||
    toString(item.Title ?? item.title) ||
    "-";

  const firstName = toString(
    item.FristName ?? item.fristName ?? item.FirstName ?? item.firstName
  );

  const lastName = toString(item.LastName ?? item.lastName);

  const fullName =
    toString(item.FullName ?? item.fullName) ||
    `${firstName} ${lastName}`.trim() ||
    "-";

  const code = toString(item.Code ?? item.code);

  const nationalId =
    toString(item.NationalId ?? item.nationalId) ||
    code ||
    "-";

  const number =
    toString(item.Number ?? item.number) ||
    code ||
    toString(item.Id ?? item.id) ||
    "-";

  const mac =
    toString(item.MacAdderss ?? item.macAdderss) ||
    toString(item.MAC ?? item.mac) ||
    "-";

  return {
    id: toNumber(item.Id ?? item.id, Number(number) || Date.now()),
    guid: toString(item.Guid ?? item.guid),
    ip: toString(item.IP ?? item.ip) || "-",
    mac,
    fullName,
    nationalId,
    userName:
      toString(item.UserName ?? item.userName ?? item.Username ?? item.username) ||
      "-",
    faTitle: apiName,
    computerName:
      toString(item.ComputerName ?? item.computerName ?? item.Tag ?? item.tag) ||
      "-",
    number,
  };
};

const createDownloadParams = (params: QrReportSearchParams) => {
  const queryParams: Record<string, unknown> = {};

  if (params.zoneId) {
    queryParams.ZoneId = params.zoneId;
  }

  if (params.tableId?.trim()) {
    queryParams.TableId = params.tableId.trim();
  }

  if (params.categoryId) {
    queryParams.categoryid = params.categoryId;
  }

  if (params.startIp?.trim()) {
    queryParams.startIp = params.startIp.trim();
  }

  if (params.endIp?.trim()) {
    queryParams.endIp = params.endIp.trim();
  }

  return queryParams;
};

export const qrReportService = {
  async getZones(): Promise<QrZoneOption[]> {
    const response = await apiPost<
      ApiListResponse<Record<string, unknown>>,
      KendoListPayload
    >(
      API_ENDPOINTS.zoneNetwork.list,
      createListPayload(1, 1000),
      jsonPatchConfig()
    );

    return getArrayData(response)
      .map(normalizeZone)
      .filter((item) => item.id && item.title !== "-");
  },

  async getCategories(): Promise<QrCategoryNode[]> {
    const response = await apiPost<
      ApiListResponse<QrCategoryApiItem>,
      KendoListPayload
    >(
      API_ENDPOINTS.category.list,
      createListPayload(1, 1000),
      jsonPatchConfig()
    );

    const flatItems = getArrayData(response)
      .map(normalizeCategory)
      .filter((item) => item.id);

    return buildCategoryTree(flatItems);
  },

  async search(
    params: QrReportSearchParams
  ): Promise<{ rows: QrReportRow[]; total: number }> {
    const response = await apiGet<
      ApiListResponse<QrReportApiRow> | ApiResponse<QrReportApiRow[]>
    >(API_ENDPOINTS.category.downloadAll, {
      params: createDownloadParams(params),
    });

    const rows = getArrayData(response).map(normalizeRow);

    const total =
      "Total" in response || "total" in response
        ? getTotal(response as ApiListResponse<QrReportApiRow>)
        : rows.length;

    return {
      rows,
      total: total || rows.length,
    };
  },
};

export default qrReportService;