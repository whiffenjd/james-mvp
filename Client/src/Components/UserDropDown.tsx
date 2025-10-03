import React, { useState, useRef, useEffect } from 'react';
import { FaCaretDown, FaSignOutAlt } from 'react-icons/fa';

interface Theme {
    primaryText: string;
    secondaryText: string;
    sidebarAccentText: string;
    cardBackground: string;
}

interface User {
    name?: string;
    email?: string;
}

interface UserDropdownProps {
    user: User | null;
    onLogout: () => void;
    currentTheme: Theme;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
    user,
    onLogout,
    currentTheme
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setShowDropdown(false);
        onLogout();
    };

    return (
        <div className="relative flex items-center gap-2" ref={dropdownRef}>
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                    backgroundColor: currentTheme.sidebarAccentText + '20',
                    color: currentTheme.sidebarAccentText
                }}
            >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <h3
                className="font-nunito text-sm capitalize"
                style={{ color: currentTheme.primaryText }}
            >
                {user?.name || "User"}
            </h3>

            <button
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                    color: currentTheme.sidebarAccentText,
                    backgroundColor: showDropdown ? currentTheme.sidebarAccentText + '10' : 'transparent'
                }}
                onClick={() => setShowDropdown((prev) => !prev)}
            >
                <FaCaretDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
                <div
                    className="absolute top-12 right-0 shadow-lg rounded-xl py-2 z-50 min-w-[200px] border"
                    style={{
                        backgroundColor: currentTheme.cardBackground,
                        borderColor: currentTheme.sidebarAccentText + '20'
                    }}
                >
                    <div
                        className="px-4 py-3 border-b"
                        style={{ borderColor: currentTheme.sidebarAccentText + '20' }}
                    >
                        <p
                            className="text-sm font-semibold capitalize"
                            style={{ color: currentTheme.primaryText }}
                        >
                            {user?.name || "User"}
                        </p>
                        {user?.email && (
                            <p
                                className="text-xs mt-1"
                                style={{ color: currentTheme.secondaryText }}
                            >
                                {user.email}
                            </p>
                        )}
                    </div>

                    <button
                        className="w-full px-4 py-2.5 flex items-center gap-3 text-red-600 transition-colors duration-150 hover:bg-red-50"
                        onClick={handleLogoutClick}
                    >
                        <FaSignOutAlt size={14} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;