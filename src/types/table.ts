import type { ReactNode } from "react";

export type Column<T> = {
  key: keyof T;
  header: string;
  align?: "left" | "right";
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
};
