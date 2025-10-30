import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  Patient,
  Doctor,
  MedicalSpecialty,
  MedicalOffice,
  Appointment,
  CreatePatient,
  CreateAppointment,
  UpdatePatient,
  UpdateAppointment,
  AppointmentReport,
} from '../types';


const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(` ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Error en la API:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const apiService = {
  // ============ PACIENTES ============
  getPatients: (): Promise<AxiosResponse<Patient[]>> =>
    api.get<Patient[]>('/patients'),

  getPatient: (id: number): Promise<AxiosResponse<Patient>> =>
    api.get<Patient>(`/patients/${id}`),

  createPatient: (patient: CreatePatient): Promise<AxiosResponse<Patient>> =>
    api.post<Patient>('/patients', patient),

  updatePatient: (id: number, patient: UpdatePatient): Promise<AxiosResponse<Patient>> =>
    api.put<Patient>(`/patients/${id}`, patient),

  deletePatient: (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/patients/${id}`),

  // ============ DOCTORES ============
  getDoctors: (): Promise<AxiosResponse<Doctor[]>> =>
    api.get<Doctor[]>('/doctors'),

  getDoctor: (id: number): Promise<AxiosResponse<Doctor>> =>
    api.get<Doctor>(`/doctors/${id}`),

  // ============ TURNOS ============
  getAppointments: (): Promise<AxiosResponse<Appointment[]>> =>
    api.get<Appointment[]>('/appointments'),

  getAppointment: (id: number): Promise<AxiosResponse<Appointment>> =>
    api.get<Appointment>(`/appointments/${id}`),

  createAppointment: (appointment: CreateAppointment): Promise<AxiosResponse<Appointment>> =>
    api.post<Appointment>('/appointments', appointment),

  updateAppointment: (id: number, appointment: UpdateAppointment): Promise<AxiosResponse<Appointment>> =>
    api.put<Appointment>(`/appointments/${id}`, appointment),

  deleteAppointment: (id: number): Promise<AxiosResponse<void>> =>
    api.delete<void>(`/appointments/${id}`),

  // ============ ESPECIALIDADES MÉDICAS ============
  getMedicalSpecialties: (): Promise<AxiosResponse<MedicalSpecialty[]>> =>
    api.get<MedicalSpecialty[]>('/medical-specialty'),

  getMedicalSpecialty: (id: number): Promise<AxiosResponse<MedicalSpecialty>> =>
    api.get<MedicalSpecialty>(`/medical-specialty/${id}`),

  // ============ CONSULTORIOS ============
  getMedicalOffices: (): Promise<AxiosResponse<MedicalOffice[]>> =>
    api.get<MedicalOffice[]>('/medical-office'),

  getMedicalOffice: (number: number): Promise<AxiosResponse<MedicalOffice>> =>
    api.get<MedicalOffice>(`/medical-office/${number}`),

  // ============ REPORTES ================
  getAppointmentsReport: (params: URLSearchParams): Promise<AxiosResponse<AppointmentReport[]>> =>
    api.get<AppointmentReport[]>('/reports/appointments', { params }),
  
  getDoctorsReport: (params: URLSearchParams): Promise<AxiosResponse<Doctor[]>> =>
    api.get<Doctor[]>('/reports/doctors', { params }),
}

export default api;
