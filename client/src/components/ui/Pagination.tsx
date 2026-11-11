'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination as PaginationType } from '@/types';

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const { page, limit, total, totalPages } = pagination;

  if (total === 0 || totalPages <= 1) {
    return null;
  }

  const startResult = Math.min((page - 1) * limit + 1, total);
  const endResult = Math.min(page * limit, total);

  // Generate page numbers with ellipsis (e.g. 1 ... 4 5 6 ... 10)
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const delta = 1;

    const left = page - delta;
    const right = page + delta + 1;
    let l = 0;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      }
    }

    const pagesWithEllipsis: (number | string)[] = [];
    for (const p of pages) {
      if (l) {
        if (typeof p === 'number' && p - l === 2) {
          pagesWithEllipsis.push(l + 1);
        } else if (typeof p === 'number' && p - l !== 1) {
          pagesWithEllipsis.push('...');
        }
      }
      pagesWithEllipsis.push(p);
      l = typeof p === 'number' ? p : l;
    }

    return pagesWithEllipsis;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{startResult}</span> to{' '}
        <span className="font-semibold text-gray-900">{endResult}</span> of{' '}
        <span className="font-semibold text-gray-900">{total}</span> results
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Buttons */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((item, idx) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-sm text-gray-400 select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(item);
            const isActive = pageNum === page;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
