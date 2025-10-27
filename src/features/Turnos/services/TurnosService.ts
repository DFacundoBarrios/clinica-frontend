import type { Turno, TurnoCrearDto } from './../types/TurnosTypes.ts';
import { api } from 'src/shared/libs/nestAxios.ts';

export class TurnosService {
  static async crearTurnos(dto: TurnoCrearDto) {
    const resultado = await api.post('/appointments', dto);
    return resultado;
  }

  static async obtenerTurnos() {
    const resultado = await api.get<Turno[]>('/appointments');
    return resultado.data;
  }

  static async obtenerTurnosPorId(id: number) {
    const resultado = await api.get<Turno>(`/appointments/${id}`);
    return resultado.data;
  }

  static async actualizarTurnos(id: number, dto: TurnoCrearDto) {
    const resultado = await api.put(`/appointments/${id}`, dto);
    return resultado;
  }

  static async eliminarTurno(id: number) {
    const resultado = await api.delete(`/appointments/${id}`);
    return resultado;
  }
}