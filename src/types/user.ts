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

export type UserApiImage = {
  fileName?: string | null;
  extension?: string | null;
  size?: number | null;
  data?: string | null;
  url?: string | null;
};

export type UserApiItem = {
  FirstName?: string | null;
  firstName?: string | null;
  LastName?: string | null;
  lastName?: string | null;
  Post?: string | null;
  post?: string | null;
  UserName?: string | null;
  userName?: string | null;
  PasswordHash?: string | null;
  passwordHash?: string | null;
  OrganizationId?: number | null;
  organizationId?: number | null;
  OrganizationTitle?: string | null;
  organizationTitle?: string | null;
  ImageUrl?: string | null;
  imageUrl?: string | null;
  RoleIds?: number[] | null;
  roleIds?: number[] | null;
  Roles?: unknown[] | null;
  roles?: unknown[] | null;
  Image?: UserApiImage | null;
  image?: UserApiImage | null;
  Id?: number | null;
  id?: number | null;
  Guid?: string | null;
  guid?: string | null;
};

export type UserListPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

export type SecurityUser = {
  id: number;
  guid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  password?: string;
  passwordHash: string;
  post: string;
  organizationId: number;
  organizationTitle: string;
  imageUrl: string;
  roleIds: number[];
  roleTitles: string[];
};

export type UserCreatePayload = {
  firstName: string;
  lastName: string;
  post: string;
  userName: string;
  passwordHash: string;
  organizationId: number;
  roleIds: number[];
  image: UserApiImage;
  id: number;
  guid: string;
};

export type UserEditPayload = UserCreatePayload;