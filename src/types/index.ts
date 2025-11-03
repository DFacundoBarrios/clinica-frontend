// ============================================
// ENUMS
// ============================================

export type AppointmentState = 'RESERVADO' | 'ATENDIDO' | 'CANCELADO';

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
  appointments?: (Omit<Appointment, 'patient'> & { patientIdPatient?: number })[];
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
  date: string;
  hour: string;
  observations?: string;
  state?: AppointmentState;
  patient?: Patient;
  patientIdPatient?: number; 
  doctor?: Doctor;
  medical_office?: MedicalOffice;
}

export interface CreateAppointment {
  date: string;
  hour: string;
  observations?: string;
  patientIdPatient: number;
  doctorIdDoctor: number;
  medicalOfficeNumberOffice: number;
}


export interface CreatePatient {
  name: string;
  lastname: string;
  dni: string;
  phone: string;
  address: string;
}


// ============================================
// TIPOS PARA ACTUALIZAR 
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

export interface DoctorDisplay extends Doctor {
  fullName: string;
}

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

// Para el historial de reportes
export interface AppointmentReport {
    id_appointment: number;
    date: string;
    hour: string;
    patient: { name: string; lastname: string; };
    doctor: { name: string; lastname: string; };
}