"use client"
import type { TableColumn } from "../../types/table"

interface TableHeaderProps<T> {
    columns: TableColumn<T>[]
    hasActions: boolean
    sortKey: string | null
    sortDirection: "asc" | "desc" | null
    onSort: (key: string) => void
    useThemeStyles?: boolean;

}

export function TableHeader<T>({ columns, hasActions, sortKey, sortDirection, onSort, useThemeStyles = true }: TableHeaderProps<T>) {
    const baseBgClass = useThemeStyles ? "bg-theme-card" : "bg-theme-card";
    const borderClass = useThemeStyles ? "border-theme-sidebar-accent" : "border-primary";
    const textClass = useThemeStyles ? "text-theme-sidebar-accent" : "text-primary";

    return (
        <div className={`${baseBgClass} border rounded-md ${borderClass} w-full box-border`}>
            <div
                className="grid gap-4 px-6 py-4 items-center w-full"
                style={{
                    gridTemplateColumns: columns.map(col => col.width || '1fr').join(' ') + (hasActions ? ' auto' : ''),
                    boxSizing: 'border-box',
                }}
            >
                {columns.map((column, index) => (
                    <div
                        key={index}
                        className={`
              text-sm font-semibold ${textClass} uppercase tracking-wider overflow-hidden
              ${column.align === "center" ? "text-center" : ""}
              ${column.align === "right" ? "text-right" : "text-left"}
              ${column.sortable ? "cursor-pointer select-none" : ""}
            `}
                        onClick={() => column.sortable && onSort(column.key as string)}
                    >
                        <div className="flex items-center gap-2">
                            <span className="truncate" title={column.header}>
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
                    <div className={`text-sm font-semibold ${textClass}  uppercase tracking-wider text-right`}>
                        Actions
                    </div>
                )}
            </div>
        </div>
    );
}