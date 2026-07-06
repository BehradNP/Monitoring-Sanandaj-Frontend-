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

export type KendoListPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

export type QrZoneOption = {
  id: number;
  title: string;
};

export type QrCategoryApiItem = {
  Title?: string | null;
  title?: string | null;
  Tag?: string | null;
  tag?: string | null;
  ParentId?: number | null;
  parentId?: number | null;
  hasChildren?: boolean;
  HasChildren?: boolean;
  Id?: number;
  id?: number;
  Guid?: string;
  guid?: string;
};

export type QrCategoryNode = {
  id: number;
  title: string;
  code?: string;
  parentId?: number | null;
  guid?: string;
  children?: QrCategoryNode[];
};

export type QrReportApiRow = {
  IP?: string | null;
  ip?: string | null;
  MacAdderss?: string | null;
  macAdderss?: string | null;
  MAC?: string | null;
  mac?: string | null;
  FristName?: string | null;
  fristName?: string | null;
  FirstName?: string | null;
  firstName?: string | null;
  LastName?: string | null;
  lastName?: string | null;
  FullName?: string | null;
  fullName?: string | null;
  NationalId?: string | null;
  nationalId?: string | null;
  Code?: string | null;
  code?: string | null;
  UserName?: string | null;
  userName?: string | null;
  Username?: string | null;
  username?: string | null;
  Title?: string | null;
  title?: string | null;
  FaTitle?: string | null;
  faTitle?: string | null;
  PersianTitle?: string | null;
  persianTitle?: string | null;
  ComputerName?: string | null;
  computerName?: string | null;
  Tag?: string | null;
  tag?: string | null;
  Number?: string | number | null;
  number?: string | number | null;
  Id?: number;
  id?: number;
  Guid?: string;
  guid?: string;
  [key: string]: unknown;
};

export type QrReportRow = {
  id: number;
  guid?: string;
  ip: string;
  mac: string;
  fullName: string;
  nationalId: string;
  userName: string;
  faTitle: string;
  computerName: string;
  number: string;
};

export type QrReportSearchParams = {
  zoneId?: number | "";
  categoryId?: number | "";
  tableId?: string;
  startIp?: string;
  endIp?: string;
};