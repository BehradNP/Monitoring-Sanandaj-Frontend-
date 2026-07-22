import { apiClient, jsonPatchConfig } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiListResponse,
  ApiResponse,
  CategoryCreatePayload,
  CategoryEditPayload,
  CategoryListPayload,
  HierarchyApiItem,
  HierarchyData,
  HierarchyFormValues,
  HierarchyItem,
} from "@/types/hierarchy";

const DEFAULT_ROOT_ID = 4;

const categoryListPayload: CategoryListPayload = {
  page: 1,
  pageSize: 3000,
  skip: 0,
  take: 3000,
  sort: [],
  group: [],
  filter: null,
};

const getArrayData = <T>(response: ApiListResponse<T>): T[] => {
  return response.Data ?? response.data ?? [];
};

const getTotal = <T>(response: ApiListResponse<T>): number => {
  return Number(response.Total ?? response.total ?? getArrayData(response).length);
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return fallback;
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
    guid: "",
    children: [],
  };
};

const sortItems = (items: HierarchyItem[]) => {
  return [...items].sort((a, b) => {
    if (a.numericId === DEFAULT_ROOT_ID) return -1;
    if (b.numericId === DEFAULT_ROOT_ID) return 1;
    return a.title.localeCompare(b.title, "fa");
  });
};

const buildTree = (items: HierarchyItem[]): HierarchyItem[] => {
  const map = new Map<number, HierarchyItem>();
  const roots: HierarchyItem[] = [];

  items.forEach((item) => {
    map.set(item.numericId, {
      ...item,
      children: [],
    });
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

  map.forEach((item) => {
    item.children = sortItems(item.children);
  });

  return sortItems(roots);
};

const createPayload = (values: HierarchyFormValues): CategoryCreatePayload => {
  return {
    title: values.title.trim(),
    tag: values.code.trim(),
    parentId: values.parentId,
  };
};

const editPayload = (
  item: HierarchyItem,
  values: HierarchyFormValues
): CategoryEditPayload => {
  return {
    title: values.title.trim(),
    tag: values.code.trim(),
    parentId: values.parentId,
    hasChildren: item.hasChildren,
    id: item.numericId,
    guid: item.guid,
  };
};

export const hierarchyService = {
  async getHierarchyData(): Promise<HierarchyData> {
    const response = await apiClient.post<ApiListResponse<HierarchyApiItem>>(
      API_ENDPOINTS.category.list,
      categoryListPayload,
      jsonPatchConfig()
    );

    const data = getArrayData(response.data);
    const flat = data.map(normalizeHierarchyItem).filter((item) => item.numericId > 0);
    const tree = buildTree(flat);

    return {
      tree,
      flat,
      total: getTotal(response.data),
    };
  },

  async getHierarchy(): Promise<HierarchyItem[]> {
    const data = await this.getHierarchyData();
    return data.tree;
  },

  async createCategory(
    values: HierarchyFormValues
  ): Promise<ApiResponse<unknown>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.category.create,
      createPayload(values),
      jsonPatchConfig()
    );

    return response.data;
  },

  async editCategory(
    item: HierarchyItem,
    values: HierarchyFormValues
  ): Promise<ApiResponse<unknown>> {
    if (!item.guid) throw new Error("شناسه آیتم برای ویرایش وجود ندارد.");

    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.category.edit,
      editPayload(item, values),
      jsonPatchConfig()
    );

    return response.data;
  },

  async deleteCategory(item: HierarchyItem): Promise<ApiResponse<unknown>> {
    if (!item.guid) throw new Error("شناسه آیتم برای حذف وجود ندارد.");

    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.category.deleteFull,
      null,
      jsonPatchConfig({
        guid: item.guid,
      })
    );

    return response.data;
  },
};

export default hierarchyService;