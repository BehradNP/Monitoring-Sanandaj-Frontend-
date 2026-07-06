import { apiGet, apiPost, jsonPatchConfig } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiListResponse,
  ApiResponse,
  PersonalApiItem,
  PersonalCreatePayload,
  PersonalEditPayload,
  PersonalListPayload,
  SecurityUser,
} from "@/types/personal";

const toString = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim();
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getArrayData = <T>(response: ApiListResponse<T>) => {
  return response.Data ?? response.data ?? [];
};

const getSingleData = <T>(response: ApiResponse<T>) => {
  return response.data ?? response.Data ?? null;
};

const getTotal = <T>(response: ApiListResponse<T>) => {
  return Number(response.Total ?? response.total ?? 0);
};

const createListPayload = (page: number, pageSize: number): PersonalListPayload => {
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

const splitFullName = (fullName: string) => {
  const cleanFullName = fullName.trim().replace(/\s+/g, " ");
  const parts = cleanFullName.split(" ").filter(Boolean);

  if (parts.length === 0) {
    return {
      fristName: "",
      lastName: "",
    };
  }

  if (parts.length === 1) {
    return {
      fristName: parts[0],
      lastName: "",
    };
  }

  return {
    fristName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const normalizePersonalToUser = (item: PersonalApiItem): SecurityUser => {
  const firstName = toString(
    item.FristName ?? item.fristName ?? item.FirstName ?? item.firstName
  );

  const lastName = toString(item.LastName ?? item.lastName);
  const fullName = `${firstName} ${lastName}`.trim() || "-";

  const code = toString(item.Code ?? item.code);
  const nationalId = toString(item.NationalId ?? item.nationalId) || code || "-";

  const position =
    toString(item.CurrentJobHeld ?? item.currentJobHeld) ||
    toString(item.Employment ?? item.employment) ||
    "-";

  return {
    id: toNumber(item.Id ?? item.id),
    guid: toString(item.Guid ?? item.guid),
    fullName,
    username: code || "-",
    nationalId,
    position,
    roles: [],
  };
};

const createPayloadFromUser = (user: SecurityUser): PersonalCreatePayload => {
  const { fristName, lastName } = splitFullName(user.fullName);
  const code = user.username && user.username !== "-" ? user.username : user.nationalId;

  return {
    fristName,
    lastName,
    code: code && code !== "-" ? code : "",
  };
};

const editPayloadFromUser = (user: SecurityUser): PersonalEditPayload => {
  const { fristName, lastName } = splitFullName(user.fullName);
  const code = user.username && user.username !== "-" ? user.username : user.nationalId;

  return {
    id: user.id,
    guid: user.guid || "",
    fristName,
    lastName,
    code: code && code !== "-" ? code : "",
  };
};

export const personalService = {
  async getUsers(
    page = 1,
    pageSize = 10
  ): Promise<{
    users: SecurityUser[];
    total: number;
  }> {
    const response = await apiPost<
      ApiListResponse<PersonalApiItem>,
      PersonalListPayload
    >(
      API_ENDPOINTS.personal.list,
      createListPayload(page, pageSize),
      jsonPatchConfig()
    );

    const data = getArrayData(response);
    const users = data.map(normalizePersonalToUser);
    const total = getTotal(response) || users.length;

    return {
      users,
      total,
    };
  },

  async getUserByGuid(guid: string): Promise<SecurityUser | null> {
    if (!guid) return null;

    const response = await apiGet<ApiResponse<PersonalApiItem>>(
      `${API_ENDPOINTS.personal.get}/${encodeURIComponent(guid)}`
    );

    const data = getSingleData(response);

    if (!data) return null;

    return normalizePersonalToUser(data);
  },

  async createUser(user: SecurityUser): Promise<void> {
    await apiPost<ApiResponse<unknown>, PersonalCreatePayload>(
      API_ENDPOINTS.personal.create,
      createPayloadFromUser(user),
      jsonPatchConfig()
    );
  },

  async editUser(user: SecurityUser): Promise<void> {
    if (!user.guid) {
      throw new Error("برای ویرایش کاربر guid وجود ندارد.");
    }

    await apiPost<ApiResponse<unknown>, PersonalEditPayload>(
      API_ENDPOINTS.personal.edit,
      editPayloadFromUser(user),
      jsonPatchConfig()
    );
  },

  async deleteUser(guid: string): Promise<void> {
    if (!guid) {
      throw new Error("برای حذف کاربر guid وجود ندارد.");
    }

    await apiPost<ApiResponse<unknown>, undefined>(
      API_ENDPOINTS.personal.delete,
      undefined,
      jsonPatchConfig({ guid })
    );
  },
};

export default personalService;