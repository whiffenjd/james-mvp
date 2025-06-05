"use client"

import { useState } from "react"
import { Table } from "../../Components/Table/Table"
import type { TableColumn, TableAction, PaginationInfo } from "../../types/table"

// Sample Investor type (should match your backend)
interface Investor {
    id: string;
    name: string;
    email: string;
    onboardingStatus: "pending" | "approved" | "rejected";
    createdAt: string;
    status: "pending" | "approved" | "rejected";
}

const TABS = [
    { label: "All", value: "all" },
    { label: "Onboarded", value: "approved" },
    { label: "In Progress", value: "pending" },
];

// Sample data
const sampleData: Investor[] = [
    { id: 1, name: "John Smith", email: "john@example.com", lastActivity: "Apr 12, 2025", status: "In Progress" },
    { id: 2, name: "John Smith", email: "john@example.com", lastActivity: "Apr 12, 2025", status: "Completed" },
    { id: 3, name: "John Smith", email: "john@example.com", lastActivity: "Apr 12, 2025", status: "In Progress" },
    { id: 4, name: "John Smith", email: "john@example.com", lastActivity: "Apr 12, 2025", status: "Completed" },
    { id: 5, name: "John Smith", email: "john@example.com", lastActivity: "Apr 12, 2025", status: "In Progress" },
    { id: 6, name: "John Smith", email: "john@example.com", lastActivity: "Apr 12, 2025", status: "In Progress" },
    { id: 7, name: "John Smith", email: "john@example.com", lastActivity: "Apr 12, 2025", status: "In Progress" },
]

function InvestorsPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const itemsPerPage = 5
    const totalItems = sampleData.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // Simulate pagination
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = sampleData.slice(startIndex, startIndex + itemsPerPage)

    // Define columns
    const columns: TableColumn<Investor>[] = [
        {
            key: "name",
            header: "Investor Name",
            sortable: false,
        },
        {
            key: "email",
            header: "Email Address",
            sortable: false,
        },
        {
            key: "lastActivity",
            header: "Last Activity",
            sortable: false,
        },
        {
            key: "status",
            header: "Status",
            render: (value: string) => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${value === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                >
                    {value}
                </span>
            ),
        },
    ]

    // Define actions
    const actions: TableAction<Investor>[] = [
        {
            label: "View Details",
            variant: "primary",
            onClick: (row) => {
                alert(`Viewing details for ${row.name}`)
            },
        },
        {
            label: "",
            variant: "secondary",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
            ),
            onClick: (row) => {
                if (confirm(`Are you sure you want to delete ${row.name}?`)) {
                    alert(`Deleted ${row.name}`)
                }
            },
        },
    ]

    // Pagination info
    const paginationInfo: PaginationInfo = {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
    }

    const handlePageChange = (page: number) => {
        setLoading(true)
        // Simulate API call delay
        setTimeout(() => {
            setCurrentPage(page)
            setLoading(false)
        }, 500)
    }

    const handleSort = (key: string, direction: "asc" | "desc") => {
        console.log(`Sorting by ${key} in ${direction} order`)
        // Here you would typically make an API call with sort parameters
    }

    return (
        <div >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-theme-primary-text">Investor Management</h1>
                    <p className="mt-2 text-theme-secondary-text">Manage and track investor information</p>
                </div>

                <Table
                    data={paginatedData}
                    columns={columns}
                    actions={actions}
                    pagination={paginationInfo}
                    onPageChange={handlePageChange}
                    onSort={handleSort}
                    loading={loading}
                    emptyMessage="No investors found"
                    className="mb-8"
                />
            </div>
        </div>
    )
}

export default InvestorsPage
