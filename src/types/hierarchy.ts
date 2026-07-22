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
  isSuccess?: boolean;
  issuccess?: boolean;
  message?: string;
  Message?: string;
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

export type HierarchyApiItem = {
  Title?: string;
  title?: string;
  Tag?: string;
  tag?: string;
  ParentId?: number | null;
  parentId?: number | null;
  hasChildren?: boolean;
  HasChildren?: boolean;
  Id?: number;
  id?: number;
  Guid?: string;
  guid?: string;
};

export type HierarchyItem = {
  id: string;
  numericId: number;
  title: string;
  code: string;
  parentId: number | null;
  hasChildren: boolean;
  guid: string;
  children: HierarchyItem[];
};

export type HierarchyData = {
  tree: HierarchyItem[];
  flat: HierarchyItem[];
  total: number;
};

export type CategoryListPayload = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
  sort: unknown[];
  group: unknown[];
  filter: unknown | null;
};

export type HierarchyFormValues = {
  title: string;
  code: string;
  parentId: number | null;
};

export type CategoryCreatePayload = {
  title: string;
  tag: string;
  parentId: number | null;
};

export type CategoryEditPayload = {
  title: string;
  tag: string;
  parentId: number | null;
  hasChildren: boolean;
  id: number;
  guid: string;
};