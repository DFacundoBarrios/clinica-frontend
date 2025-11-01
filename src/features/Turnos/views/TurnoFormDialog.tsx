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
    CircularProgress,
    Button,
    Typography,
    MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { apiService } from 'src/services/api';
import type { Appointment, CreateAppointment, UpdateAppointment, AppointmentState, Patient, MedicalOffice, Doctor } from 'src/types';

//form
const estadoInicialForm: CreateAppointment = {
    date: '',
    hour: '08:00',
    observations: '',
    patientIdPatient: 0,
    doctorIdDoctor: 0,
    medicalOfficeNumberOffice: 0,
};

//Tipo para el estado interno del formulario (incluye 'state' para edición)
type TurnoFormState = CreateAppointment & {
    state?: AppointmentState;
};

// Props que el componente recibirá
export interface TurnoFormDialogProps {
    open: boolean;
    onClose: () => void;
    turnoInicial?: Appointment | null; 
    onSuccess: (message: string) => void;
    turnos: Appointment[];
}


//modal de creacion

export const TurnoFormDialog: React.FC<TurnoFormDialogProps> = ({ open, onClose, turnoInicial, onSuccess, turnos }) => {

    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        // Generar horarios desde las 08:00 hasta las 19:30
        for (let hour = 8; hour < 20; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
    }, []);

    const initialFormState = useMemo((): TurnoFormState => {
        if (turnoInicial) {
            const { date, observations, state, patient, doctor, medical_office } = turnoInicial;

            let dateForInput = '';
            let hourForInput = '08:00'; // Default

            if (date) {

                const d = new Date(date);

                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, '0');
                const day = d.getDate().toString().padStart(2, '0');
                dateForInput = `${year}-${month}-${day}`; 

                const h = d.getHours().toString().padStart(2, '0');
                const m = d.getMinutes().toString().padStart(2, '0');
                hourForInput = `${h}:${m}`;
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
    const [listIsLoading, setListIsLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);

    //para el select
    const [pacientes, setPacientes] = useState<Patient[]>([]);
    const [doctores, setDoctores] = useState<Doctor[]>([]);
    const [consultorios, setConsultorios] = useState<MedicalOffice[]>([]);

//useeffect
    useEffect(() => {
        setForm(initialFormState);
        setListError(null); // Resetea el error de submit
        setListError(null); // Resetea el error de carga de listas

        // Función para cargar los datos de los selects
        const loadDropdownData = async () => {
            setListIsLoading(true);
            try {
                // Hacemos las llamadas en paralelo para más eficiencia
                const [pacientesData, doctoresData, consultoriosData] = await Promise.all([
                    apiService.getPatients(),
                    apiService.getDoctors(),
                    apiService.getMedicalOffices()
                ]);

                setPacientes(pacientesData.data);
                setDoctores(doctoresData.data);
                setConsultorios(consultoriosData.data);

            } catch (err) {
                console.error("Error cargando datos para los selects", err);
                setListError("No se pudieron cargar los datos para los campos de selección. Intente de nuevo.");
            } finally {
                setListIsLoading(false);
            }
        };

        // Solo carga los datos si el modal está abierto
        if (open) {
            loadDropdownData();
        }

    }, [initialFormState, open]); // Se ejecuta cada vez que 'open' cambia // Resetea también cuando se abre

    const isEditing = !!turnoInicial;
    const dialogTitle = isEditing ? "EDITAR TURNO EXISTENTE" : "AGENDAR NUEVO TURNO";

    // Manejador genérico para los inputs
    function handleOnChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;

        if (listError) setListError(null); // Limpia 

        const numericFields = ['patientIdPatient', 'doctorIdDoctor', 'medicalOfficeNumberOffice'];
        let finalValue: string | number = value;

        // 1. Convierte el valor a número si es necesario
        if (numericFields.includes(name)) {
            finalValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(finalValue)) {
                finalValue = 0;
            }
        }

        if (name === 'doctorIdDoctor') {
            const selectedDoctorId = finalValue as number;

            // Busca el objeto Doctor completo en tu estado
            const selectedDoctor = doctores.find(
                (doc) => doc.id_doctor === selectedDoctorId
            );

            // número de consultorio de ese doctor
            const officeNumber = selectedDoctor
                ? selectedDoctor.medical_office?.number_office ?? 0
                : 0;


            setForm(prevFormData => ({
                ...prevFormData,
                doctorIdDoctor: selectedDoctorId,
                medicalOfficeNumberOffice: officeNumber
            }));

        } else {
            // Si es cualquier otro campo, actualiza normalmente
            setForm(prevFormData => ({
                ...prevFormData,
                [name]: finalValue
            }));
        }
    }

    // Envío del formulario
    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setListError(null);
        setListIsLoading(true);


        const localDateTimeString = `${form.date}T${form.hour}`;

        const selectedDateTime = new Date(localDateTimeString);
        const now = new Date();

        if (selectedDateTime < now) {
            setListError("La fecha y hora del turno no pueden ser anteriores a la actual.");
            setListIsLoading(false);
            return;
        }

        // Validación de turnos duplicados
        const turnoExistente = turnos.find(turno => {
            if (isEditing && turno.id_appointment === turnoInicial.id_appointment) {
                return false;
            }
            const turnoDate = new Date(turno.date).toISOString().split('T')[0];
            const turnoHour = turno.hour.substring(0, 5);
            const formHour = form.hour.substring(0, 5);

            return turno.doctor?.id_doctor === form.doctorIdDoctor && turnoDate === form.date && turnoHour === formHour;
        });

        if (turnoExistente) {
            setListError("Ya existe un turno para este médico en la misma fecha y hora.");
            setListIsLoading(false);
            return;
        }

        const dateAsISOString = selectedDateTime.toISOString();

        try {
            if (isEditing) {
                const id = turnoInicial!.id_appointment;

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

                //DTO de creación con la fecha ISO
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
            const errorMsg = (e as any).response?.data?.message || "Error al guardar el turno. Inténtalo de nuevo.";
            setListError(errorMsg);
        } finally {
            setListIsLoading(false);
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
                    {/* Alertas de Errores */}
                    {listError && <Alert severity="error" sx={{ mb: 2 }}>{listError}</Alert>}

                    {/* Muestra un spinner si las listas están cargando */}
                    {listIsLoading ? (
                        <Stack alignItems="center" sx={{ my: 4 }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 1 }}>Cargando datos...</Typography>
                        </Stack>
                    ) : (
                        // Oculta el formulario mientras cargan las listas
                        <Stack spacing={2}>

                            {/* --- SELECTS) --- */}

                            <TextField
                                select
                                fullWidth
                                required
                                name="patientIdPatient"
                                label="Paciente"
                                value={form.patientIdPatient || ''}
                                onChange={handleOnChange}
                                variant="outlined"
                                disabled={listIsLoading}
                            >
                                {pacientes.map((p) => (
                                    <MenuItem key={p.id_patient} value={p.id_patient}>
                                        {`${p.name} ${p.lastname} (DNI: ${p.dni})`}
                                    </MenuItem>
                                ))}
                                {pacientes.length === 0 && <MenuItem disabled>No hay pacientes</MenuItem>}
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                required
                                name="doctorIdDoctor"
                                label="Médico"
                                value={form.doctorIdDoctor || ''}
                                onChange={handleOnChange}
                                variant="outlined"
                                disabled={listIsLoading}
                            >
                               
                                {doctores.map((d) => (
                                    <MenuItem key={d.id_doctor} value={d.id_doctor}>
                                        {`${d.name} ${d.lastname}`}
                                    </MenuItem>
                                ))}
                                {doctores.length === 0 && <MenuItem disabled>No hay médicos</MenuItem>}
                            </TextField>

                            <TextField
                                select
                                fullWidth
                                required
                                name="medicalOfficeNumberOffice"
                                label="Nro. Consultorio"
                                value={form.medicalOfficeNumberOffice || ''}
                                onChange={handleOnChange} 
                                variant="outlined"
                                disabled={true}
                            >
                                
                                {consultorios.map((c) => (
                                    <MenuItem key={c.number_office} value={c.number_office}>
                                        {`Consultorio ${c.number_office}`}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* --- Fecha y Hora --- */}
                            <TextField
                                fullWidth required label="Fecha" name="date" type="date"
                                value={form.date}
                                onChange={handleOnChange}
                                variant="outlined" InputLabelProps={{ shrink: true }}
                                disabled={listIsLoading}
                                
                            />
                             <TextField
                                select
                                fullWidth required label="Hora" name="hour"
                                value={form.hour}
                                onChange={handleOnChange}
                                variant="outlined" InputLabelProps={{ shrink: true }}
                                disabled={listIsLoading}
                            >
                                {timeSlots.map(time => (
                                    <MenuItem key={time} value={time}>{time}</MenuItem>
                                ))}
                            </TextField>

                            {/* --- Selector de Estado (solo en modo edición) --- */}
                            {isEditing && (
                                <TextField
                                    select
                                    fullWidth
                                    label="Estado"
                                    name="state"
                                    value={form.state ?? ''} // Maneja valor inicial undefined
                                    onChange={handleOnChange}
                                    variant="outlined"
                                    disabled={listIsLoading}
                                >
                                    <MenuItem value={"RESERVADO"}>Reservado</MenuItem>
                                    <MenuItem value={"ATENDIDO"}>Atendido</MenuItem>
                                </TextField>
                            )}

                            {/* --- Observaciones --- */}
                            <TextField
                                fullWidth label="Observaciones" name="observations"
                                value={form.observations} onChange={handleOnChange}
                                variant="outlined" multiline rows={3}
                                disabled={listIsLoading}
                            />
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} startIcon={<CancelIcon />} variant="outlined" color="secondary" disabled={listIsLoading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        startIcon={<SaveIcon />}
                        variant="contained"
                        color="primary"
                        disabled={listIsLoading}
                    >
                        {listIsLoading ? (isEditing ? 'Guardando...' : 'Creando...') : 'Guardar'}
                    </Button>
                </DialogActions>

            </form>
        </Dialog>
    );
};