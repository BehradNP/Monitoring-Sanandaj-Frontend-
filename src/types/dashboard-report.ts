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

export type DashboardRadioItem = {
  source: string;
  info: string;
  dst: string;
};

export type DashboardReportZoneItem = {
  tagid?: number | string | null;
  borderRadius: number;
  borderWidth: number;
  data: number[];
  label: string;
  borderColor: string;
  backgroundColor: string;
  borderSkipped: boolean;
};

export type DashboardReportOsItem = {
  lable: string;
  label: string;
  color: string;
  count: number;
  value?: number;
  data?: unknown;
  datasets?: unknown;
  raw?: unknown;
};

export type DashboardReportHardItem = {
  lable: string;
  label: string;
  color: string;
  count?: number;
  value?: number;
  total?: number;
  data?: unknown;
  datasets?: unknown;
  raw?: unknown;
};

export type DashboardReportData = {
  redio: number;
  online: number;
  detials: number;
  all: number;
  redioList: DashboardRadioItem[];
  reportZone: DashboardReportZoneItem[];
  reportOs: DashboardReportOsItem[];
  reportHard: DashboardReportHardItem[];
};