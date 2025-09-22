// TableHeader.tsx
"use client"
import type { TableColumn } from "../../types/table"

interface TableHeaderProps<T> {
    columns: TableColumn<T>[]
    hasActions: boolean
    sortKey: string | null
    sortDirection: "asc" | "desc" | null
    onSort: (key: string) => void
    useThemeStyles?: boolean
    gridColumns: string
}

export function TableHeader<T>({
    columns,
    hasActions,
    sortKey,
    sortDirection,
    onSort,
    useThemeStyles = true,
    gridColumns
}: TableHeaderProps<T>) {
    const baseBgClass = useThemeStyles ? "bg-theme-card" : "bg-theme-card";
    const borderClass = useThemeStyles ? "border-theme-sidebar-accent" : "border-primary";
    const textClass = useThemeStyles ? "text-theme-sidebar-accent" : "text-primary";

    return (
        <div className={`${baseBgClass} border rounded-md ${borderClass} w-full`}>
            <div
                className="grid gap-4 px-4 py-4 items-center w-full min-w-0"
                style={{
                    gridTemplateColumns: gridColumns,
                    minWidth: '800px', // Ensure minimum width for proper layout
                }}
            >
                {columns.map((column, index) => (
                    <div
                        key={index}
                        className={`
                            text-sm font-semibold ${textClass} uppercase tracking-wider min-w-0
                            ${column.align === "center" ? "text-center" : ""}
                            ${column.align === "right" ? "text-right" : "text-left"}
                            ${column.sortable ? "cursor-pointer select-none" : ""}
                        `}
                        onClick={() => column.sortable && onSort(column.key as string)}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate flex-1 min-w-0" title={column.header}>
                                {column.header}
                            </span>
                            {column.sortable && (
                                <div className="flex flex-col flex-shrink-0">
                                    <svg
                                        className={`w-3 h-3 ${sortKey === column.key && sortDirection === "asc" ? "text-slate-900" : "text-slate-400"}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {hasActions && (
                    <div className={`text-sm font-semibold ${textClass} uppercase tracking-wider text-right min-w-0`}>
                        <span className="truncate">Actions</span>
                    </div>
                )}
            </div>
        </div>
    );
}