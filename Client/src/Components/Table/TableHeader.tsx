"use client"
import type { TableColumn } from "../../types/table"

interface TableHeaderProps<T> {
    columns: TableColumn<T>[]
    hasActions: boolean
    sortKey: string | null
    sortDirection: "asc" | "desc" | null
    onSort: (key: string) => void
}

export function TableHeader<T>({ columns, hasActions, sortKey, sortDirection, onSort }: TableHeaderProps<T>) {
    return (
        <div className="bg-theme-card border rounded-md border-theme-sidebar-accent">
            <div
                className="grid gap-4 px-6 py-4"
                style={{ gridTemplateColumns: `repeat(${columns.length + (hasActions ? 1 : 0)}, 1fr)` }}
            >
                {columns.map((column, index) => (
                    <div
                        key={index}
                        className={`
              text-left text-sm font-semibold text-theme-sidebar-accent uppercase tracking-wider
              ${column.align === "center" ? "text-center" : ""}
              ${column.align === "right" ? "text-right" : ""}
              ${column.sortable ? "cursor-pointer  select-none" : ""}
            `}
                        onClick={() => column.sortable && onSort(column.key as string)}
                    >
                        <div className="flex items-center gap-2">
                            {column.header}
                            {column.sortable && (
                                <div className="flex flex-col">
                                    <svg
                                        className={`w-3 h-3 ${sortKey === column.key && sortDirection === "asc" ? "text-slate-900" : "text-slate-400"
                                            }`}
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
                    <div className="text-left text-sm font-semibold text-theme-sidebar-accent uppercase tracking-wider">Actions</div>
                )}
            </div>
        </div>
    )
}
