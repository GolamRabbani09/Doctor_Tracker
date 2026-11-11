'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Doctor, DoctorFormData } from '@/types';
import { Loader2 } from 'lucide-react';

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  initialData?: Doctor | null;
  isLoading?: boolean;
}

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    specialization: '',
    hospital: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        specialization: initialData.specialization || '',
        hospital: initialData.hospital || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
      });
    } else {
      setFormData({
        name: '',
        specialization: '',
        hospital: '',
        phone: '',
        email: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }
    if (!formData.hospital.trim()) {
      newErrors.hospital = 'Hospital name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const isEditMode = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Doctor Profile' : 'Add New Doctor'}
      description={
        isEditMode
          ? 'Update doctor information and hospital affiliation.'
          : 'Enter doctor details to register them in the system.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Doctor Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Sarah Jenkins"
            className={`w-full px-3.5 py-2 rounded-lg border ${
              errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
            } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialization <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.specialization}
            onChange={(e) =>
              setFormData({ ...formData, specialization: e.target.value })
            }
            placeholder="e.g. Cardiology, Neurology, Pediatrics"
            className={`w-full px-3.5 py-2 rounded-lg border ${
              errors.specialization
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-gray-300'
            } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          />
          {errors.specialization && (
            <p className="mt-1 text-xs text-red-600">{errors.specialization}</p>
          )}
        </div>

        {/* Hospital */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hospital / Clinic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.hospital}
            onChange={(e) =>
              setFormData({ ...formData, hospital: e.target.value })
            }
            placeholder="e.g. Metro General Hospital"
            className={`w-full px-3.5 py-2 rounded-lg border ${
              errors.hospital
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-gray-300'
            } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          />
          {errors.hospital && (
            <p className="mt-1 text-xs text-red-600">{errors.hospital}</p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="sarah.jenkins@hospital.org"
              className={`w-full px-3.5 py-2 rounded-lg border ${
                errors.email
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border-gray-300'
              } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+1 (555) 234-5678"
              className={`w-full px-3.5 py-2 rounded-lg border ${
                errors.phone
                  ? 'border-red-500 ring-1 ring-red-500'
                  : 'border-gray-300'
              } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 transition-colors"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Register Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
