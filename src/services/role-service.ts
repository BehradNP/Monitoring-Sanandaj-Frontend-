import { apiPost, jsonPatchConfig } from "@/lib/api/client";
import type { RoleOption } from "@/types/role";

export type { RoleOption } from "@/types/role";

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

type RoleApiItem = {
  Title?: string | null;
  title?: string | null;
  Id?: number | null;
  id?: number | null;
  Guid?: string | null;
  guid?: string | null;
};

type RoleCreatePayload = {
  title: string;
};

type RoleEditPayload = {
  title: string;
  id: number;
  guid: string;
};

const ROLE_ENDPOINTS = {
  list: "/Role/List",
  create: "/Role",
  edit: "/Role/Edit",
  delete: (guid: string) => `/Role/Delete/${guid}`,
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function getArrayData<T>(response: ApiListResponse<T>): T[] {
  const rows = response.Data ?? response.data ?? [];

  return Array.isArray(rows) ? rows : [];
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

function normalizeRole(item: RoleApiItem): RoleOption {
  const record = asRecord(item);

  const normalizedRole = {
    id: getNumber(record, ["Id", "id"]),
    guid: getString(record, ["Guid", "guid"]),
    title: getString(record, ["Title", "title"], "بدون عنوان"),
  };

  return normalizedRole as RoleOption;
}

export const roleService = {
  async getRoles(): Promise<RoleOption[]> {
    const response = await apiPost<ApiListResponse<RoleApiItem>>(
      ROLE_ENDPOINTS.list,
      {},
      jsonPatchConfig()
    );

    return getArrayData(response.data)
      .map(normalizeRole)
      .filter((item) => Number(item.id) > 0);
  },

  async createRole(title: string): Promise<ApiResponse<unknown>> {
    const payload: RoleCreatePayload = {
      title: title.trim(),
    };

    const response = await apiPost<ApiResponse<unknown>>(
      ROLE_ENDPOINTS.create,
      payload,
      jsonPatchConfig()
    );

    return response.data;
  },

  async editRole(role: RoleOption, title: string): Promise<ApiResponse<unknown>> {
    const record = asRecord(role);

    const payload: RoleEditPayload = {
      title: title.trim(),
      id: getNumber(record, ["id", "Id"]),
      guid: getString(record, ["guid", "Guid"]),
    };

    const response = await apiPost<ApiResponse<unknown>>(
      ROLE_ENDPOINTS.edit,
      payload,
      jsonPatchConfig()
    );

    return response.data;
  },

  async deleteRole(role: RoleOption): Promise<ApiResponse<unknown>> {
    const record = asRecord(role);
    const guid = getString(record, ["guid", "Guid"]);

    const response = await apiPost<ApiResponse<unknown>>(
      ROLE_ENDPOINTS.delete(guid),
      null,
      jsonPatchConfig()
    );

    return response.data;
  },
};

export default roleService;