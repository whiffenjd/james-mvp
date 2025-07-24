'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2, Bell, DollarSign, FileText, TrendingUp } from 'lucide-react';
import {
    useGetNotifications,
    useMarkNotificationAsRead,
    useDeleteNotification,
    type Notification,
    useMarkAllNotificationsAsRead,
} from '../../API/Endpoints/Notification/notification';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';

// Utility functions (unchanged from your code)
const getIconForEntityType = (entityType: string) => {
    switch (entityType) {
        case 'capital_call':
            return <DollarSign className='w-5 h-5' />;
        case 'distribution':
            return <TrendingUp className='w-5 h-5' />;
        case 'fund_report':
            return <FileText className='w-5 h-5' />;
        default:
            return <Bell className='w-5 h-5' />;
    }
};

const getIconColorForEntityType = (entityType: string) => {
    switch (entityType) {
        case 'capital_call':
            return 'bg-blue-100 text-blue-600';
        case 'distribution':
            return 'bg-green-100 text-green-600';
        case 'fund_report':
            return 'bg-purple-100 text-purple-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

const groupNotificationsByDate = (notifications: Notification[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: Notification[] } = {
        Today: [],
        Yesterday: [],
        Earlier: [],
    };

    notifications.forEach((notification) => {
        const notificationDate = new Date(notification.timestamp);
        const isToday = notificationDate.toDateString() === today.toDateString();
        const isYesterday = notificationDate.toDateString() === yesterday.toDateString();

        if (isToday) {
            groups.Today.push(notification);
        } else if (isYesterday) {
            groups.Yesterday.push(notification);
        } else {
            groups.Earlier.push(notification);
        }
    });

    return groups;
};

export default function NotificationsScreen() {
    const { user } = useAuth();
    const userId = user?.id;
    const [activeTab, setActiveTab] = useState('All');
    const [selectedType, setSelectedType] = useState('Type');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1); // For pagination
    const navigate = useNavigate();


    const tabs = ['All', 'Read', 'Unread'];
    const typeOptions = [
        { label: 'All Types', value: 'Type' },
        { label: 'Capital Call', value: 'capital_call' },
        { label: 'Distribution', value: 'distribution' },
        { label: 'Fund Report', value: 'fund_report' },
    ];

    // Fetch notifications
    const queryParams = {
        userId: user?.id ?? '',
        limit: 10,
        offset: (page - 1) * 10,
        entityType:
            selectedType !== 'Type'
                ? (selectedType as 'capital_call' | 'distribution' | 'fund_report')
                : undefined,
    };

    const {
        data: notificationsData,
        isLoading,
        refetch,
    } = useGetNotifications(queryParams);

    const notifications = notificationsData?.data || [];
    const totalPages = notificationsData?.totalPages || 1;

    const filteredNotifications = React.useMemo(() => {
        if (!notifications) return [];

        return notifications.filter((n: any) => {
            if (activeTab === 'Read') return n.isRead;
            if (activeTab === 'Unread') return !n.isRead;
            return true; // All
        });
    }, [notifications, activeTab]);



    // Mutations for marking as read and deleting
    const markAsReadMutation = useMarkNotificationAsRead();
    const deleteNotificationMutation = useDeleteNotification();
    const markAllAsRead = useMarkAllNotificationsAsRead();


    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Refetch notifications when tab, type, or page changes
    useEffect(() => {
        refetch();
    }, [selectedType, page, refetch]);


    const groupedNotifications = groupNotificationsByDate(filteredNotifications);

    const handleTypeSelect = (value: string) => {
        setSelectedType(value);
        setIsDropdownOpen(false);
        setPage(1); // Reset to first page on filter change
    };

    const handleMarkAsRead = (notificationId: string) => {
        if (userId)
            markAsReadMutation.mutate({ userId, notificationId });
    };

    const handleDelete = (notificationId: string) => {
        if (userId)
            deleteNotificationMutation.mutate({ userId, notificationId });

    };

    const handleMarkAllRead = () => {
        if (user?.id) {
            markAllAsRead.mutate({ userId: user.id });
        }
    };
    const handleVisitFund = (navigate: any, notificationId: string, userRole?: string, fundId?: string) => {
        const basePath =
            userRole === "fundManager"
                ? "/fundmanager/dashboard/project"
                : "/investor/dashboard/project";
        handleMarkAsRead(notificationId)
        navigate(`${basePath}/${fundId}`);
    };

    return (
        <div className='w-full mx-auto  !overflow-hidden'>
            {/* Header */}
            <div className='flex justify-between items-center'>

                <h1 className='text-2xl font-semibold text-theme-primary-text mb-6'>Notifications</h1>
                {filteredNotifications.some(notification => !notification.isRead) && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={markAllAsRead.isPending}
                        className={`flex items-center gap-2 px-4 py-1 rounded-md border transition 
            ${!markAllAsRead.isPending
                                ? "bg-theme-card hover:bg-theme-sidebar-accent hover:text-white border-theme-sidebar-accent text-theme-primary-text"
                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            }
        `}
                    >
                        {markAllAsRead.isPending ? 'Processing...' : 'Mark All as Read'}
                    </button>
                )}

            </div>

            {/* Tabs and Filter */}
            <div className='flex items-center justify-between mb-6 border-b border-gray-400'>
                <div className='flex space-x-1'>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setPage(1); // Reset to first page on tab change
                            }}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                                ? 'border-b-2 border-theme-sidebar-accent'
                                : 'text-theme-secondary-text hover:text-theme-primary-text hover:bg-gray-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Custom Dropdown */}
                <div className='relative' ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className='flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-lg  hover:bg-gray-50 transition-colors'
                    >
                        <span className='text-sm text-theme-primary-text'>{selectedType}</span>
                        <ChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10'>
                            <div className='py-1'>
                                {typeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleTypeSelect(option.value)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedType === option.value
                                            ? 'bg-blue-50 text-theme-sidebar-accent'
                                            : 'text-theme-primary-text'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {isLoading ? (
                <div className='space-y-4 py-6'>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-4 rounded-lg border-[0.5px] border-[#00000066]/40 animate-pulse "
                        >
                            {/* Icon skeleton */}
                            <div className="w-10 h-10 rounded-full bg-gray-200" />

                            {/* Content skeleton */}
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>

                            {/* Time & actions skeleton */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="h-3 w-14 bg-gray-200 rounded" />
                                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                                <div className="h-3 w-10 bg-gray-100 rounded" />
                                <div className="w-4 h-4 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative min-h-[15vh] max-h-[57vh] overflow-y-auto pr-2 space-y-6">
                    {Object.entries(groupedNotifications).map(([dateGroup, notifications]) => {
                        if (notifications.length === 0) return null;

                        return (
                            <div key={dateGroup}>
                                <h2 className='text-sm font-medium text-theme-secondary-text mb-3'>
                                    {dateGroup}
                                </h2>
                                <div className='space-y-2'>
                                    {notifications.map((notification) => {
                                        const isMarkingAsRead = markAsReadMutation.isPending &&
                                            markAsReadMutation.variables?.notificationId === notification.id;
                                        const isDeleting = deleteNotificationMutation.isPending &&
                                            deleteNotificationMutation.variables?.notificationId === notification.id;

                                        return (
                                            <div
                                                key={notification.id}
                                                className={`flex items-center justify-center gap-3 p-4 rounded-lg border transition-colors hover:bg-gray-50 ${notification.isRead ? 'border-[0.5px] border-[#00000066]/40 opacity-70' : 'border-[0.5px] border-[#00000066]/40'
                                                    }`}
                                            >
                                                {/* Icon */}
                                                <div
                                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColorForEntityType(notification.entityType)
                                                        }`}
                                                >
                                                    {getIconForEntityType(notification.entityType)}
                                                </div>

                                                {/* Content */}
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm text-theme-primary-text leading-relaxed'>
                                                        {notification.description}
                                                    </p>
                                                </div>

                                                {/* Time and Actions */}
                                                <div className='flex items-center gap-3 flex-shrink-0'>
                                                    <button
                                                        onClick={() => handleVisitFund(navigate, notification.id, user?.role, notification?.fundId)}
                                                        className="text-theme-sidebar-accent transition-colors"
                                                        disabled={isDeleting}
                                                    >
                                                        Visit Fund
                                                    </button>
                                                    {/* Unread indicator */}
                                                    {!notification.isRead && (
                                                        <div className='w-2 h-2 bg-theme-sidebar-accent rounded-full flex-shrink-0'></div>
                                                    )}
                                                    <span className='text-xs text-theme-secondary-text'>
                                                        {notification.timeAgo}
                                                    </span>

                                                    {/* {!notification.isRead && (
                                                        <div className="relative">
                                                            {isMarkingAsRead ? (
                                                                <span className="text-xs text-gray-400 opacity-70 blur-[1px]">
                                                                    Marking...
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                                    className='text-gray-400 hover:text-blue-500 transition-colors'
                                                                    disabled={isDeleting}
                                                                >
                                                                    Mark as Read
                                                                </button>
                                                            )}
                                                        </div>
                                                    )} */}

                                                    <div className="relative mt-1">
                                                        {isDeleting ? (
                                                            <span className="text-gray-400 opacity-70 blur-[1px]">
                                                                <Trash2 className='w-4 h-4' />
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDelete(notification.id)}
                                                                className='text-gray-400 hover:text-red-500 transition-colors'
                                                                disabled={isMarkingAsRead}
                                                            >
                                                                <Trash2 className='w-4 h-4' />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {filteredNotifications?.length > 0 && totalPages > 1 && (
                <div className='flex justify-center mt-6'>
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-2 text-sm font-medium text-theme-secondary-text bg-white  border border-theme-sidebar-accent rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className='px-4 py-2 mx-1 text-theme-primary-text'>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-2 text-sm font-medium text-theme-secondary-text bg-white border border-theme-sidebar-accent rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && notifications.length === 0 && (
                <div className='text-center py-12'>
                    <Bell className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                    <p className='text-theme-secondary-text'>No notifications found</p>
                </div>
            )}
        </div>
    );
}