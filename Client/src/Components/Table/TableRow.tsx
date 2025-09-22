// TableRow.tsx
"use client"
import type { TableColumn, TableAction } from "../../types/table"

interface TableRowProps<T> {
    row: T
    columns: TableColumn<T>[]
    actions?: TableAction<T>[]
    index: number
    useThemeStyles?: boolean
    gridColumns: string
}

export function TableRow<T>({
    row,
    columns,
    actions,
    index,
    useThemeStyles = true,
    gridColumns
}: TableRowProps<T>) {
    const buttonClass = useThemeStyles ? "bg-theme-sidebar-accent" : "bg-primary";

    const getNestedValue = (obj: any, path: string) => {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    return (
        <div
            className="grid gap-4 px-4 py-4 items-center w-full min-w-0"
            style={{
                gridTemplateColumns: gridColumns,
                minWidth: '800px', // Ensure minimum width for proper layout
            }}
        >
            {columns.map((column, colIndex) => {
                const value = getNestedValue(row, column.key as string);

                return (
                    <div
                        key={colIndex}
                        className={`
                            text-sm text-slate-900 min-w-0
                            ${column.align === "center" ? "text-center" : ""}
                            ${column.align === "right" ? "text-right" : "text-left"}
                        `}
                    >
                        {column.render ? (
                            <div className="min-w-0">
                                {column.render(value, row, index)}
                            </div>
                        ) : (
                            <div className="truncate min-w-0" title={String(value || '')}>
                                {value}
                            </div>
                        )}
                    </div>
                );
            })}
            {actions && actions.length > 0 && (
                <div className="text-sm text-right min-w-0">
                    <div className="flex items-center gap-2 justify-end">
                        {actions
                            .filter((action) => !action.show || action.show(row))
                            .map((action, actionIndex) => (
                                <button
                                    key={actionIndex}
                                    onClick={() => action.onClick(row, index)}
                                    className={`
                                        inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium
                                        transition-transform duration-200 ease-in-out flex-shrink-0 whitespace-nowrap
                                        ${action.variant === "primary"
                                            ? `${buttonClass} text-white`
                                            : action.variant === "danger"
                                                ? "bg-red-600 text-white"
                                                : "bg-slate-200 text-slate-700"
                                        }
                                        hover:scale-105
                                    `}
                                >
                                    {action.icon}
                                    <span>{action.label}</span>
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}