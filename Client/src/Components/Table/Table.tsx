"use client"

import { useState } from "react"
import type { TableProps, SortDirection } from "../../types/table"
import { TableHeader } from "./TableHeader"
import { TableRow } from "./TableRow"
import { Pagination } from "./Pagination"
import { LoadingSpinner } from "./LoadingSpinner"
import { EmptyState } from "./EmptyState"

export function Table<T = any>({
    data,
    columns,
    actions = [],
    pagination,
    onPageChange,
    onSort,
    loading = false,
    emptyMessage = "No data available",
    className = "",
    useThemeStyles = true,

}: TableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const handleSort = (key: string) => {
        let newDirection: SortDirection = "asc";

        if (sortKey === key) {
            newDirection = sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc";
        }

        setSortKey(newDirection ? key : null);
        setSortDirection(newDirection);

        if (onSort && newDirection) {
            onSort(key, newDirection);
        }
    };

    const hasActions = actions.length > 0;
    const baseBgClass = useThemeStyles ? "bg-theme-card" : "bg-theme-card";
    const borderClass = useThemeStyles ? "border-theme-sidebar-accent" : "border-primary";


    return (
        <div className={`space-y-4 w-full ${className}`}>
            {/* Floating Header */}
            <div className={`${baseBgClass} shadow-sm rounded-md overflow-hidden w-full`}>
                <TableHeader
                    columns={columns}
                    hasActions={hasActions}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    useThemeStyles={useThemeStyles}
                />
            </div>

            {/* Floating Rows */}
            <div className="space-y-3">
                {loading ? (
                    <div className={`${baseBgClass} shadow-sm rounded-md border ${borderClass}`}>
                        <LoadingSpinner />
                    </div>
                ) : data.length === 0 ? (
                    <div className={`${baseBgClass} shadow-sm rounded-md border ${borderClass}`}>
                        <EmptyState message={emptyMessage} />
                    </div>
                ) : (
                    data.map((row, index) => (
                        <div
                            key={index}
                            className={`${baseBgClass} shadow-sm rounded-md border ${borderClass} overflow-hidden hover:shadow-md transition-shadow`}
                        >
                            <TableRow row={row} columns={columns} actions={actions} index={index} />
                        </div>
                    ))
                )}
            </div>

            {pagination && onPageChange && (
                <div className={`${baseBgClass} shadow-sm rounded-md border ${borderClass} overflow-hidden`}>
                    <Pagination pagination={pagination} onPageChange={onPageChange} useThemeStyles={useThemeStyles} />
                </div>
            )}
        </div>
    )
}