import { apiClient, jsonPatchConfig } from "@/lib/api/client";
import type {
  CategoryApiItem,
  CategoryOption,
  EditPersonalIPNetworkPayload,
  HardwareDetailApiItem,
  HardwareInfoField,
  HardwareMonitoringApiListResponse,
  HardwareMonitoringRow,
  HardwareSystemDetails,
  IPNetworkPersonalApiItem,
  NormalizedHardwareMonitoringList,
  PersonalApiItem,
  PersonalOption,
  SoftwareInfoItem,
} from "@/types/hardware-monitoring";

const HARDWARE_MONITORING_ENDPOINTS = {
  listPersonal: "/IPNetwork/ListPersonal",
  listPersonalIPNetworkDetials: "/IPNetwork/ListPersonalIPNetworkDetials",
  listByZone: "/IPNetwork/List",
  editPersonal: "/IPNetwork/editPersonal",
  personalList: "/Personal/List",
  categoryList: "/Category/List",
  listInfoSoftAll: "/IPNetwork/ListInfosoftall",
  listInfoCpu: "/IPNetwork/ListInfocpu",
  listInfoRam: "/IPNetwork/ListInforam",
  listInfoMotherboard: "/IPNetwork/ListInfomotherboard",
  listInfoHdd: "/IPNetwork/ListInfohdd",
  listInfoVga: "/IPNetwork/ListInfovag",
};

const detailListPayload = {
  page: 1,
  pageSize: 5000,
  skip: 0,
  take: 5000,
  sort: [],
  group: [],
  filter: null,
};

type CategoryTreeItem = CategoryOption & {
  children: CategoryTreeItem[];
};

type FieldSpec = {
  label: string;
  key: string;
  suffix?: string;
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

function normalizeMac(value: string) {
  return value.trim().toLowerCase();
}

function normalizeListResponse<T>(
  response: HardwareMonitoringApiListResponse<T> | T[]
): NormalizedHardwareMonitoringList<T> {
  if (Array.isArray(response)) {
    return {
      rows: response,
      total: response.length,
      isSuccess: true,
      message: "",
    };
  }

  const rows = response?.Data ?? response?.data ?? [];
  const total = response?.Total ?? response?.total ?? rows.length;
  const hasErrors = Boolean(response?.Errors ?? response?.errors);
  const isSuccess = Boolean(
    response?.isSuccess ?? response?.issuccess ?? !hasErrors
  );
  const message = cleanEmpty(
    response?.message ??
      response?.Message ??
      response?.Errors ??
      response?.errors
  );

  return {
    rows: Array.isArray(rows) ? rows : [],
    total: toNumber(total, Array.isArray(rows) ? rows.length : 0),
    isSuccess,
    message,
  };
}

async function postListWithFallback<T>(
  url: string,
  payload: Record<string, unknown> = {}
) {
  try {
    const response = await apiClient.post<HardwareMonitoringApiListResponse<T>>(
      url,
      payload,
      jsonPatchConfig()
    );

    return normalizeListResponse<T>(response.data);
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 405 || status === 415) {
      const response = await apiClient.get<HardwareMonitoringApiListResponse<T>>(
        url,
        {
          params: payload,
        }
      );

      return normalizeListResponse<T>(response.data);
    }

    throw error;
  }
}

function readString(item: HardwareDetailApiItem, key: string) {
  return cleanEmpty(item[key]);
}

function isSameSystem(item: HardwareDetailApiItem, row: HardwareMonitoringRow) {
  const itemIp = cleanEmpty(item.IP);
  const rowIp = row.ip === "-" ? "" : cleanEmpty(row.ip);

  if (itemIp && rowIp && itemIp === rowIp) return true;

  const itemMac = normalizeMac(cleanEmpty(item.MacAdderss));
  const rowMac = row.mac === "-" ? "" : normalizeMac(cleanEmpty(row.mac));

  if (itemMac && rowMac && itemMac === rowMac) return true;

  return false;
}

function mapFieldsFromRows(
  items: HardwareDetailApiItem[],
  specs: FieldSpec[]
): HardwareInfoField[] {
  if (!items.length) return [];

  return items.flatMap((item, itemIndex) => {
    return specs
      .map((spec) => {
        const rawValue = readString(item, spec.key);

        if (!rawValue) return null;

        const label =
          items.length > 1 ? `${spec.label} ${itemIndex + 1}` : spec.label;
        const value = spec.suffix ? `${rawValue} ${spec.suffix}` : rawValue;

        return {
          label,
          value,
        };
      })
      .filter(Boolean) as HardwareInfoField[];
  });
}

function mapSoftwareItem(item: HardwareDetailApiItem): SoftwareInfoItem {
  return {
    id: toNumber(item.Id),
    guid: cleanEmpty(item.Guid),
    title: cleanValue(item.Title),
    ip: cleanValue(item.IP),
    mac: cleanValue(item.MacAdderss),
    zone: cleanValue(item.ZoneNetworkTitle),
    username: cleanValue(item.UserName),
  };
}

function mapIPNetworkPersonal(
  item: IPNetworkPersonalApiItem
): HardwareMonitoringRow {
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
  const subLabelParts = [
    currentJobHeld,
    nationalId ? `کد ملی: ${nationalId}` : "",
    code ? `کد: ${code}` : "",
  ].filter(Boolean);

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
  const mapped: CategoryOption[] = categories.map((item) => ({
    id: toNumber(item.Id),
    guid: cleanEmpty(item.Guid),
    title: cleanEmpty(item.Title),
    tag: cleanEmpty(item.Tag),
    parentId:
      item.ParentId === undefined || item.ParentId === null
        ? null
        : toNumber(item.ParentId),
    hasChildren: Boolean(item.hasChildren),
    level: 0,
    label: "",
    subLabel: "",
    searchText: "",
    raw: item,
  }));

  const byId = new Map<number, CategoryTreeItem>();

  mapped.forEach((item) => {
    byId.set(item.id, {
      ...item,
      children: [],
    });
  });

  const roots: CategoryTreeItem[] = [];

  byId.forEach((item) => {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)?.children.push(item);
    } else {
      roots.push(item);
    }
  });

  const result: CategoryOption[] = [];

  function walk(item: CategoryTreeItem, level: number, parentTitle = "") {
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

    item.children.forEach((child) => {
      walk(child, level + 1, subLabel);
    });
  }

  roots.forEach((item) => {
    walk(item, 0);
  });

  return result;
}

function mapCategoryList(items: CategoryApiItem[]) {
  return flattenCategories(items);
}

async function getDetailRows(url: string) {
  const response = await postListWithFallback<HardwareDetailApiItem>(
    url,
    detailListPayload
  );

  return response.rows;
}

function getSettledRows(
  result: PromiseSettledResult<HardwareDetailApiItem[]>
): HardwareDetailApiItem[] {
  return result.status === "fulfilled" ? result.value : [];
}

export async function getNetworkRows() {
  const response = await postListWithFallback<IPNetworkPersonalApiItem>(
    HARDWARE_MONITORING_ENDPOINTS.listPersonal,
    {}
  );

  return {
    ...response,
    rows: response.rows.map(mapIPNetworkPersonal),
  };
}

export async function getDevicesRows() {
  const response = await postListWithFallback<IPNetworkPersonalApiItem>(
    HARDWARE_MONITORING_ENDPOINTS.listPersonalIPNetworkDetials,
    {}
  );

  return {
    ...response,
    rows: response.rows.map(mapIPNetworkPersonal),
  };
}

export async function getRowsByZone(zoneId: number | string) {
  const response = await apiClient.get<
    HardwareMonitoringApiListResponse<IPNetworkPersonalApiItem>
  >(HARDWARE_MONITORING_ENDPOINTS.listByZone, {
    params: {
      ZoneId: zoneId,
    },
  });

  const normalized = normalizeListResponse(response.data);

  return {
    ...normalized,
    rows: normalized.rows.map(mapIPNetworkPersonal),
  };
}

export async function getPersonalOptions() {
  const response = await postListWithFallback<PersonalApiItem>(
    HARDWARE_MONITORING_ENDPOINTS.personalList,
    {}
  );

  return {
    ...response,
    rows: response.rows.map(mapPersonal).filter((item) => item.id > 0),
  };
}

export async function getCategoryOptions() {
  const response = await postListWithFallback<CategoryApiItem>(
    HARDWARE_MONITORING_ENDPOINTS.categoryList,
    {}
  );

  return {
    ...response,
    rows: mapCategoryList(response.rows).filter((item) => item.id > 0),
  };
}

export async function getSystemDetails(
  row: HardwareMonitoringRow
): Promise<HardwareSystemDetails> {
  const [cpuResult, ramResult, motherboardResult, hddResult, vgaResult, softwareResult] =
    await Promise.allSettled([
      getDetailRows(HARDWARE_MONITORING_ENDPOINTS.listInfoCpu),
      getDetailRows(HARDWARE_MONITORING_ENDPOINTS.listInfoRam),
      getDetailRows(HARDWARE_MONITORING_ENDPOINTS.listInfoMotherboard),
      getDetailRows(HARDWARE_MONITORING_ENDPOINTS.listInfoHdd),
      getDetailRows(HARDWARE_MONITORING_ENDPOINTS.listInfoVga),
      getDetailRows(HARDWARE_MONITORING_ENDPOINTS.listInfoSoftAll),
    ]);

  const cpuRows = getSettledRows(cpuResult).filter((item) =>
    isSameSystem(item, row)
  );
  const ramRows = getSettledRows(ramResult).filter((item) =>
    isSameSystem(item, row)
  );
  const motherboardRows = getSettledRows(motherboardResult).filter((item) =>
    isSameSystem(item, row)
  );
  const hddRows = getSettledRows(hddResult).filter((item) =>
    isSameSystem(item, row)
  );
  const vgaRows = getSettledRows(vgaResult).filter((item) =>
    isSameSystem(item, row)
  );
  const softwareRows = getSettledRows(softwareResult).filter((item) =>
    isSameSystem(item, row)
  );

  return {
    cpu: mapFieldsFromRows(cpuRows, [
      { label: "CPU", key: "CPU" },
      { label: "سازنده", key: "CPUManufacturer" },
      { label: "Processor ID", key: "CPUProcessorId" },
      { label: "تعداد Core", key: "CPUNumberOfCores" },
      { label: "Logical Processor", key: "CPUNumberOfLogicalProcessors" },
      { label: "Architecture", key: "CPUNArchitecture" },
    ]),
    ram: mapFieldsFromRows(ramRows, [
      { label: "ظرفیت", key: "RAMCapacity", suffix: "GB" },
      { label: "سازنده", key: "RAMManufacturer" },
      { label: "Part Number", key: "RAMPartNumber" },
      { label: "Memory Type", key: "RAMMemoryType" },
      { label: "Speed", key: "RAMSpeed" },
    ]),
    motherboard: mapFieldsFromRows(motherboardRows, [
      { label: "Device", key: "Device" },
    ]),
    hdd: mapFieldsFromRows(hddRows, [
      { label: "Title", key: "Title" },
      { label: "Name", key: "Name" },
      { label: "Model", key: "Model" },
      { label: "Serial", key: "Serial" },
      { label: "Size", key: "Size" },
      { label: "Capacity", key: "Capacity" },
    ]),
    vga: mapFieldsFromRows(vgaRows, [
      { label: "کارت گرافیک", key: "VGAname" },
      { label: "پردازنده گرافیکی", key: "VGAVideoProcessor" },
      { label: "حالت تصویر", key: "VGAVideoModeDescription" },
      { label: "وضعیت", key: "VGAStatus" },
      { label: "RAM", key: "VGAAdapterRAM" },
    ]),
    software: softwareRows.map(mapSoftwareItem).filter((item) => item.title !== "-"),
  };
}

export async function editPersonalIPNetwork(
  payload: EditPersonalIPNetworkPayload
) {
  const response = await apiClient.post(
    HARDWARE_MONITORING_ENDPOINTS.editPersonal,
    payload,
    jsonPatchConfig()
  );

  return response.data;
}

export const hardwareMonitoringService = {
  getNetworkRows,
  getDevicesRows,
  getRowsByZone,
  getPersonalOptions,
  getCategoryOptions,
  getSystemDetails,
  editPersonalIPNetwork,
};

export default hardwareMonitoringService;