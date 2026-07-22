import { apiClient, jsonPatchConfig } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ApiListResponse,
  ApiResponse,
  PersonalApiItem,
  PersonalCreatePayload,
  PersonalEditPayload,
  PersonalListPayload,
  PersonnelFormValues,
  PersonnelRow,
  SecurityUser,
} from "@/types/personal";

const DEFAULT_PAGE_SIZE = 3000;

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

function getArrayData<T>(response: ApiListResponse<T>) {
  return response.Data ?? response.data ?? [];
}

function getTotal<T>(response: ApiListResponse<T>) {
  const rows = getArrayData(response);
  return toNumber(response.Total ?? response.total, rows.length);
}

function createListPayload(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = ""
): PersonalListPayload {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const cleanSearch = search.trim();

  const payload: PersonalListPayload = {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
    sort: [],
    group: [],
    filter: null,
  };

  if (cleanSearch.length >= 3) {
    payload.filter = {
      logic: "or",
      filters: [
        { field: "FristName", operator: "contains", value: cleanSearch },
        { field: "LastName", operator: "contains", value: cleanSearch },
        { field: "Code", operator: "contains", value: cleanSearch },
        { field: "NationalId", operator: "contains", value: cleanSearch },
        { field: "CurrentJobHeld", operator: "contains", value: cleanSearch },
        { field: "Employment", operator: "contains", value: cleanSearch },
      ],
    };
  }

  return payload;
}

function mapPersonnel(item: PersonalApiItem): PersonnelRow {
  const firstName = cleanEmpty(
    item.FristName ?? item.fristName ?? item.FirstName ?? item.firstName
  );
  const lastName = cleanEmpty(item.LastName ?? item.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: toNumber(item.Id ?? item.id),
    guid: cleanEmpty(item.Guid ?? item.guid),
    firstName,
    lastName,
    fullName: fullName || "-",
    code: cleanValue(item.Code ?? item.code),
    nationalId: cleanValue(item.NationalId ?? item.nationalId),
    fatherName: cleanValue(item.FatherName ?? item.fatherName),
    currentJobHeld: cleanValue(item.CurrentJobHeld ?? item.currentJobHeld),
    employment: cleanValue(item.Employment ?? item.employment),
    educational: cleanValue(item.Educational ?? item.educational),
    fieldOfStudy: cleanValue(item.FieldOfStudy ?? item.fieldOfStudy),
    ip: cleanValue(item.IP ?? item.ip),
    mac: cleanValue(item.MacAdderss ?? item.macAdderss),
    raw: item,
  };
}

function mapSecurityUser(item: PersonalApiItem): SecurityUser {
  const row = mapPersonnel(item);

  return {
    id: row.id,
    guid: row.guid,
    fullName: row.fullName,
    username: row.code,
    nationalId: row.nationalId,
    position: row.currentJobHeld !== "-" ? row.currentJobHeld : row.employment,
    roles: [],
  };
}

function createPayload(values: PersonnelFormValues): PersonalCreatePayload {
  return {
    FristName: values.firstName.trim(),
    LastName: values.lastName.trim(),
    Code: values.code.trim(),
  };
}

function editPayload(
  row: PersonnelRow,
  values: PersonnelFormValues
): PersonalEditPayload {
  return {
    FristName: values.firstName.trim(),
    LastName: values.lastName.trim(),
    Code: values.code.trim(),
    Id: row.id,
    Guid: row.guid,
  };
}

export const personalService = {
  async getPersonnel(page = 1, pageSize = DEFAULT_PAGE_SIZE, search = "") {
    const response = await apiClient.post<ApiListResponse<PersonalApiItem>>(
      API_ENDPOINTS.personal.list,
      createListPayload(page, pageSize, search),
      jsonPatchConfig()
    );

    const rows = getArrayData(response.data);

    return {
      rows: rows.map(mapPersonnel).filter((item) => item.id > 0),
      total: getTotal(response.data),
    };
  },

  async createPersonnel(values: PersonnelFormValues): Promise<ApiResponse<unknown>> {
    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.personal.create,
      createPayload(values),
      jsonPatchConfig()
    );

    return response.data;
  },

  async editPersonnel(
    row: PersonnelRow,
    values: PersonnelFormValues
  ): Promise<ApiResponse<unknown>> {
    if (!row.guid) throw new Error("شناسه پرسنل برای ویرایش وجود ندارد.");

    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.personal.edit,
      editPayload(row, values),
      jsonPatchConfig()
    );

    return response.data;
  },

  async deletePersonnel(row: PersonnelRow): Promise<ApiResponse<unknown>> {
    if (!row.guid) throw new Error("شناسه پرسنل برای حذف وجود ندارد.");

    const response = await apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.personal.delete,
      null,
      jsonPatchConfig({
        guid: row.guid,
      })
    );

    return response.data;
  },

  async getUsers(page = 1, pageSize = 10, search = "") {
    const response = await this.getPersonnel(page, pageSize, search);

    return {
      rows: response.rows.map((item) => mapSecurityUser(item.raw as PersonalApiItem)),
      total: response.total,
    };
  },
};

export default personalService;