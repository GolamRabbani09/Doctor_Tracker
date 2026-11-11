export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface DoctorSummary {
  _id: string;
  id?: string;
  name: string;
  specialization?: string;
  hospital?: string;
}

export interface Doctor {
  _id: string;
  id?: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DoctorFormData {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export interface Patient {
  _id: string;
  id?: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | string;
  phone: string;
  email: string;
  condition: string;
  doctorId: string | DoctorSummary;
  doctor?: DoctorSummary;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientFormData {
  name: string;
  age: number | string;
  gender: string;
  phone: string;
  email: string;
  condition: string;
  doctorId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface DoctorsResponseData {
  doctors: Doctor[];
  pagination: Pagination;
}

export interface PatientsResponseData {
  patients: Patient[];
  pagination: Pagination;
}

export interface RegistrationTrend {
  _id: {
    year: number;
    month: number;
  };
  doctors: number;
  patients: number;
}

export interface SpecializationStat {
  _id: string;
  count: number;
}

export interface HospitalStat {
  _id: string;
  count: number;
}

export interface DoctorPatientDistribution {
  doctorName: string;
  patientCount: number;
}

export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  recentDoctors: number;
  recentPatients: number;
  specializations: SpecializationStat[];
  hospitalDistribution: HospitalStat[];
  doctorPatientDistribution: DoctorPatientDistribution[];
  registrationTrends: RegistrationTrend[];
}

export interface DoctorQueryParams {
  search?: string;
  specialization?: string;
  hospital?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PatientQueryParams {
  search?: string;
  condition?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
