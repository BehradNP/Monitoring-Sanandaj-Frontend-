export type ApiListResponse<T> = {
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

export type ApiResponse<T> = {
  data?: T;
  Data?: T;
  isSuccess?: boolean;
  issuccess?: boolean;
  statusCode?: number;
  statuscode?: number;
  message?: string;
  Message?: string;
};

export type PersonalApiItem = {
  FristName?: string | null;
  fristName?: string | null;
  FirstName?: string | null;
  firstName?: string | null;
  LastName?: string | null;
  lastName?: string | null;
  Code?: string | null;
  code?: string | null;
  IP?: string | null;
  ip?: string | null;
  MacAdderss?: string | null;
  macAdderss?: string | null;
  FatherName?: string | null;
  fatherName?: string | null;
  BrithDay?: string | null;
  brithDay?: string | null;
  IDNumer?: string | null;
  idNumer?: string | null;
  NationalId?: string | null;
  nationalId?: string | null;
  BrithPalce?: string | null;
  brithPalce?: string | null;
  Gender?: string | null;
  gender?: string | null;
  Sex?: string | null;
  sex?: string | null;
  Educational?: string | null;
  educational?: string | null;
  FieldOfStudy?: string | null;
  fieldOfStudy?: string | null;
  Employment?: string | null;
  employment?: string | null;
  CurrentJobHeld?: string | null;
  currentJobHeld?: string | null;
  Id?: number;
  id?: number;
  Guid?: string;
  guid?: string;
};

export type PersonalListPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

export type PersonalCreatePayload = {
  fristName: string;
  lastName: string;
  code: string;
};

export type PersonalEditPayload = {
  id: number;
  guid: string;
  fristName: string;
  lastName: string;
  code: string;
};

export type Role = "مدیر" | "مانیتورینگ" | "گزارش گیری" | "نمایش ساده";

export type SecurityUser = {
  id: number;
  guid?: string;
  fullName: string;
  username: string;
  nationalId: string;
  password?: string;
  position: string;
  roles: Role[];
};