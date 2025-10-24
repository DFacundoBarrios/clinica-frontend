import type { Paciente, PacienteCrearDto } from './../types/PacienteTypes.ts';
import { api } from 'src/shared/libs/nestAxios.ts';

export class PacientesService {
  static async crearPaciente(dto: PacienteCrearDto) {
    const resultado = await api.post('/api/pacientes', dto);
    return resultado;
  }

  static async obtenerPacientes() {
    const resultado = await api.get<Paciente[]>('/api/pacientes');
    return resultado.data;
  }

  static async obtenerPacientePorId(id: number) {
    const resultado = await api.get<Paciente>(`/api/pacientes/${id}`);
    return resultado.data;
  }

  static async actualizarPaciente(id: number, dto: PacienteCrearDto) {
    const resultado = await api.put(`/api/pacientes/${id}`, dto);
    return resultado;
  }

  static async eliminarPaciente(id: number) {
    const resultado = await api.delete(`/api/pacientes/${id}`);
    return resultado;
  }
}