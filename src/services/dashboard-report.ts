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
  tagid: number | null;
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
  label?: string;
  color: string;
  count: number;
};

export type DashboardReportHardItem = {
  lable: string;
  label?: string;
  color: string;
  datasets: unknown[];
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