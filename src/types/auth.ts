export type ApiResponse<T = unknown> = {
  issuccess?: boolean;
  isSuccess?: boolean;
  statuscode?: number;
  statusCode?: number;
  message?: string;
  Message?: string;
  data?: T;
  Data?: T;
  token?: string;
  Token?: string;
  accessToken?: string;
  AccessToken?: string;
  access_token?: string;
  jwt?: string;
  Jwt?: string;
  [key: string]: unknown;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResult = {
  token: string;
  raw: unknown;
};

export type AuthUserProfile = {
  Id?: number;
  id?: number;
  Guid?: string;
  guid?: string;
  UserName?: string;
  userName?: string;
  Username?: string;
  username?: string;
  FullName?: string;
  fullName?: string;
  Name?: string;
  name?: string;
  FirstName?: string;
  firstName?: string;
  LastName?: string;
  lastName?: string;
  Role?: string;
  role?: string;
  [key: string]: unknown;
};