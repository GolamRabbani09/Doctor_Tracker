'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doctorsApi, patientsApi } from '@/services/api';
import { Doctor, Patient, DoctorFormData, PatientFormData } from '@/types';
import { DoctorFormModal } from '@/components/doctors/DoctorFormModal';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Activity,
  UserCheck,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Actions
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState<boolean>(false);
  const [isDeleteDoctorOpen, setIsDeleteDoctorOpen] = useState<boolean>(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Load doctor details and patients
  const loadDoctorData = useCallback(async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const [doctorData, patientsData] = await Promise.all([
        doctorsApi.getDoctor(doctorId),
        doctorsApi.getDoctorPatients(doctorId),
      ]);
      setDoctor(doctorData);
      setPatients(patientsData || []);
    } catch (err: unknown) {
      console.error('Failed to load doctor profile:', err);
      toast.error('Could not find requested doctor profile');
      router.push('/doctors');
    } finally {
      setLoading(false);
    }
  }, [doctorId, router]);

  useEffect(() => {
    loadDoctorData();
  }, [loadDoctorData]);

  // Update Doctor
  const handleUpdateDoctor = async (data: DoctorFormData) => {
    try {
      setActionLoading(true);
      const updated = await doctorsApi.updateDoctor(doctorId, data);
      setDoctor(updated);
      toast.success('Doctor profile updated');
      setIsEditDoctorOpen(false);
      loadDoctorData();
    } catch (err: unknown) {
      console.error('Update doctor error:', err);
      toast.error('Failed to update doctor profile');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async () => {
    try {
      setActionLoading(true);
      await doctorsApi.deleteDoctor(doctorId);
      toast.success('Doctor and associated patients deleted');
      router.push('/doctors');
    } catch (err: unknown) {
      console.error('Delete doctor error:', err);
      toast.error('Failed to delete doctor');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Patient
  const handleCreatePatient = async (data: PatientFormData) => {
    try {
      setActionLoading(true);
      await patientsApi.createPatient({ ...data, doctorId });
      toast.success('Patient added successfully');
      setIsAddPatientOpen(false);
      loadDoctorData();
    } catch (err: unknown) {
      console.error('Add patient error:', err);
      toast.error('Failed to add patient');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Patient
  const handleUpdatePatient = async (data: PatientFormData) => {
    if (!editingPatient) return;
    const patId = editingPatient._id || editingPatient.id || '';
    try {
      setActionLoading(true);
      await patientsApi.updatePatient(patId, data);
      toast.success('Patient record updated');
      setEditingPatient(null);
      loadDoctorData();
    } catch (err: unknown) {
      console.error('Update patient error:', err);
      toast.error('Failed to update patient');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Patient
  const handleDeletePatient = async () => {
    if (!deletingPatient) return;
    const patId = deletingPatient._id || deletingPatient.id || '';
    try {
      setActionLoading(true);
      await patientsApi.deletePatient(patId);
      toast.success('Patient removed');
      setDeletingPatient(null);
      loadDoctorData();
    } catch (err: unknown) {
      console.error('Delete patient error:', err);
      toast.error('Failed to remove patient');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-full h-48 rounded-xl" />
        <TableSkeleton rows={4} columns={5} />
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back to Doctors list link */}
      <div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Doctors</span>
        </Link>
      </div>

      {/* Doctor Info Card */}
      <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Left Details */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {doctor.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {doctor.name}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {doctor.specialization}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 pt-2">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {doctor.hospital}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {doctor.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {doctor.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Registered:{' '}
                  {doctor.createdAt
                    ? format(new Date(doctor.createdAt), 'MMM dd, yyyy')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsEditDoctorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
            >
              <Pencil className="h-4 w-4 text-gray-500" />
              <span>Edit Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteDoctorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <span>Delete Doctor</span>
            </button>
          </div>
        </div>

        {/* Doctor Summary Stat Bar */}
        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <span className="text-xs font-medium text-gray-500 block">
              Assigned Patients
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {patients.length}
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <span className="text-xs font-medium text-gray-500 block">
              Specialty Department
            </span>
            <span className="text-base font-semibold text-gray-900 mt-1 block truncate">
              {doctor.specialization}
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-gray-500 block">
              Primary Clinic
            </span>
            <span className="text-base font-semibold text-gray-900 mt-1 block truncate">
              {doctor.hospital}
            </span>
          </div>
        </div>
      </div>

      {/* Patient List Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Assigned Patients ({patients.length})
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Patients receiving primary care under this doctor
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddPatientOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Patients Table */}
      {patients.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Patients Assigned"
          description={`There are currently no patients assigned to ${doctor.name}. Click below to add a new patient.`}
          actionLabel="Add Patient"
          onAction={() => setIsAddPatientOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Patient Name
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Demographics
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Condition
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Date Added
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => {
                  const patId = patient._id || patient.id || '';
                  return (
                    <tr
                      key={patId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 block">
                          {patient.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ID: {patId.slice(-6)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-800 font-medium">
                          {patient.age} yrs
                        </span>
                        <span className="text-gray-400 mx-1.5">•</span>
                        <span className="text-gray-600">{patient.gender}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Activity className="h-3 w-3 text-amber-600" />
                          {patient.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-0.5">
                          <p className="text-gray-900 font-medium">
                            {patient.phone}
                          </p>
                          <p className="text-gray-500">{patient.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {patient.createdAt
                          ? format(new Date(patient.createdAt), 'MMM dd, yyyy')
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPatient(patient)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Patient"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPatient(patient)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      <DoctorFormModal
        isOpen={isEditDoctorOpen}
        onClose={() => setIsEditDoctorOpen(false)}
        onSubmit={handleUpdateDoctor}
        initialData={doctor}
        isLoading={actionLoading}
      />

      {/* Delete Doctor Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDoctorOpen}
        onClose={() => setIsDeleteDoctorOpen(false)}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor"
        message={`Are you sure you want to delete ${doctor.name}? This will remove all associated medical history and ${patients.length} assigned patient records.`}
        confirmText="Confirm Delete"
        isLoading={actionLoading}
      />

      {/* Add Patient Modal */}
      <PatientFormModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSubmit={handleCreatePatient}
        defaultDoctorId={doctorId}
        doctorsList={[doctor]}
        isLoading={actionLoading}
      />

      {/* Edit Patient Modal */}
      <PatientFormModal
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        onSubmit={handleUpdatePatient}
        initialData={editingPatient}
        defaultDoctorId={doctorId}
        doctorsList={[doctor]}
        isLoading={actionLoading}
      />

      {/* Delete Patient Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDeletePatient}
        title="Remove Patient"
        message={`Are you sure you want to remove patient ${deletingPatient?.name}?`}
        confirmText="Delete Patient"
        isLoading={actionLoading}
      />
    </div>
  );
}
