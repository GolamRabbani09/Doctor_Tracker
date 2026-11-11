'use client';

import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'danger',
}) => {
  const iconColors = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600',
  }[type];

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
  }[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${iconColors}`}>
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors shadow-sm ${buttonColors}`}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
