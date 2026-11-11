'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { doctorsApi } from '@/services/api';
import { Doctor, DoctorFormData, Pagination as PaginationType } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DoctorFormModal } from '@/components/doctors/DoctorFormModal';
import { DoctorPatientsDrawer } from '@/components/doctors/DoctorPatientsDrawer';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Stethoscope,
  Building2,
  Calendar,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function DoctorsPage() {
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

  const [specializationFilter, setSpecializationFilter] = useState<string>('');
  const [hospitalFilter, setHospitalFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals & Drawers state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [drawerDoctor, setDrawerDoctor] = useState<Doctor | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch doctors list from API
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await doctorsApi.getDoctors({
        search: debouncedSearch || undefined,
        specialization: specializationFilter || undefined,
        hospital: hospitalFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: currentPage,
        limit: 10,
      });

      setDoctors(res.doctors || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch doctors:', err);
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    specializationFilter,
    hospitalFilter,
    startDate,
    endDate,
    currentPage,
  ]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, specializationFilter, hospitalFilter, startDate, endDate]);

  // Collect distinct specializations & hospitals from current doctor set for quick filter dropdown
  const { specializationsList, hospitalsList } = useMemo(() => {
    const specs = new Set<string>();
    const hosps = new Set<string>();
    doctors.forEach((d) => {
      if (d.specialization) specs.add(d.specialization);
      if (d.hospital) hosps.add(d.hospital);
    });
    return {
      specializationsList: Array.from(specs),
      hospitalsList: Array.from(hosps),
    };
  }, [doctors]);

  // Create Doctor
  const handleCreateDoctor = async (data: DoctorFormData) => {
    try {
      setActionLoading(true);
      await doctorsApi.createDoctor(data);
      toast.success('Doctor registered successfully');
      setIsAddModalOpen(false);
      fetchDoctors();
    } catch (err: unknown) {
      console.error('Error creating doctor:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to create doctor';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Doctor
  const handleUpdateDoctor = async (data: DoctorFormData) => {
    if (!editingDoctor) return;
    const docId = editingDoctor._id || editingDoctor.id || '';
    try {
      setActionLoading(true);
      await doctorsApi.updateDoctor(docId, data);
      toast.success('Doctor details updated successfully');
      setEditingDoctor(null);
      fetchDoctors();
    } catch (err: unknown) {
      console.error('Error updating doctor:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to update doctor';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Doctor (with cascade warning)
  const handleDeleteDoctor = async () => {
    if (!deletingDoctor) return;
    const docId = deletingDoctor._id || deletingDoctor.id || '';
    try {
      setActionLoading(true);
      await doctorsApi.deleteDoctor(docId);
      toast.success('Doctor and associated patients deleted');
      setDeletingDoctor(null);
      fetchDoctors();
    } catch (err: unknown) {
      console.error('Error deleting doctor:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to delete doctor';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSpecializationFilter('');
    setHospitalFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = Boolean(
    searchTerm || specializationFilter || hospitalFilter || startDate || endDate
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Doctor Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse, search, and manage registered healthcare specialists
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Doctor</span>
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
              placeholder="Search name, specialization..."
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Specialization Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              list="spec-options"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              placeholder="Filter by Specialization"
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
            />
            <datalist id="spec-options">
              {specializationsList.map((spec) => (
                <option key={spec} value={spec} />
              ))}
            </datalist>
          </div>

          {/* Hospital Filter */}
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              list="hosp-options"
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
              placeholder="Filter by Hospital"
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white"
            />
            <datalist id="hosp-options">
              {hospitalsList.map((hosp) => (
                <option key={hosp} value={hosp} />
              ))}
            </datalist>
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
        <TableSkeleton rows={6} columns={6} />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No Doctors Found"
          description={
            hasActiveFilters
              ? 'No registered doctors match your filter criteria. Try clearing filters or revising your search.'
              : 'There are currently no doctors in the system. Click below to add your first physician.'
          }
          actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Doctor'}
          onAction={hasActiveFilters ? clearFilters : () => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Specialization
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Hospital
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Contact Details
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
                {doctors.map((doctor) => {
                  const docId = doctor._id || doctor.id || '';
                  return (
                    <tr
                      key={docId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Name & avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">
                            {doctor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/doctors/${docId}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
                            >
                              {doctor.name}
                            </Link>
                            <span className="text-xs text-gray-400">
                              ID: {docId.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Specialization */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {doctor.specialization}
                        </span>
                      </td>

                      {/* Hospital */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">
                          {doctor.hospital}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs space-y-0.5">
                          <p className="text-gray-900 font-medium">
                            {doctor.phone}
                          </p>
                          <p className="text-gray-500">{doctor.email}</p>
                        </div>
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {doctor.createdAt
                          ? format(new Date(doctor.createdAt), 'MMM dd, yyyy')
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDrawerDoctor(doctor)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Patients"
                            aria-label={`View patients for ${doctor.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDoctor(doctor)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Doctor"
                            aria-label={`Edit ${doctor.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingDoctor(doctor)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Doctor"
                            aria-label={`Delete ${doctor.name}`}
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

      {/* Doctor Add Modal */}
      <DoctorFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateDoctor}
        isLoading={actionLoading}
      />

      {/* Doctor Edit Modal */}
      <DoctorFormModal
        isOpen={Boolean(editingDoctor)}
        onClose={() => setEditingDoctor(null)}
        onSubmit={handleUpdateDoctor}
        initialData={editingDoctor}
        isLoading={actionLoading}
      />

      {/* Delete Doctor Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingDoctor)}
        onClose={() => setDeletingDoctor(null)}
        onConfirm={handleDeleteDoctor}
        title="Delete Doctor & Cascade Records"
        message={`Are you sure you want to delete ${deletingDoctor?.name}? Deleting this doctor will also remove all associated patient records.`}
        confirmText="Confirm & Delete"
        isLoading={actionLoading}
      />

      {/* Doctor Patients Slide-over Drawer */}
      <DoctorPatientsDrawer
        isOpen={Boolean(drawerDoctor)}
        onClose={() => setDrawerDoctor(null)}
        doctor={drawerDoctor}
        onPatientCountChanged={() => fetchDoctors()}
      />
    </div>
  );
}
