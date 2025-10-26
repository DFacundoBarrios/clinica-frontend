// ============================================
// ENUMS
// ============================================

export type AppointmentState = 'reserved' | 'attended' | 'canceled';

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface Patient {
  id_patient: number;
  name: string;
  lastname: string;
  dni: string;
  phone: string;
  address: string;
  appointments?: Appointment[];
}

export interface Doctor {
  id_doctor: number;
  name: string;
  lastname: string;
  enrollment: string;
  start_time: string;
  end_time: string;
  medical_specialty?: MedicalSpecialty[];
  appointments?: Appointment[];
  medical_office?: MedicalOffice;
}

export interface MedicalSpecialty {
  id_specialty: number;
  specialty_name: string;
  doctor?: Doctor[];
}

export interface MedicalOffice {
  number_office: number;
  doctor?: Doctor;
  appointments?: Appointment[];
}

export interface Appointment {
  id_appointment: number;
  date: string; // Viene como string desde JSON
  hour: string;
  observations: string;
  state: AppointmentState;
  patient?: Patient;
  doctor?: Doctor;
  medical_office?: MedicalOffice;
}

// ============================================
// TIPOS PARA CREAR (sin ID)
// ============================================

export interface CreatePatient {
  name: string;
  lastname: string;
  dni: string;
  phone: string;
  address: string;
}


export interface CreateAppointment {
  date: string; // formato: 'YYYY-MM-DD'
  hour: string; // formato: 'HH:MM'
  observations?: string;
  patientId: number;
  doctorId: number;
  medicalOfficeNumber: number;
  state?: AppointmentState;
}

// ============================================
// TIPOS PARA ACTUALIZAR (Partial)
// ============================================

export type UpdatePatient = Partial<CreatePatient>;

export interface UpdateAppointment {
  date?: string;
  hour?: string;
  observations?: string;
  state?: AppointmentState;
  patientId?: number;
  doctorId?: number;
  medicalOfficeNumber?: number;
}

// ============================================
// TIPOS AUXILIARES
// ============================================

// Para mostrar doctor con nombre completo
export interface DoctorDisplay extends Doctor {
  fullName: string;
}

// Para mostrar paciente con nombre completo
export interface PatientDisplay extends Patient {
  fullName: string;
}

// Para filtros de turnos
export interface AppointmentFilters {
  date?: string;
  doctorId?: number;
  patientId?: number;
  state?: AppointmentState;
}
