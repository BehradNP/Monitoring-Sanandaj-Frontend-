export type NetworkLocationStatus = "ONLINE" | "OFFLINE";

export type NetworkLocation = {
  id: string;
  title: string;
  ip: string;
  hostname: string;
  status: NetworkLocationStatus;
  sourceLat: number;
  sourceLng: number;
  dstLat: number;
  dstLng: number;
  sourceGps: string;
  dstGps: string;
  infoHtml: string;
};

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
  message?: string | null;
  Message?: string | null;
};

export type LocationRouterApiItem = {
  Title?: string | null;
  title?: string | null;
  Location?: string | null;
  location?: string | null;
  Id?: number | null;
  id?: number | null;
  Guid?: string | null;
  guid?: string | null;
};

export type LocationRouterItem = {
  id: number;
  guid: string;
  title: string;
  location: string;
  lat: number | null;
  lng: number | null;
  isValidLocation: boolean;
};

export type LocationRouterFormValues = {
  title: string;
  lat: string;
  lng: string;
};

export type LocationRouterCreatePayload = {
  title: string;
  location: string;
};

export type LocationRouterEditPayload = {
  title: string;
  location: string;
  id: number;
  guid: string;
};

export type LocationRouterListPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};