import { apiPost, jsonPatchConfig } from "@/lib/api/client";
import type { ApiListResponse, RoleApiItem, RoleOption } from "@/types/role";

const ROLE_ENDPOINTS = {
  list: "/v1/Role/List",
};

function toString(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function getArrayData<T>(response: ApiListResponse<T>) {
  return response.Data ?? response.data ?? [];
}

function normalizeRole(item: RoleApiItem): RoleOption {
  return {
    id: toNumber(item.Id ?? item.id),
    guid: toString(item.Guid ?? item.guid),
    title: toString(item.Title ?? item.title, "-"),
  };
}

export const roleService = {
  async getRoles(): Promise<RoleOption[]> {
    const response = await apiPost<ApiListResponse<RoleApiItem>, Record<string, never>>(ROLE_ENDPOINTS.list, {}, jsonPatchConfig());
    return getArrayData(response).map(normalizeRole).filter((item) => item.id > 0);
  },
};

export default roleService;