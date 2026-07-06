export type GeneralReportTabKey =
  | "cpu"
  | "gpu"
  | "mobo"
  | "ram"
  | "hdd"
  | "hw"
  | "sw"
  | "os";

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

export type GeneralReportPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

export type GeneralReportRow = {
  ZoneNetworkTitle?: string | null;
  IP?: string | null;
  MacAdderss?: string | null;
  UserName?: string | null;

  Caption?: string | null;
  BuildNumber?: string | null;
  Manufacturer?: string | null;
  InstallDate?: string | null;
  LastBootUpTime?: string | null;
  OSArchitecture?: string | null;
  SerialNumber?: string | null;
  RegisteredUser?: string | null;
  Version?: string | null;

  CPU?: string | null;
  CPUProcessorId?: string | null;
  CPUManufacturer?: string | null;
  CPUNumberOfLogicalProcessors?: string | null;
  CPUNArchitecture?: string | null;
  CPUNumberOfCores?: string | null;

  VGAVideoProcessor?: string | null;
  VGAname?: string | null;
  VGAVideoModeDescription?: string | null;
  VGAStatus?: string | null;
  VGAAdapterRAM?: string | null;

  RAMPartNumber?: string | null;
  RAMMemoryType?: string | null;
  RAMSpeed?: string | null;
  RAMCapacity?: string | null;
  RAMManufacturer?: string | null;

  Device?: string | null;
  Title?: string | null;

  Id?: number;
  Guid?: string;

  [key: string]: unknown;
};