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
};

export type CupServerInfoData = {
  countOnline: number;
  countOffline: number;
  avgCup: number;
  avgCRam: number;
  order: number;
  lists: CupServerInfoItem[];
};

export type ServerStatus = "ONLINE" | "OFFLINE";

export type ServerStatusRow = {
  id: number;
  name: string;
  status: ServerStatus;
  ip: string;
  cpu: number;
  ram: number;
};