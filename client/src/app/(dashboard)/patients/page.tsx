'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { patientsApi, doctorsApi } from '@/services/api';
import {
  Patient,
  Doctor,
  PatientFormData,
  Pagination as PaginationType,
} from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PatientFormModal } from '@/components/patients/PatientFormModal';
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Users,
  Activity,
  Calendar,
  X,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [conditionFilter, setConditionFilter] = useState<string>('');
  const [doctorFilter, setDoctorFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch doctors list for filter and modal dropdowns
  useEffect(() => {
    const fetchDoctorsList = async () => {
      try {
        const res = await doctorsApi.getDoctors({ limit: 100 });
        setDoctors(res.doctors || []);
      } catch (err) {
        console.error('Failed to load doctors list for filter:', err);
      }
    };
    fetchDoctorsList();
  }, []);

  // Fetch patients list from API
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await patientsApi.getPatients({
        search: debouncedSearch || undefined,
        condition: conditionFilter || undefined,
        doctorId: doctorFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: 10,
      });

      setPatients(res.patients || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch patients:', err);
      toast.error('Failed to load patients list');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    conditionFilter,
    doctorFilter,
    startDate,
    endDate,
    currentPage,
  ]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, conditionFilter, doctorFilter, startDate, endDate]);

  // Build doctor lookup dictionary by ID
  const doctorMap = useMemo(() => {
    const map = new Map<string, Doctor>();
    doctors.forEach((d) => {
      const id = d._id || d.id;
      if (id) map.set(id, d);
    });
    return map;
  }, [doctors]);

  // Helper to extract doctor display name
  const getDoctorName = (patient: Patient): string => {
    if (patient.doctor?.name) return patient.doctor.name;
    if (
      typeof patient.doctorId === 'object' &&
      patient.doctorId !== null &&
      patient.doctorId.name
    ) {
      return patient.doctorId.name;
    }
    const docId =
      typeof patient.doctorId === 'string'
        ? patient.doctorId
        : patient.doctorId?._id || patient.doctorId?.id;
    if (docId && doctorMap.has(docId)) {
      return doctorMap.get(docId)!.name;
    }
    return 'Assigned Doctor';
  };

  // Distinct conditions for filtering
  const conditionsList = useMemo(() => {
    const conds = new Set<string>();
    patients.forEach((p) => {
      if (p.condition) conds.add(p.condition);
    });
    return Array.from(conds);
  }, [patients]);

  // Create Patient
  const handleCreatePatient = async (data: PatientFormData) => {
    try {
      setActionLoading(true);
      await patientsApi.createPatient(data);
      toast.success('Patient registered successfully');
      setIsAddModalOpen(false);
      fetchPatients();
    } catch (err: unknown) {
      console.error('Error creating patient:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to register patient';
      toast.error(msg);
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
      toast.success('Patient details updated successfully');
      setEditingPatient(null);
      fetchPatients();
    } catch (err: unknown) {
      console.error('Error updating patient:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update patient';
      toast.error(msg);
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
      toast.success('Patient removed successfully');
      setDeletingPatient(null);
      fetchPatients();
    } catch (err: unknown) {
      console.error('Error deleting patient:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete patient';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setConditionFilter('');
    setDoctorFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = Boolean(
    searchTerm || conditionFilter || doctorFilter || startDate || endDate
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Patient Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse and manage medical cases, conditions, and doctor assignments
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-gray-200/90 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, phone, email..."
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Condition Filter */}
          <div className="relative">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              list="condition-options"
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              placeholder="Filter by Condition"
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
            />
            <datalist id="condition-options">
              {conditionsList.map((cond) => (
                <option key={cond} value={cond} />
              ))}
            </datalist>
          </div>

          {/* Doctor Filter Dropdown */}
          <div className="relative">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white appearance-none"
            >
              <option value="">All Attending Doctors</option>
              {doctors.map((doc) => {
                const docId = doc._id || doc.id || '';
                return (
                  <option key={docId} value={docId}>
                    {doc.name} ({doc.specialization})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Date Range: Start / End */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-8 pr-2 py-2 text-xs text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
                title="Start date"
              />
            </div>
            <span className="text-gray-400 text-xs">to</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-2 text-xs text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
                title="End date"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Clear Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Filtering active results</span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table or Loading Skeleton */}
      {loading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Patients Found"
          description={
            hasActiveFilters
              ? 'No registered patients match your search criteria. Try modifying your filters or query.'
              : 'There are currently no patients registered in the clinic system.'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Patient'}
          onAction={hasActiveFilters ? clearFilters : () => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Patient Name
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Demographics
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Medical Condition
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Assigned Doctor
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Registered
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => {
                  const patId = patient._id || patient.id || '';
                  const doctorName = getDoctorName(patient);

                  return (
                    <tr
                      key={patId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-sm">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 block">
                              {patient.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              ID: {patId.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Demographics */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">
                          {patient.age} yrs
                        </span>
                        <span className="text-gray-400 mx-1.5">•</span>
                        <span className="text-gray-600">{patient.gender}</span>
                      </td>

                      {/* Condition badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Activity className="h-3 w-3 text-amber-600" />
                          {patient.condition}
                        </span>
                      </td>

                      {/* Doctor Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-gray-800 font-medium text-xs bg-slate-100 px-2.5 py-1 rounded-md">
                          <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                          {doctorName}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-0.5">
                          <p className="text-gray-900 font-medium">
                            {patient.phone}
                          </p>
                          <p className="text-gray-500">{patient.email}</p>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {patient.createdAt
                          ? format(new Date(patient.createdAt), 'MMM dd, yyyy')
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPatient(patient)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Patient"
                            aria-label={`Edit ${patient.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPatient(patient)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Patient"
                            aria-label={`Delete ${patient.name}`}
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

          {/* Pagination */}
          <div className="border-t border-gray-100 px-4 py-2">
            <Pagination
              pagination={pagination}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      <PatientFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreatePatient}
        doctorsList={doctors}
        isLoading={actionLoading}
      />

      {/* Edit Patient Modal */}
      <PatientFormModal
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        onSubmit={handleUpdatePatient}
        initialData={editingPatient}
        doctorsList={doctors}
        isLoading={actionLoading}
      />

      {/* Delete Patient Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDeletePatient}
        title="Remove Patient"
        message={`Are you sure you want to remove patient record for ${deletingPatient?.name}? This action cannot be reversed.`}
        confirmText="Confirm Delete"
        isLoading={actionLoading}
      />
    </div>
  );
}
