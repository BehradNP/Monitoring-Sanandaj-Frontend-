import { apiPost, jsonPatchConfig } from "@/lib/api/client";
import type { ApiListResponse, ApiResponse, SecurityUser, UserApiImage, UserApiItem, UserCreatePayload, UserEditPayload, UserListPayload } from "@/types/user";
import type { RoleOption } from "@/types/role";

const USER_ENDPOINTS = {
  list: "/v1/User/List",
  create: "/v1/User/Create",
  edit: "/v1/User/Edit",
  delete: "/v1/User/Delete",
};

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function toString(value: unknown, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function normalizeText(value: string) {
  return value.replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
}

function getArrayData<T>(response: ApiListResponse<T>) {
  return response.Data ?? response.data ?? [];
}

function getTotal<T>(response: ApiListResponse<T>) {
  return Number(response.Total ?? response.total ?? 0);
}

function getRoleIdsFromApi(item: UserApiItem): number[] {
  const directRoleIds = item.RoleIds ?? item.roleIds;

  if (Array.isArray(directRoleIds)) {
    return directRoleIds.map((roleId) => Number(roleId)).filter((roleId) => Number.isFinite(roleId) && roleId > 0);
  }

  const roles = item.Roles ?? item.roles;

  if (Array.isArray(roles)) {
    return roles
      .map((role: any) => Number(role?.Id ?? role?.id ?? role?.RoleId ?? role?.roleId))
      .filter((roleId) => Number.isFinite(roleId) && roleId > 0);
  }

  return [];
}

function getRoleTitlesFromApi(item: UserApiItem, roles: RoleOption[]) {
  const roleIds = getRoleIdsFromApi(item);
  const titlesFromIds = roleIds.map((roleId) => roles.find((role) => role.id === roleId)?.title).filter(Boolean) as string[];

  if (titlesFromIds.length > 0) return titlesFromIds;

  const rawRoles = item.Roles ?? item.roles;

  if (Array.isArray(rawRoles)) {
    return rawRoles.map((role: any) => toString(role?.Title ?? role?.title ?? role?.Name ?? role?.name)).filter(Boolean);
  }

  return [];
}

function splitFullName(fullName: string) {
  const cleanFullName = fullName.trim().replace(/\s+/g, " ");
  const parts = cleanFullName.split(" ").filter(Boolean);

  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function createListPayload(page: number, pageSize: number, search = ""): UserListPayload {
  const cleanSearch = normalizeText(search);

  const payload: UserListPayload = {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
    sort: [],
    group: [],
    filter: null,
  };

  if (cleanSearch.length >= 3) {
    payload.filter = {
      logic: "or",
      filters: [
        { field: "FirstName", operator: "contains", value: cleanSearch },
        { field: "LastName", operator: "contains", value: cleanSearch },
        { field: "UserName", operator: "contains", value: cleanSearch },
        { field: "Post", operator: "contains", value: cleanSearch },
        { field: "OrganizationTitle", operator: "contains", value: cleanSearch },
      ],
    };
  }

  return payload;
}

function normalizeUser(item: UserApiItem, roles: RoleOption[] = []): SecurityUser {
  const firstName = toString(item.FirstName ?? item.firstName);
  const lastName = toString(item.LastName ?? item.lastName);
  const fullName = `${firstName} ${lastName}`.trim() || "-";
  const roleIds = getRoleIdsFromApi(item);

  return {
    id: toNumber(item.Id ?? item.id),
    guid: toString(item.Guid ?? item.guid),
    firstName,
    lastName,
    fullName,
    username: toString(item.UserName ?? item.userName, "-"),
    passwordHash: toString(item.PasswordHash ?? item.passwordHash),
    post: toString(item.Post ?? item.post, "-"),
    organizationId: toNumber(item.OrganizationId ?? item.organizationId),
    organizationTitle: toString(item.OrganizationTitle ?? item.organizationTitle, "-"),
    imageUrl: toString(item.ImageUrl ?? item.imageUrl),
    roleIds,
    roleTitles: getRoleTitlesFromApi(item, roles),
  };
}

function getEmptyImage(): UserApiImage {
  return {
    fileName: "",
    extension: "",
    size: 0,
    data: "",
    url: "",
  };
}

function createPayloadFromUser(user: SecurityUser): UserCreatePayload {
  const names = user.firstName || user.lastName ? { firstName: user.firstName, lastName: user.lastName } : splitFullName(user.fullName);

  return {
    firstName: names.firstName,
    lastName: names.lastName,
    post: user.post && user.post !== "-" ? user.post : "",
    userName: user.username && user.username !== "-" ? user.username : "",
    passwordHash: user.password || user.passwordHash || "",
    organizationId: user.organizationId || 0,
    roleIds: user.roleIds || [],
    image: getEmptyImage(),
    id: user.id || 0,
    guid: user.guid || EMPTY_GUID,
  };
}

function editPayloadFromUser(user: SecurityUser): UserEditPayload {
  return createPayloadFromUser(user);
}

export const userService = {
  async getUsers(page = 1, pageSize = 10, search = "", roles: RoleOption[] = []): Promise<{ users: SecurityUser[]; total: number }> {
    const response = await apiPost<ApiListResponse<UserApiItem>, UserListPayload>(USER_ENDPOINTS.list, createListPayload(page, pageSize, search), jsonPatchConfig());

    const data = getArrayData(response);
    const users = data.map((item) => normalizeUser(item, roles));
    const total = getTotal(response) || users.length;

    return {
      users,
      total,
    };
  },

  async createUser(user: SecurityUser): Promise<void> {
    await apiPost<ApiResponse<unknown>, UserCreatePayload>(USER_ENDPOINTS.create, createPayloadFromUser(user), jsonPatchConfig());
  },

  async editUser(user: SecurityUser): Promise<void> {
    if (!user.guid) throw new Error("برای ویرایش کاربر guid وجود ندارد.");

    await apiPost<ApiResponse<unknown>, UserEditPayload>(USER_ENDPOINTS.edit, editPayloadFromUser(user), jsonPatchConfig());
  },

  async deleteUser(guid: string): Promise<void> {
    if (!guid) throw new Error("برای حذف کاربر guid وجود ندارد.");

    await apiPost<ApiResponse<unknown>, undefined>(USER_ENDPOINTS.delete, undefined, jsonPatchConfig({ guid }));
  },
};

export default userService;