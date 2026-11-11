'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/doctors/')) return 'Doctor Profile';
    if (pathname.startsWith('/doctors')) return 'Doctors';
    if (pathname.startsWith('/patients')) return 'Patients';
    return 'Doctor Tracker';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-gray-200">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm border border-blue-200">
            {user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-none truncate max-w-[150px]">
              {user?.email || 'admin@doctor-tracker.com'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
