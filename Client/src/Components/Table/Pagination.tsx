"use client"
import type { PaginationInfo } from "../../types/table"

interface PaginationProps {
    pagination: PaginationInfo
    onPageChange: (page: number) => void
    useThemeStyles?: boolean;

}

export function Pagination({ pagination, onPageChange, useThemeStyles = true }: PaginationProps) {
    const baseBgClass = useThemeStyles ? "bg-theme-card" : "bg-theme-card";
    const borderClass = useThemeStyles ? "border-theme-sidebar-accent" : "border-primary";
    const textClass = useThemeStyles ? "text-theme-sidebar-accent" : "text-primary";
    const { currentPage, totalPages, totalItems, itemsPerPage } = pagination

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const startPage = Math.max(1, currentPage - 2)
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

            if (startPage > 1) {
                pages.push(1)
                if (startPage > 2) pages.push("...")
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }
    // if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-theme-card">
            <div className="text-sm text-theme-secondary-text">
                Showing {startItem} to {endItem} of {totalItems} results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium text-theme-secondary-text bg-white  border ${borderClass} rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Previous
                </button>

                {getPageNumbers().map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === "number" && onPageChange(page)}
                        disabled={page === "..."}
                        className={`
              px-3 py-2 text-sm font-medium rounded-md
              ${page === currentPage
                                ? `border ${borderClass}  text-theme-sidebar-accent`
                                : page === "..."
                                    ? "text-slate-400 cursor-default"
                                    : "text-theme-secondary-text bg-white border border-slate-300 hover:bg-slate-50"
                            }
            `}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium text-theme-secondary-text bg-white border ${borderClass} rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    Next
                </button>
            </div>
        </div>
    )
}
