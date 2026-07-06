import { apiClient, jsonPatchConfig } from "@/lib/api/client";
import type { CategoryApiItem, CategoryOption, EditPersonalIPNetworkPayload, HardwareMonitoringApiListResponse, HardwareMonitoringRow, IPNetworkPersonalApiItem, NormalizedHardwareMonitoringList, PersonalApiItem, PersonalOption } from "@/types/hardware-monitoring";

const HARDWARE_MONITORING_ENDPOINTS = {
  listPersonal: "/IPNetwork/ListPersonal",
  listPersonalIPNetworkDetials: "/IPNetwork/ListPersonalIPNetworkDetials",
  listByZone: "/IPNetwork/List",
  editPersonal: "/IPNetwork/editPersonal",
  personalList: "/Personal/List",
  categoryList: "/Category/List",
};

function cleanValue(value: unknown, fallback = "-") {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text.length ? text : fallback;
}

function cleanEmpty(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeListResponse<T>(response: HardwareMonitoringApiListResponse<T> | T[]): NormalizedHardwareMonitoringList<T> {
  if (Array.isArray(response)) return { rows: response, total: response.length, isSuccess: true, message: "" };

  const rows = response?.Data ?? response?.data ?? [];
  const total = response?.Total ?? response?.total ?? rows.length;
  const hasErrors = Boolean(response?.Errors ?? response?.errors);
  const isSuccess = Boolean(response?.isSuccess ?? response?.issuccess ?? !hasErrors);
  const message = cleanEmpty(response?.message ?? response?.Message ?? response?.Errors ?? response?.errors);

  return {
    rows: Array.isArray(rows) ? rows : [],
    total: toNumber(total, Array.isArray(rows) ? rows.length : 0),
    isSuccess,
    message,
  };
}

async function postListWithFallback<T>(url: string, payload: Record<string, unknown> = {}) {
  try {
    const response = await apiClient.post<HardwareMonitoringApiListResponse<T>>(url, payload, jsonPatchConfig);
    return normalizeListResponse<T>(response.data);
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 405 || status === 415) {
      const response = await apiClient.get<HardwareMonitoringApiListResponse<T>>(url, { params: payload });
      return normalizeListResponse<T>(response.data);
    }

    throw error;
  }
}

function mapIPNetworkPersonal(item: IPNetworkPersonalApiItem): HardwareMonitoringRow {
  const firstName = cleanEmpty(item.PersonalFristName);
  const lastName = cleanEmpty(item.PersonalLastName);
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: toNumber(item.Id),
    guid: cleanEmpty(item.Guid),
    ip: cleanValue(item.IP),
    mac: cleanValue(item.MacAdderss),
    name: fullName || "-",
    nationalId: cleanValue(item.PersonalNationalId),
    username: cleanValue(item.UserName),
    pcFa: cleanValue(item.TagFull),
    pcEn: cleanValue(item.TagFullEN),
    number: toNumber(item.Id),
    raw: item,
  };
}

function mapPersonal(item: PersonalApiItem): PersonalOption {
  const id = toNumber(item.Id);
  const guid = cleanEmpty(item.Guid);
  const firstName = cleanEmpty(item.FristName);
  const lastName = cleanEmpty(item.LastName);
  const fullName = `${firstName} ${lastName}`.trim() || "-";
  const nationalId = cleanEmpty(item.NationalId);
  const code = cleanEmpty(item.Code);
  const currentJobHeld = cleanEmpty(item.CurrentJobHeld);
  const identity = code || nationalId || String(id);
  const label = identity ? `${fullName} (${identity})` : fullName;
  const subLabelParts = [currentJobHeld, nationalId ? `کد ملی: ${nationalId}` : "", code ? `کد: ${code}` : ""].filter(Boolean);

  return {
    id,
    guid,
    firstName,
    lastName,
    fullName,
    nationalId,
    code,
    currentJobHeld,
    label,
    subLabel: subLabelParts.join(" | "),
    searchText: `${fullName} ${nationalId} ${code} ${currentJobHeld}`.toLowerCase(),
    raw: item,
  };
}

function flattenCategories(categories: CategoryApiItem[]): CategoryOption[] {
  const mapped = categories.map((item) => ({
    id: toNumber(item.Id),
    guid: cleanEmpty(item.Guid),
    title: cleanEmpty(item.Title),
    tag: cleanEmpty(item.Tag),
    parentId: item.ParentId === undefined || item.ParentId === null ? null : toNumber(item.ParentId),
    hasChildren: Boolean(item.hasChildren),
    level: 0,
    label: "",
    subLabel: "",
    searchText: "",
    raw: item,
  }));

  const byId = new Map<number, CategoryOption & { children: CategoryOption[] }>();

  mapped.forEach((item) => {
    byId.set(item.id, { ...item, children: [] });
  });

  const roots: (CategoryOption & { children: CategoryOption[] })[] = [];

  byId.forEach((item) => {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)?.children.push(item);
    } else {
      roots.push(item);
    }
  });

  const result: CategoryOption[] = [];

  function walk(item: CategoryOption & { children: CategoryOption[] }, level: number, parentTitle = "") {
    const label = item.tag ? `${item.title} (${item.tag})` : item.title;
    const subLabel = parentTitle ? `${parentTitle} / ${label}` : label;

    result.push({
      id: item.id,
      guid: item.guid,
      title: item.title,
      tag: item.tag,
      parentId: item.parentId,
      hasChildren: item.hasChildren,
      level,
      label,
      subLabel,
      searchText: `${label} ${subLabel} ${item.title} ${item.tag}`.toLowerCase(),
      raw: item.raw,
    });

    item.children.forEach((child) => walk(child, level + 1, subLabel));
  }

  roots.forEach((item) => walk(item, 0));

  return result;
}

function mapCategoryList(items: CategoryApiItem[]) {
  return flattenCategories(items);
}

export async function getNetworkRows() {
  const response = await postListWithFallback<IPNetworkPersonalApiItem>(HARDWARE_MONITORING_ENDPOINTS.listPersonal, {});
  return { ...response, rows: response.rows.map(mapIPNetworkPersonal) };
}

export async function getDevicesRows() {
  const response = await postListWithFallback<IPNetworkPersonalApiItem>(HARDWARE_MONITORING_ENDPOINTS.listPersonalIPNetworkDetials, {});
  return { ...response, rows: response.rows.map(mapIPNetworkPersonal) };
}

export async function getRowsByZone(zoneId: number | string) {
  const response = await apiClient.get<HardwareMonitoringApiListResponse<IPNetworkPersonalApiItem>>(HARDWARE_MONITORING_ENDPOINTS.listByZone, { params: { ZoneId: zoneId } });
  const normalized = normalizeListResponse(response.data);
  return { ...normalized, rows: normalized.rows.map(mapIPNetworkPersonal) };
}

export async function getPersonalOptions() {
  const response = await postListWithFallback<PersonalApiItem>(HARDWARE_MONITORING_ENDPOINTS.personalList, {});
  return { ...response, rows: response.rows.map(mapPersonal).filter((item) => item.id > 0) };
}

export async function getCategoryOptions() {
  const response = await postListWithFallback<CategoryApiItem>(HARDWARE_MONITORING_ENDPOINTS.categoryList, {});
  return { ...response, rows: mapCategoryList(response.rows).filter((item) => item.id > 0) };
}

export async function editPersonalIPNetwork(payload: EditPersonalIPNetworkPayload) {
  const response = await apiClient.post(HARDWARE_MONITORING_ENDPOINTS.editPersonal, payload, jsonPatchConfig);
  return response.data;
}

export const hardwareMonitoringService = {
  getNetworkRows,
  getDevicesRows,
  getRowsByZone,
  getPersonalOptions,
  getCategoryOptions,
  editPersonalIPNetwork,
};

export default hardwareMonitoringService;