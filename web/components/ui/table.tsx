"use client";

import { type ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

export type SortDirection = "asc" | "desc" | null;

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  sort?: SortState;
  onSort?: (key: string) => void;
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ChevronUp size={14} />;
  if (direction === "desc") return <ChevronDown size={14} />;
  return <ChevronsUpDown size={14} className="opacity-40" />;
}

export function Table<T>({
  columns,
  data,
  sort,
  onSort,
  keyExtractor,
  emptyMessage = "No data available",
  className = "",
}: TableProps<T>) {
  return (
    <div
      className={`overflow-x-auto border border-white/[0.06] rounded-xl ${className}`}
    >
      <table className="w-full text-sm table-striped">
        <thead>
          <tr className="bg-white/[0.04]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500
                  ${col.sortable && onSort ? "cursor-pointer select-none hover:text-zinc-300 transition-colors" : ""}
                  ${col.className || ""}
                `}
                onClick={
                  col.sortable && onSort
                    ? () => onSort(col.key)
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.label}
                  {col.sortable && onSort && (
                    <SortIcon
                      direction={
                        sort?.key === col.key ? sort.direction : null
                      }
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-zinc-600"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row, idx)}
                className="hover:bg-white/[0.03] transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-zinc-300 ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
