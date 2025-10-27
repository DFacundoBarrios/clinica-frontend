import type { Paciente, PacienteCrearDto } from './../types/PacienteTypes.ts';
import { api } from 'src/shared/libs/nestAxios.ts';

export class PacientesService {
  static async crearPaciente(dto: PacienteCrearDto) {
    const resultado = await api.post('/patients', dto);
    return resultado;
  }

  static async obtenerPacientes() {
    const resultado = await api.get<Paciente[]>('/patients');
    return resultado.data;
  }

  static async obtenerPacientePorId(id: number) {
    const resultado = await api.get<Paciente>(`/patients/${id}`);
    return resultado.data;
  }

  static async actualizarPaciente(id: number, dto: PacienteCrearDto) {
    const resultado = await api.put(`/patients/${id}`, dto);
    return resultado;
  }

  static async eliminarPaciente(id: number) {
    const resultado = await api.delete(`/patients/${id}`);
    return resultado;
  }
}