import { apiPost, jsonPatchConfig } from "@/lib/api/client";
import type { RoleOption } from "@/types/role";
import type { SecurityUser } from "@/types/user";

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

type UserApiItem = {
  FirstName?: string | null;
  firstName?: string | null;
  FristName?: string | null;
  fristName?: string | null;
  LastName?: string | null;
  lastName?: string | null;
  Post?: string | null;
  post?: string | null;
  UserName?: string | null;
  userName?: string | null;
  Username?: string | null;
  username?: string | null;
  PasswordHash?: string | null;
  passwordHash?: string | null;
  OrganizationTitle?: string | null;
  organizationTitle?: string | null;
  OrganizationId?: number | null;
  organizationId?: number | null;
  ImageUrl?: string | null;
  imageUrl?: string | null;
  RoleIds?: number[] | null;
  roleIds?: number[] | null;
  Roles?: RoleOption[] | null;
  roles?: RoleOption[] | null;
  Id?: number | null;
  id?: number | null;
  Guid?: string | null;
  guid?: string | null;
};

type UserListPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

type UserImagePayload = {
  fileName: string;
  extension: string;
  size: number;
  data: string;
  url: string;
};

type UserCreatePayload = {
  firstName: string;
  lastName: string;
  post: string;
  userName: string;
  passwordHash: string;
  organizationId: number | null;
  roleIds: number[];
  image: UserImagePayload;
  id: number;
  guid: string;
};

type UserEditPayload = UserCreatePayload;

const USER_ENDPOINTS = {
  list: "/User/List",
  create: "/User/Create",
  edit: "/User/Edit",
  delete: "/User/Delete",
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

function getNullableNumber(
  item: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = item[key];

    if (value === null || value === undefined || value === "") continue;

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

  return null;
}

function getNumberArray(
  item: Record<string, unknown>,
  keys: string[]
): number[] {
  for (const key of keys) {
    const value = item[key];

    if (Array.isArray(value)) {
      return value
        .map((row) => Number(row))
        .filter((row) => Number.isFinite(row));
    }
  }

  return [];
}

function normalizeText(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;

  return String(value).replace(/ي/g, "ی").replace(/ك/g, "ک").trim() || fallback;
}

function createEmptyImage(): UserImagePayload {
  return {
    fileName: "",
    extension: "",
    size: 0,
    data: "",
    url: "",
  };
}

function createListPayload(
  page = 1,
  pageSize = 10,
  search = ""
): UserListPayload {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.max(Number(pageSize) || 10, 1);
  const cleanSearch = normalizeText(search);

  const filters =
    cleanSearch.length >= 3
      ? [
          {
            field: "FirstName",
            operator: "contains",
            value: cleanSearch,
          },
          {
            field: "LastName",
            operator: "contains",
            value: cleanSearch,
          },
          {
            field: "UserName",
            operator: "contains",
            value: cleanSearch,
          },
          {
            field: "Post",
            operator: "contains",
            value: cleanSearch,
          },
        ]
      : [];

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
    sort: [],
    group: [],
    filter:
      filters.length > 0
        ? {
            logic: "or",
            filters,
          }
        : null,
  };
}

function getRoleId(role: RoleOption) {
  const record = asRecord(role);

  return getNumber(record, ["id", "Id"]);
}

function normalizeRolesByIds(roleIds: number[], roles: RoleOption[]) {
  if (!Array.isArray(roles) || roles.length === 0) return [];

  return roles.filter((role) => roleIds.includes(getRoleId(role)));
}

function normalizeUser(item: UserApiItem, roles: RoleOption[] = []): SecurityUser {
  const record = asRecord(item);

  const id = getNumber(record, ["Id", "id"]);
  const guid = getString(record, ["Guid", "guid"]);

  const firstName = getString(record, [
    "FirstName",
    "firstName",
    "FristName",
    "fristName",
  ]);

  const lastName = getString(record, ["LastName", "lastName"]);
  const fullName = `${firstName} ${lastName}`.trim() || "-";

  const userName = getString(
    record,
    ["UserName", "userName", "Username", "username"],
    "-"
  );

  const post = getString(record, ["Post", "post"], "-");
  const passwordHash = getString(record, ["PasswordHash", "passwordHash"]);
  const roleIds = getNumberArray(record, ["RoleIds", "roleIds"]);

  const apiRoles = record.Roles ?? record.roles;
  const normalizedRoles = Array.isArray(apiRoles)
    ? (apiRoles as RoleOption[])
    : normalizeRolesByIds(roleIds, roles);

  const normalizedUser = {
    id,
    guid,
    firstName,
    lastName,
    fullName,
    post,
    position: post,
    username: userName,
    userName,
    password: "",
    passwordHash,
    organizationId: getNullableNumber(record, [
      "OrganizationId",
      "organizationId",
    ]),
    organizationTitle: getString(
      record,
      ["OrganizationTitle", "organizationTitle"],
      "-"
    ),
    imageUrl: getString(record, ["ImageUrl", "imageUrl"]),
    roleIds,
    roles: normalizedRoles,
  };

  return normalizedUser as unknown as SecurityUser;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function getUserRoleIds(user: SecurityUser) {
  const record = asRecord(user);
  const directRoleIds = record.roleIds ?? record.RoleIds;

  if (Array.isArray(directRoleIds)) {
    return directRoleIds
      .map((item) => Number(item))
      .filter((item) => Number.isFinite(item));
  }

  const userRoles = record.roles ?? record.Roles;

  if (Array.isArray(userRoles)) {
    return userRoles
      .map((role) => getRoleId(role as RoleOption))
      .filter((id) => id > 0);
  }

  return [];
}

function createPayloadFromUser(user: SecurityUser): UserCreatePayload {
  const record = asRecord(user);

  const fullName = getString(record, ["fullName", "FullName"]);
  const names = splitFullName(fullName);

  const firstName =
    getString(record, ["firstName", "FirstName", "fristName", "FristName"]) ||
    names.firstName;

  const lastName =
    getString(record, ["lastName", "LastName"]) || names.lastName;

  const userName = getString(record, [
    "userName",
    "UserName",
    "username",
    "Username",
  ]);

  const post = getString(record, ["post", "Post", "position", "Position"]);

  return {
    firstName,
    lastName,
    post,
    userName,
    passwordHash: getString(record, [
      "passwordHash",
      "PasswordHash",
      "password",
    ]),
    organizationId: getNullableNumber(record, [
      "organizationId",
      "OrganizationId",
    ]),
    roleIds: getUserRoleIds(user),
    image: createEmptyImage(),
    id: getNumber(record, ["id", "Id"]),
    guid:
      getString(record, ["guid", "Guid"]) ||
      "00000000-0000-0000-0000-000000000000",
  };
}

function editPayloadFromUser(user: SecurityUser): UserEditPayload {
  return createPayloadFromUser(user);
}

export const userService = {
  async getUsers(
    page = 1,
    pageSize = 10,
    search = "",
    roles: RoleOption[] = []
  ): Promise<{ users: SecurityUser[]; total: number }> {
    const response = await apiPost<ApiListResponse<UserApiItem>>(
      USER_ENDPOINTS.list,
      createListPayload(page, pageSize, search),
      jsonPatchConfig()
    );

    const data = getArrayData(response.data);
    const users = data.map((item) => normalizeUser(item, roles));
    const total = getTotal(response.data);

    return {
      users,
      total,
    };
  },

  async createUser(user: SecurityUser): Promise<void> {
    await apiPost<ApiResponse<unknown>>(
      USER_ENDPOINTS.create,
      createPayloadFromUser(user),
      jsonPatchConfig()
    );
  },

  async editUser(user: SecurityUser): Promise<void> {
    const record = asRecord(user);
    const guid = getString(record, ["guid", "Guid"]);

    if (!guid) {
      throw new Error("شناسه کاربر برای ویرایش وجود ندارد.");
    }

    await apiPost<ApiResponse<unknown>>(
      USER_ENDPOINTS.edit,
      editPayloadFromUser(user),
      jsonPatchConfig()
    );
  },

  async deleteUser(guid: string): Promise<void> {
    if (!guid) {
      throw new Error("شناسه کاربر برای حذف وجود ندارد.");
    }

    await apiPost<ApiResponse<unknown>>(
      USER_ENDPOINTS.delete,
      null,
      jsonPatchConfig({
        guid,
      })
    );
  },
};

export default userService;