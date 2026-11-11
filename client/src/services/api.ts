import axios, { AxiosError } from "axios";
import {
  User,
  Doctor,
  DoctorFormData,
  DoctorQueryParams,
  DoctorsResponseData,
  Patient,
  PatientFormData,
  PatientQueryParams,
  PatientsResponseData,
  DashboardStats,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach Bearer token to all outgoing requests if token exists in localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("doctor_tracker_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      // Clear token if expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        localStorage.removeItem("doctor_tracker_token");
        localStorage.removeItem("doctor_tracker_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth Services
export const authApi = {
  login: async (
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post("/auth/login", { email, password });
    const data = response.data;
    if (data.token && data.user) {
      return { token: data.token, user: data.user };
    }
    if (data.data?.token && data.data?.user) {
      return { token: data.data.token, user: data.data.user };
    }
    return data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get("/auth/me");
    const data = response.data;
    if (data.user) {
      return data.user;
    }
    if (data.data?.user) {
      return data.data.user;
    }
    if (data.id && data.email) {
      return data as User;
    }
    if (data.data?.id && data.data?.email) {
      return data.data as User;
    }
    return data;
  },
};

// Doctor Services
export const doctorsApi = {
  getDoctors: async (
    params?: DoctorQueryParams,
  ): Promise<DoctorsResponseData> => {
    const response = await apiClient.get("/doctors", { params });
    const resData = response.data;
    // Backend standard: { success: true, data: { doctors: [], pagination: {} } }
    if (resData.data && resData.data.doctors) {
      return resData.data;
    }
    if (resData.doctors) {
      return {
        doctors: resData.doctors,
        pagination: resData.pagination || {
          page: 1,
          limit: 10,
          total: resData.doctors.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
    // Fallback if returned as raw array
    if (Array.isArray(resData)) {
      return {
        doctors: resData,
        pagination: {
          page: 1,
          limit: resData.length,
          total: resData.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
    return {
      doctors: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  getDoctor: async (id: string): Promise<Doctor> => {
    const response = await apiClient.get(`/doctors/${id}`);
    const resData = response.data;
    if (resData.data?.doctor) {
      return resData.data.doctor;
    }
    if (resData.data) {
      return resData.data;
    }
    if (resData.doctor) {
      return resData.doctor;
    }
    return resData;
  },

  createDoctor: async (data: DoctorFormData): Promise<Doctor> => {
    const response = await apiClient.post("/doctors", data);
    return response.data?.data?.doctor || response.data?.data || response.data;
  },

  updateDoctor: async (
    id: string,
    data: Partial<DoctorFormData>,
  ): Promise<Doctor> => {
    const response = await apiClient.put(`/doctors/${id}`, data);
    return response.data?.data?.doctor || response.data?.data || response.data;
  },

  deleteDoctor: async (id: string): Promise<void> => {
    await apiClient.delete(`/doctors/${id}`);
  },

  getDoctorPatients: async (id: string): Promise<Patient[]> => {
    const response = await apiClient.get(`/doctors/${id}/patients`);
    const resData = response.data;
    if (Array.isArray(resData.data?.patients)) {
      return resData.data.patients;
    }
    if (Array.isArray(resData.patients)) {
      return resData.patients;
    }
    if (Array.isArray(resData.data)) {
      return resData.data;
    }
    if (Array.isArray(resData)) {
      return resData;
    }
    return [];
  },
};

// Patient Services
export const patientsApi = {
  getPatients: async (
    params?: PatientQueryParams,
  ): Promise<PatientsResponseData> => {
    const response = await apiClient.get("/patients", { params });
    const resData = response.data;
    // Backend standard: { success: true, data: { patients: [], pagination: {} } }
    if (resData.data && resData.data.patients) {
      return resData.data;
    }
    if (resData.patients) {
      return {
        patients: resData.patients,
        pagination: resData.pagination || {
          page: 1,
          limit: 10,
          total: resData.patients.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
    if (Array.isArray(resData)) {
      return {
        patients: resData,
        pagination: {
          page: 1,
          limit: resData.length,
          total: resData.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
    return {
      patients: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  getPatient: async (id: string): Promise<Patient> => {
    const response = await apiClient.get(`/patients/${id}`);
    const resData = response.data;
    if (resData.data?.patient) {
      return resData.data.patient;
    }
    if (resData.data) {
      return resData.data;
    }
    return resData;
  },

  createPatient: async (data: PatientFormData): Promise<Patient> => {
    const response = await apiClient.post("/patients", data);
    return response.data?.data?.patient || response.data?.data || response.data;
  },

  updatePatient: async (
    id: string,
    data: Partial<PatientFormData>,
  ): Promise<Patient> => {
    const response = await apiClient.put(`/patients/${id}`, data);
    return response.data?.data?.patient || response.data?.data || response.data;
  },

  deletePatient: async (id: string): Promise<void> => {
    await apiClient.delete(`/patients/${id}`);
  },
};

// Analytics Services
export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/analytics/dashboard");
    const resData = response.data;
    if (resData.data) {
      return resData.data;
    }
    return resData;
  },
};
