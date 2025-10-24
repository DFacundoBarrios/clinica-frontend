export interface Paciente {
id_paciente: number;
nombre: string;
apellido: string;
dni: string;
telefono: string;
direccion: string;
}

export interface PacienteCrearDto {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    direccion: string;
}