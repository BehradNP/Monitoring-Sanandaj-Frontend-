export type HardwareMonitoringTab = "network" | "devices";

export type HardwareMonitoringRow = {
  id: number;
  guid: string;
  ip: string;
  mac: string;
  name: string;
  nationalId: string;
  username: string;
  pcFa: string;
  pcEn: string;
  number: number | string;
  raw?: unknown;
};

export type IPNetworkPersonalApiItem = {
  IP?: string | null;
  MacAdderss?: string | null;
  PersonalFristName?: string | null;
  PersonalLastName?: string | null;
  PersonalNationalId?: string | null;
  UserName?: string | null;
  TagFull?: string | null;
  TagFullEN?: string | null;
  Id?: number | null;
  Guid?: string | null;
};

export type PersonalApiItem = {
  FristName?: string | null;
  LastName?: string | null;
  Code?: string | null;
  IP?: string | null;
  MacAdderss?: string | null;
  FatherName?: string | null;
  BrithDay?: string | null;
  IDNumer?: string | null;
  NationalId?: string | null;
  BrithPalce?: string | null;
  Gender?: string | null;
  Sex?: string | null;
  Educational?: string | null;
  FieldOfStudy?: string | null;
  Employment?: string | null;
  CurrentJobHeld?: string | null;
  Id?: number | null;
  Guid?: string | null;
};

export type CategoryApiItem = {
  Title?: string | null;
  Tag?: string | null;
  ParentId?: number | null;
  hasChildren?: boolean | null;
  Id?: number | null;
  Guid?: string | null;
};

export type PersonalOption = {
  id: number;
  guid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalId: string;
  code: string;
  currentJobHeld: string;
  label: string;
  subLabel: string;
  searchText: string;
  raw?: unknown;
};

export type CategoryOption = {
  id: number;
  guid: string;
  title: string;
  tag: string;
  parentId: number | null;
  hasChildren: boolean;
  level: number;
  label: string;
  subLabel: string;
  searchText: string;
  raw?: unknown;
};

export type HardwareMonitoringApiListResponse<T> = {
  Data?: T[];
  data?: T[];
  Total?: number;
  total?: number;
  Group?: unknown;
  Aggregates?: unknown;
  Errors?: unknown;
  errors?: unknown;
  isSuccess?: boolean;
  issuccess?: boolean;
  statusCode?: number;
  statuscode?: number;
  message?: string;
  Message?: string;
};

export type NormalizedHardwareMonitoringList<T> = {
  rows: T[];
  total: number;
  isSuccess: boolean;
  message: string;
};

export type EditPersonalIPNetworkPayload = {
  personalId: number;
  categoryId: number;
  id: number;
  guid: string;
};

export type HardwareDetailApiItem = {
  [key: string]: unknown;
  ZoneNetworkTitle?: string | null;
  IP?: string | null;
  MacAdderss?: string | null;
  UserName?: string | null;
  Title?: string | null;
  Id?: number | null;
  Guid?: string | null;
};

export type HardwareInfoField = {
  label: string;
  value: string;
};

export type SoftwareInfoItem = {
  id: number;
  guid: string;
  title: string;
  ip: string;
  mac: string;
  zone: string;
  username: string;
};

export type HardwareSystemDetails = {
  cpu: HardwareInfoField[];
  ram: HardwareInfoField[];
  motherboard: HardwareInfoField[];
  hdd: HardwareInfoField[];
  vga: HardwareInfoField[];
  software: SoftwareInfoItem[];
};