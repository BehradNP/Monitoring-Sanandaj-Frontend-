export type ServerStatus = "ONLINE" | "OFFLINE";

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

export type CupServerInfoItem = {
  id: number;
  title: string;
  ip: string;
  isOnline: boolean;
  avgCup: number;
  timeSc: number;
  totalRam: number;
  avgCRam: number;
  avgHDD: number;
  order: number;
  guid?: string;

  Id?: number;
  Title?: string | null;
  IP?: string | null;
  IsOnline?: boolean;
  AvgCup?: number | null;
  TimeSc?: number | null;
  TotalRam?: number | null;
  AvgCRam?: number | null;
  AvgHDD?: number | null;
  Order?: number | null;
  Guid?: string | null;
};

export type CupServerInfoData = {
  countOnline: number;
  countOffline: number;
  avgCup: number;
  avgCRam: number;
  order: number;
  lists: CupServerInfoItem[];

  CountOnline?: number;
  CountOffline?: number;
  AvgCup?: number;
  AvgCRam?: number;
  Order?: number;
  Lists?: CupServerInfoItem[];
};

export type CupServerInfoResponse = ApiResponse<CupServerInfoData>;

export type ServerStatusRow = {
  id: number;
  guid?: string;
  name: string;
  ip: string;
  status: ServerStatus;
  cpu: number;
  ram: number;
  disk: number;
  interval: number;
  order: number;
  username?: string;
  raw?: CupServerInfoItem;
};

export type Server = {
  id: number;
  guid?: string;
  title?: string;
  name: string;
  ip: string;
  status: "online" | "offline";
  cpu: number;
  ram: number;
  disk: number;
  interval: number;
  order: number;
  username: string;
  raw?: CupServerInfoItem;
};