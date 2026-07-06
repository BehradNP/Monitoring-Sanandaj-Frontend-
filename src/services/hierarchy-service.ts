import { apiPost } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiListResponse,
  CategoryListPayload,
  HierarchyApiItem,
  HierarchyItem,
} from "@/types/hierarchy";

const DEFAULT_ROOT_ID = 4;

const categoryListPayload: CategoryListPayload = {
  page: 1,
  pageSize: 1000,
  skip: 0,
  take: 1000,
  sort: [],
  group: [],
  filter: null,
};

const getArrayData = <T>(response: ApiListResponse<T>): T[] => {
  return response.Data ?? response.data ?? [];
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toString = (value: unknown, fallback = "") => {
  return typeof value === "string" ? value : fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  return typeof value === "boolean" ? value : fallback;
};

const normalizeHierarchyItem = (item: HierarchyApiItem): HierarchyItem => {
  const numericId = toNumber(item.Id ?? item.id);
  const guid = toString(item.Guid ?? item.guid);

  return {
    id: guid || String(numericId),
    numericId,
    title: toString(item.Title ?? item.title),
    code: toString(item.Tag ?? item.tag),
    parentId: toNullableNumber(item.ParentId ?? item.parentId),
    hasChildren: toBoolean(item.hasChildren ?? item.HasChildren),
    guid,
    children: [],
  };
};

const createDefaultRoot = (): HierarchyItem => {
  return {
    id: "root-may",
    numericId: DEFAULT_ROOT_ID,
    title: "شهرداری",
    code: "MAY",
    parentId: null,
    hasChildren: true,
    children: [],
  };
};

const buildTree = (items: HierarchyItem[]): HierarchyItem[] => {
  const map = new Map<number, HierarchyItem>();
  const roots: HierarchyItem[] = [];

  items.forEach((item) => {
    map.set(item.numericId, { ...item, children: [] });
  });

  const hasDefaultRoot = map.has(DEFAULT_ROOT_ID);
  const hasDefaultRootChildren = items.some((item) => item.parentId === DEFAULT_ROOT_ID);

  if (!hasDefaultRoot && hasDefaultRootChildren) {
    map.set(DEFAULT_ROOT_ID, createDefaultRoot());
  }

  map.forEach((item) => {
    if (item.parentId !== null && map.has(item.parentId)) {
      map.get(item.parentId)?.children.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
};

export const hierarchyService = {
  async getHierarchy(): Promise<HierarchyItem[]> {
    const response = await apiPost<ApiListResponse<HierarchyApiItem>, CategoryListPayload>(
      API_ENDPOINTS.category.list,
      categoryListPayload
    );

    const data = getArrayData(response);
    const normalizedItems = data.map(normalizeHierarchyItem).filter((item) => item.numericId > 0);

    return buildTree(normalizedItems);
  },
};

export default hierarchyService;