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


// 1. Estado inicial del formulario (basado en CreateAppointment de src/types/index.ts)
const estadoInicialForm: CreateAppointment = {
    date: '',
    hour: '',
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
            return {
                date: date || '',
                hour: hour || '',
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

        try {
            if (isEditing) {
                const id = turnoInicial!.id_appointment;
                await apiService.updateAppointment(id, form as UpdateAppointment);
                onSuccess(`Turno ${id} actualizado con éxito.`);
            } else {
                const { state, ...createPayload } = form;
                await apiService.createAppointment(createPayload as CreateAppointment);
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
                            value={form.date} onChange={handleOnChange}
                            variant="outlined" InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth required label="Hora" name="hour" type="time"
                            value={form.hour} onChange={handleOnChange}
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