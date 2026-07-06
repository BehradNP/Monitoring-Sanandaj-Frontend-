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
  code?: string;
  parentId: number | null;
  hasChildren: boolean;
  guid?: string;
  children: HierarchyItem[];
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