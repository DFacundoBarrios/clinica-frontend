export interface Turno {
    id_turno: number;
    id_paciente: number;
    id_medico: number;
    numero_consultorio: number;
    fecha: string;
    hora: string;
    observaciones: string;
    estado: string;
}

export interface TurnoCrearDto {
    id_paciente: number;
    id_medico: number;
    numero_consultorio: number;
    fecha: string;
    hora: string;
    observaciones: string;
    estado: string;
}