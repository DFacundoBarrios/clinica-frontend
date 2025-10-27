import React, { useState, useEffect, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Alert,
    Button,
    Typography,
    MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { apiService } from 'src/services/api';
import type { Appointment, CreateAppointment, UpdateAppointment, AppointmentState } from 'src/types'; 

//form
const estadoInicialForm: CreateAppointment = {
    date: '',
    hour: '09:00', // 💡 Damos una hora por defecto
    observations: '',
    patientIdPatient: 0,
    doctorIdDoctor: 0,
    medicalOfficeNumberOffice: 0,
};

// 2. Tipo para el estado interno del formulario (incluye 'state' para edición)
type TurnoFormState = CreateAppointment & {
    state?: AppointmentState;
};

// 3. Props que el componente recibirá
export interface TurnoFormDialogProps {
    open: boolean;
    onClose: () => void;
    turnoInicial?: Appointment | null; // Usado para Edición
    onSuccess: (message: string) => void;
}


//modal de creacion

export const TurnoFormDialog: React.FC<TurnoFormDialogProps> = ({ open, onClose, turnoInicial, onSuccess }) => {

    const initialFormState = useMemo((): TurnoFormState => {
        if (turnoInicial) {
            const { date, hour, observations, state, patient, doctor, medical_office } = turnoInicial;

            // 💡 CORRECCIÓN 1: LECTURA/EDICIÓN (Manejo de Zona Horaria)
            let dateForInput = '';
            let hourForInput = '09:00'; // Default
            
            if (date) {

                const d = new Date(date); 

                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                dateForInput = `${year}-${month}-${day}`; // YYYY-MM-DD

                const h = d.getHours().toString().padStart(2, '0');
                const m = d.getMinutes().toString().padStart(2, '0');
                hourForInput = `${h}:${m}`; // HH:MM
            }


            return {
                date: dateForInput,      
                hour: hourForInput,      
                observations: observations || '',
                state: state,
                patientIdPatient: patient?.id_patient ?? 0,
                doctorIdDoctor: doctor?.id_doctor ?? 0,
                medicalOfficeNumberOffice: medical_office?.number_office ?? 0
            };
        }
        // Usa el objeto de estado inicial vacío para crear uno nuevo
        return estadoInicialForm;
    }, [turnoInicial]);

    // Estados internos del formulario
    const [form, setForm] = useState<TurnoFormState>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Efecto para resetear el formulario cuando cambian las props (ej. al abrir/cerrar)
    useEffect(() => {
        setForm(initialFormState);
        setError(null);
    }, [initialFormState, open]); // Resetea también cuando se abre

    const isEditing = !!turnoInicial;
    const dialogTitle = isEditing ? "EDITAR TURNO EXISTENTE" : "AGENDAR NUEVO TURNO";

    // Manejador genérico para los inputs
    function handleOnChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;

        const numericFields = ['patientIdPatient', 'doctorIdDoctor', 'medicalOfficeNumberOffice'];
        let finalValue: string | number = value;


        if (numericFields.includes(name)) {
            finalValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(finalValue)) {
                finalValue = 0; // Evita NaN en el estado
            }
        }

        setForm(prevFormData => ({ ...prevFormData, [name]: finalValue }));
        if (error) setError(null); // Limpia el error al escribir
    }

    // Envío del formulario
    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        // 💡 CORRECCIÓN 2: CREACIÓN/ENVÍO (Manejo de Zona Horaria)
        // El backend espera 'date' y 'hour' separados, pero interpreta 'date' como UTC.
        // Vamos a enviarle en el campo 'date' un string ISO 8601 completo
        // que él pueda parsear correctamente.
        
        // 1. Creamos un string "YYYY-MM-DDTHH:MM" (Ej: "2025-10-27T09:00")
        const localDateTimeString = `${form.date}T${form.hour}`;

        // 2. Creamos un objeto Date. JS lo interpretará como HORA LOCAL.
        const localDate = new Date(localDateTimeString); // Ej: 27 Oct 2025 09:00:00 (GTM-3)
        
        // 3. Convertimos a string ISO 8601 (que es UTC)
        // Ej: 27 Oct 2025 12:00:00 (UTC)
        const dateAsISOString = localDate.toISOString(); 

        try {
            if (isEditing) {
                const id = turnoInicial!.id_appointment;
                
                // 💡 Enviamos el DTO de actualización con la fecha ISO
                const updatePayload: UpdateAppointment = {
                    ...form,
                    date: dateAsISOString,
                    patientId: form.patientIdPatient,
                    doctorId: form.doctorIdDoctor,
                    medicalOfficeNumber: form.medicalOfficeNumberOffice,
                };
                
                await apiService.updateAppointment(id, updatePayload);
                onSuccess(`Turno ${id} actualizado con éxito.`);
            
            } else {
                const { state, ...createPayload } = form;
                
                // 💡 Enviamos el DTO de creación con la fecha ISO
                const finalCreatePayload: CreateAppointment = {
                    ...createPayload,
                    date: dateAsISOString,
                };
                
                await apiService.createAppointment(finalCreatePayload);
                onSuccess(`Turno creado con éxito.`);
            }
            onClose(); // Cierra el modal solo si fue exitoso
        } catch (e) {
            console.error(e);
            // Intenta obtener un mensaje de error más específico si la API lo envía
            const errorMsg = (e as any).response?.data?.message || "Error al guardar el turno. Inténtalo de nuevo.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
        >
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">{dialogTitle}</Typography>
            </DialogTitle>
            
            <form onSubmit={handleOnSubmit}>
                
                <DialogContent dividers sx={{ pt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Stack spacing={2}>
                        
                        {/* IDs de relaciones */}
                        <TextField
                            fullWidth required type="number" name="patientIdPatient"
                            label="ID Paciente" value={form.patientIdPatient || ''}
                            onChange={handleOnChange} variant="outlined"
                        />
                        <TextField
                            fullWidth required type="number" name="doctorIdDoctor"
                            label="ID Médico" value={form.doctorIdDoctor || ''}
                            onChange={handleOnChange} variant="outlined"
                        />
                        <TextField
                            fullWidth required type="number" name="medicalOfficeNumberOffice"
                            label="Nro. Consultorio" value={form.medicalOfficeNumberOffice || ''} 
                            onChange={handleOnChange} variant="outlined"
                        />

                        {/* Fecha y Hora */}
                        <TextField
                            fullWidth required label="Fecha" name="date" type="date"
                            value={form.date} // 💡 Sigue siendo 'YYYY-MM-DD'
                            onChange={handleOnChange}
                            variant="outlined" InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth required label="Hora" name="hour" type="time"
                            value={form.hour} // 💡 Sigue siendo 'HH:MM'
                            onChange={handleOnChange}
                            variant="outlined" InputLabelProps={{ shrink: true }}
                        />

                        {/* Selector de Estado (solo en modo edición) */}
                        {isEditing && (
                            <TextField
                                select 
                                fullWidth
                                label="Estado"
                                name="state"
                                value={form.state ?? ''} // Maneja valor inicial undefined
                                onChange={handleOnChange} 
                                variant="outlined"
                            >
                                {/* Deberías tomar estos valores de tu Enum en src/types/index.ts */}
                                <MenuItem value={"RESERVADO"}>Reservado</MenuItem>
                                <MenuItem value={"ATENDIDO"}>Atendido</MenuItem>
                                <MenuItem value={"CANCELADO"}>Cancelado</MenuItem>
                            </TextField>
                        )}

                        {/* Observaciones */}
                        <TextField
                            fullWidth label="Observaciones" name="observations"
                            value={form.observations} onChange={handleOnChange}
                            variant="outlined" multiline rows={3}
                        />
                    </Stack>
                </DialogContent>
                
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} startIcon={<CancelIcon />} variant="outlined" color="secondary" disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" startIcon={<SaveIcon />} variant="contained" color="primary" disabled={isLoading}>
                        {isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : 'Guardar'}
                    </Button>
                </DialogActions>
                
            </form>
        </Dialog>
    );
};