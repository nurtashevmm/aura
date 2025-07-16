"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";
import { FiChevronDown, FiChevronUp, FiClock, FiAlertCircle } from "react-icons/fi";

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = "Нет данных",
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' }>({ 
    key: null, 
    direction: 'asc' 
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue === bValue) return 0;
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      return aValue > bValue ? direction : -direction;
    });
  }, [data, sortConfig]);

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (loading) {
    return (
      <div className={clsx("space-y-4", className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <FiAlertCircle className="mx-auto text-3xl mb-2" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={clsx("overflow-hidden rounded-lg shadow-neo-out", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50 text-left text-sm text-zinc-400">
              {columns.map((col) => (
                <th 
                  key={col.key as string}
                  className={clsx(
                    "px-4 py-3 font-medium",
                    col.sortable && "cursor-pointer hover:text-white",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortConfig.key === col.key && (
                      <span>
                        {sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sortedData.map((row) => (
              <tr 
                key={String(row[keyField])}
                className={clsx(
                  "hover:bg-zinc-800/50 transition-colors",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    {col.render 
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '—')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper component for status badges
export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const statusMap: Record<string, { text: string; color: string }> = {
    active: { text: 'Активна', color: 'bg-green-500/20 text-green-400' },
    pending: { text: 'Ожидание', color: 'bg-yellow-500/20 text-yellow-400' },
    completed: { text: 'Завершена', color: 'bg-blue-500/20 text-blue-400' },
    cancelled: { text: 'Отменена', color: 'bg-red-500/20 text-red-400' },
  };

  const { text, color } = statusMap[status] || { text: status, color: 'bg-zinc-800/50' };

  return (
    <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", color, className)}>
      {text}
    </span>
  );
}

// Helper component for duration display
export function DurationDisplay({ minutes }: { minutes: number }) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return (
    <div className="flex items-center gap-1 text-sm">
      <FiClock className="text-zinc-400" />
      {hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`}
    </div>
  );
}
