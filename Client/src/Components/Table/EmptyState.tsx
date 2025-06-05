interface EmptyStateProps {
    message: string
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="text-center py-12">
            <div className="text-theme-secondary-text mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
                    />
                </svg>
            </div>
            <p className="text-slate-500 text-sm">{message}</p>
        </div>
    )
}
