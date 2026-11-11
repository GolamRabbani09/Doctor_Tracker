'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Doctor, Patient, PatientFormData } from '@/types';
import { doctorsApi, patientsApi } from '@/services/api';
import { X, Plus, Trash2, User, Phone, Mail, Activity, Loader2 } from 'lucide-react';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';

interface DoctorPatientsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onPatientCountChanged?: () => void;
}

export const DoctorPatientsDrawer: React.FC<DoctorPatientsDrawerProps> = ({
  isOpen,
  onClose,
  doctor,
  onPatientCountChanged,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const doctorId = doctor ? doctor._id || doctor.id || '' : '';

  const fetchPatients = useCallback(async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const data = await doctorsApi.getDoctorPatients(doctorId);
      setPatients(data || []);
    } catch (err: unknown) {
      console.error('Failed to fetch doctor patients:', err);
      toast.error('Failed to load patients for this doctor');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (isOpen && doctorId) {
      fetchPatients();
    } else {
      setPatients([]);
    }
  }, [isOpen, doctorId, fetchPatients]);

  const handleCreatePatient = async (formData: PatientFormData) => {
    try {
      setIsSubmitting(true);
      await patientsApi.createPatient({
        ...formData,
        doctorId,
      });
      toast.success('Patient registered successfully');
      setIsAddModalOpen(false);
      fetchPatients();
      onPatientCountChanged?.();
    } catch (err: unknown) {
      console.error('Error creating patient:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to register patient';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!deletePatientId) return;
    try {
      setIsDeleting(true);
      await patientsApi.deletePatient(deletePatientId);
      toast.success('Patient removed successfully');
      setDeletePatientId(null);
      fetchPatients();
      onPatientCountChanged?.();
    } catch (err: unknown) {
      console.error('Error deleting patient:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to remove patient';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-400">
                Assigned Patients
              </span>
              <h2 className="text-xl font-bold mt-1 text-white truncate max-w-md" id="slide-over-title">
                {doctor?.name}
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                {doctor?.specialization} • {doctor?.hospital}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Total: <span className="font-bold text-gray-900">{patients.length}</span> patients
            </span>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : patients.length === 0 ? (
              <EmptyState
                icon={User}
                title="No patients found"
                description={`There are currently no patients assigned to ${doctor?.name}.`}
                actionLabel="Add First Patient"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              patients.map((patient) => {
                const patId = patient._id || patient.id || '';
                return (
                  <div
                    key={patId}
                    className="p-4 rounded-xl border border-gray-200/90 hover:border-blue-200 hover:shadow-sm bg-white transition-all flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-base">
                          {patient.name}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {patient.age} yrs • {patient.gender}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md w-fit">
                        <Activity className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium">{patient.condition}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {patient.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {patient.email}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeletePatientId(patId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove patient"
                      aria-label="Remove patient"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Patient Modal inside Drawer */}
      {isAddModalOpen && doctor && (
        <PatientFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreatePatient}
          defaultDoctorId={doctorId}
          doctorsList={[doctor]}
          isLoading={isSubmitting}
        />
      )}

      {/* Confirm Delete Patient Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletePatientId)}
        onClose={() => setDeletePatientId(null)}
        onConfirm={handleDeletePatient}
        title="Remove Patient"
        message="Are you sure you want to remove this patient record? This action cannot be undone."
        confirmText="Remove"
        isLoading={isDeleting}
      />
    </div>
  );
};
