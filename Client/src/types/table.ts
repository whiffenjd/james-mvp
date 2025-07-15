import type React from "react";
export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (row: T, index: number) => void;
  variant?: "primary" | "secondary" | "danger" | undefined;
  icon?: React.ReactNode;
  show?: (row: T) => boolean;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export type SortDirection = "asc" | "desc" | null;
