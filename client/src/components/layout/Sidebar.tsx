'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  X,
  HeartPulse,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Doctors',
    href: '/doctors',
    icon: Stethoscope,
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Logo & Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 group"
            onClick={onClose}
          >
            <div className="p-2 rounded-lg bg-blue-600 text-white group-hover:bg-blue-500 transition-colors">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                Doctor Tracker
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Overview
          </div>
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? 'text-white' : 'text-gray-400'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Operational</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Version 1.0.0</p>
        </div>
      </aside>
    </>
  );
};
