'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Patient, PatientFormData, Doctor } from '@/types';
import { doctorsApi } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  initialData?: Patient | null;
  defaultDoctorId?: string;
  doctorsList?: Doctor[];
  isLoading?: boolean;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultDoctorId,
  doctorsList = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    condition: '',
    doctorId: '',
  });

  const [doctors, setDoctors] = useState<Doctor[]>(doctorsList);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch doctors if not provided via props
  useEffect(() => {
    if (isOpen && doctorsList.length === 0) {
      const fetchAllDoctors = async () => {
        try {
          setLoadingDoctors(true);
          const response = await doctorsApi.getDoctors({ limit: 100 });
          setDoctors(response.doctors || []);
        } catch (err) {
          console.error('Failed to load doctors list for dropdown:', err);
        } finally {
          setLoadingDoctors(false);
        }
      };
      fetchAllDoctors();
    } else if (doctorsList.length > 0) {
      setDoctors(doctorsList);
    }
  }, [isOpen, doctorsList]);

  useEffect(() => {
    if (initialData) {
      const docId =
        typeof initialData.doctorId === 'object' && initialData.doctorId !== null
          ? initialData.doctorId._id || initialData.doctorId.id || ''
          : (initialData.doctorId as string) || '';

      setFormData({
        name: initialData.name || '',
        age: initialData.age ?? '',
        gender: initialData.gender || 'Male',
        phone: initialData.phone || '',
        email: initialData.email || '',
        condition: initialData.condition || '',
        doctorId: docId || defaultDoctorId || '',
      });
    } else {
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        email: '',
        condition: '',
        doctorId: defaultDoctorId || (doctors[0]?._id || doctors[0]?.id || ''),
      });
    }
    setErrors({});
  }, [initialData, defaultDoctorId, isOpen, doctors]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required';
    }
    if (formData.age === '' || Number(formData.age) <= 0) {
      newErrors.age = 'Please enter a valid age (greater than 0)';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.condition.trim()) {
      newErrors.condition = 'Medical condition or diagnosis is required';
    }
    if (!formData.doctorId) {
      newErrors.doctorId = 'Assigned doctor is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...formData,
      age: Number(formData.age),
    });
  };

  const isEditMode = Boolean(initialData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Patient Record' : 'Register New Patient'}
      description={
        isEditMode
          ? 'Update medical details and assigned physician.'
          : 'Fill in patient demographics and assign an attending doctor.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Johnathan Doe"
            className={`w-full px-3.5 py-2 rounded-lg border ${
              errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
            } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Age & Gender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="130"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              placeholder="e.g. 42"
              className={`w-full px-3.5 py-2 rounded-lg border ${
                errors.age ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
              } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            />
            {errors.age && (
              <p className="mt-1 text-xs text-red-600">{errors.age}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className={`w-full px-3.5 py-2 rounded-lg border ${
                errors.gender ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
              } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white`}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-600">{errors.gender}</p>
            )}
          </div>
        </div>

        {/* Phone & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="+1 (555) 987-6543"
              className={`w-full px-3.5 py-2 rounded-lg border ${
                errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
              } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

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
              placeholder="patient@example.com"
              className={`w-full px-3.5 py-2 rounded-lg border ${
                errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
              } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Medical Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medical Condition / Primary Complaint <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.condition}
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
            placeholder="e.g. Hypertension, Type 2 Diabetes, Migraine"
            className={`w-full px-3.5 py-2 rounded-lg border ${
              errors.condition
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-gray-300'
            } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          />
          {errors.condition && (
            <p className="mt-1 text-xs text-red-600">{errors.condition}</p>
          )}
        </div>

        {/* Doctor Assignment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned Doctor <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.doctorId}
            onChange={(e) =>
              setFormData({ ...formData, doctorId: e.target.value })
            }
            disabled={loadingDoctors || (Boolean(defaultDoctorId) && !isEditMode)}
            className={`w-full px-3.5 py-2 rounded-lg border ${
              errors.doctorId
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-gray-300'
            } text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white disabled:bg-gray-100 disabled:text-gray-500`}
          >
            <option value="">Select a Doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id || doc.id} value={doc._id || doc.id}>
                {doc.name} - {doc.specialization} ({doc.hospital})
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <p className="mt-1 text-xs text-red-600">{errors.doctorId}</p>
          )}
          {loadingDoctors && (
            <p className="mt-1 text-xs text-gray-400">Loading doctors list...</p>
          )}
        </div>

        {/* Buttons */}
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
            {isEditMode ? 'Save Changes' : 'Register Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
