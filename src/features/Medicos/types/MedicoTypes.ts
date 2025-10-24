export interface Medico {
  id_medico: number;
  nombre: string;
  apellido: string;
  matricula: string;
  horario_atencion: string;
}

export interface MedicoCrearDto {
  nombre: string;
  apellido: string;
  matricula: string;
  horario_atencion: string;
}