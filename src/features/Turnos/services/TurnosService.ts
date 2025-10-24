import type { Turno, TurnoCrearDto } from './../types/TurnosTypes.ts';
import { api } from 'src/shared/libs/nestAxios.ts';

export class TurnosService {
  static async crearTurnos(dto: TurnoCrearDto) {
    const resultado = await api.post('/api/turnos', dto);
    return resultado;
  }

  static async obtenerTurnos() {
    const resultado = await api.get<Turno[]>('/api/turnos');
    return resultado.data;
  }

  static async obtenerTurnosPorId(id: number) {
    const resultado = await api.get<Turno>(`/api/turnos/${id}`);
    return resultado.data;
  }

  static async actualizarTurnos(id: number, dto: TurnoCrearDto) {
    const resultado = await api.put(`/api/turnos/${id}`, dto);
    return resultado;
  }

  static async eliminarTurno(id: number) {
    const resultado = await api.delete(`/api/turnos/${id}`);
    return resultado;
  }
}