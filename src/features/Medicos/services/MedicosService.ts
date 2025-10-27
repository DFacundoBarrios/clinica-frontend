import type { Medico, MedicoCrearDto } from './../types/MedicoTypes.ts';
import { api } from 'src/shared/libs/nestAxios.ts';

export class MedicosService {
 static async crearMedico(dto: MedicoCrearDto) {
     const resultado = await api.post('/doctors', dto);
     return resultado;
   }
 
   static async obtenerMedicos() {
     const resultado = await api.get<Medico[]>('/doctors');
     return resultado.data;
   }
 
   static async obtenerMedicoPorId(id: number) {
     const resultado = await api.get<Medico>(`/doctors/${id}`);
     return resultado.data;
   }
 
   static async actualizarMedico(id: number, dto: MedicoCrearDto) {
     const resultado = await api.put(`/doctors/${id}`, dto);
     return resultado;
   }
 
   static async eliminarMedico(id: number) {
     const resultado = await api.delete(`/doctors/${id}`);
     return resultado;
   }

}