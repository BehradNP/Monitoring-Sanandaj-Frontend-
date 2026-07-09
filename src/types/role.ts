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

export type RoleApiItem = {
  Title?: string | null;
  title?: string | null;
  Id?: number | null;
  id?: number | null;
  Guid?: string | null;
  guid?: string | null;
};

export type RoleOption = {
  id: number;
  guid: string;
  title: string;
};