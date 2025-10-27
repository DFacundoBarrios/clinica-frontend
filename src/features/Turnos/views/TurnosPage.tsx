import React, { useEffect, useState, useCallback, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from "react";

import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Alert,
    CircularProgress,
    MenuItem
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { apiService } from 'src/services/api';
import type { Appointment, CreateAppointment, UpdateAppointment, AppointmentState } from 'src/types';


type TurnoFormState = CreateAppointment & {
    state?: AppointmentState;
};

const estadoInicialForm: CreateAppointment = {
    date: '',
    hour: '',
    observations: '',
    patientIdPatient: 0,
    doctorIdDoctor: 0,
    medicalOfficeNumberOffice: 0,
};

// 2. Adaptador de Servicio (usa apiService)
const TurnosAdapterService = {
    obtenerTurnos: async (): Promise<Appointment[]> => {
        const response = await apiService.getAppointments();
        return response.data;
    },
    eliminarTurno: async (id: number): Promise<void> => {
        await apiService.deleteAppointment(id);
    }
};


interface TurnoFormDialogProps {
    open: boolean;
    onClose: () => void;
    turnoInicial?: Appointment | null;
    onSuccess: (message: string) => void;
}

const TurnoFormDialog: React.FC<TurnoFormDialogProps> = ({ open, onClose, turnoInicial, onSuccess }) => {

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

        return estadoInicialForm;
    }, [turnoInicial]);

    const [form, setForm] = useState<TurnoFormState>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        setForm(initialFormState);
        setError(null);
    }, [initialFormState]);

    const isEditing = !!turnoInicial;
    const dialogTitle = isEditing ? "Editar Turno Existente" : "Crear Nuevo Turno";

    function handleOnChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;

        const numericFields = ['patientIdPatient', 'doctorIdDoctor', 'medicalOfficeNumberOffice'];
        let finalValue: string | number = value;

        if (numericFields.includes(name)) {
            finalValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(finalValue)) {
                finalValue = 0;
            }
        }

        setForm(prevFormData => ({ ...prevFormData, [name]: finalValue }));
    }

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
            onClose(); 
        } catch (e) {
            console.error(e);
            const errorMsg = (e as any).response?.data?.message || "Error al guardar el turno. Inténtalo de nuevo.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">{dialogTitle}</Typography>
            </DialogTitle>
            <form onSubmit={handleOnSubmit}>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Stack spacing={2} sx={{ pt: 1 }}>

                        
                        <TextField
                            fullWidth
                            required
                            type="number"
                            name="patientIdPatient"
                            label="ID Paciente"
                            value={form.patientIdPatient || ''}
                            onChange={handleOnChange}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            required
                            type="number"
                            name="doctorIdDoctor"
                            label="ID Médico"
                            value={form.doctorIdDoctor || ''}
                            onChange={handleOnChange}
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            required
                            type="number"
                            name="medicalOfficeNumberOffice"
                            label="Nro. Consultorio"
                            value={form.medicalOfficeNumberOffice || ''} 
                            onChange={handleOnChange} 
                            variant="outlined"
                        />

                        <TextField
                            fullWidth
                            required
                            label="Fecha"
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleOnChange}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Hora"
                            name="hour"
                            type="time"
                            value={form.hour}
                            onChange={handleOnChange}
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />

                        {isEditing && (
                            <TextField
                                select 
                                fullWidth
                                label="Estado"
                                name="state"
                                value={form.state ?? ''} 
                                onChange={handleOnChange} 
                                variant="outlined"
                            >
                                
                                <MenuItem value={"RESERVADO"}>Reservado</MenuItem>
                                <MenuItem value={"ATENDIDO"}>Atendido</MenuItem>
                                <MenuItem value={"CANCELADO"}>Cancelado</MenuItem>
                            </TextField>
                        )}

                        <TextField
                            fullWidth
                            label="Observaciones"
                            name="observations"
                            value={form.observations}
                            onChange={handleOnChange}
                            variant="outlined"
                            multiline
                            rows={3}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} startIcon={<CancelIcon />} variant="outlined" color="secondary" disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="submit" startIcon={<SaveIcon />} variant="contained" color="primary" disabled={isLoading}>
                        {isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : 'Guardar Turno'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

// =================================================================
// 💡 COMPONENTE PRINCIPAL - TurnosPage
// =================================================================

export default function TurnosPage() {
    const [turnos, setTurnos] = useState<Appointment[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [turnoToEdit, setTurnoToEdit] = useState<Appointment | null>(null);
    const [turnoToCancel, setTurnoToCancel] = useState<Appointment | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    const fetchTurnos = useCallback(async () => {
        setIsLoadingList(true);
        try {
            const resultado = await TurnosAdapterService.obtenerTurnos();
            setTurnos(resultado);
        } catch (error) {
            console.error("Error al cargar turnos:", error);
            setAlertMessage({ tipo: 'error', texto: 'Error al cargar la agenda de turnos.' });
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchTurnos();
    }, [fetchTurnos]);

    // Manejadores de Modal (sin cambios)
    const handleOpenCreate = () => {
        setTurnoToEdit(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (turno: Appointment) => {
        setTurnoToEdit(turno);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setTurnoToEdit(null);
    };

    const handleSuccess = (message: string) => {
        setAlertMessage({ tipo: 'success', texto: message });
        fetchTurnos();
    };

    // Manejadores de Eliminación
    const handleConfirmCancel = async () => {
        if (!turnoToCancel) return;

        try {


            await apiService.updateAppointment(turnoToCancel.id_appointment, {
                state: 'CANCELADO'
            } as UpdateAppointment);

            handleSuccess(`Turno del día ${turnoToCancel.date} a las ${turnoToCancel.hour} ha sido cancelado.`);

        } catch (error) {
            console.error("Error al cancelar turno:", error);
            setAlertMessage({ tipo: 'error', texto: `No se pudo cancelar el turno.` });
        } finally {
            setTurnoToCancel(null);
        }
    };


    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    // Función de ayuda para obtener el color del estado
    const getEstadoColor = (state: string) => {
        switch (state.toLowerCase()) {
            case 'confirmado':
            case 'reserved':
                return 'success.main';
            case 'pendiente':
                return 'warning.main';
            case 'cancelado':
                return 'error.main';
            default:
                return 'text.secondary';
        }
    };


    return (
        <Box sx={{ p: 3 }}>

            {/* Título y Botón Principal (Header) */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3, pb: 1,
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                    AGENDA DE TURNOS 🗓️
                </Typography>

                <Button
                    variant="contained" color="primary" size="large"
                    startIcon={<AddIcon />} onClick={handleOpenCreate}
                    disabled={isLoadingList}
                >
                    Crear Nuevo Turno
                </Button>
            </Box>

            {/* Mensaje de Alerta (Éxito/Error) */}
            {alertMessage && (
                <Alert
                    severity={alertMessage.tipo}
                    onClose={() => setAlertMessage(null)}
                    sx={{ mb: 2 }}
                >
                    {alertMessage.texto}
                </Alert>
            )}

            {/* Indicador de carga */}
            {isLoadingList && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            )}

            {/* Lista/Tabla de Turnos */}
            <Paper elevation={3}>
                <TableContainer>
                    <Table sx={{ minWidth: 800 }} aria-label="tabla de turnos">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Fecha / Hora</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Paciente (ID)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Médico (ID)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Consultorio (Nro)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Observaciones</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Manejo de estado de carga y datos vacíos */}
                            {!isLoadingList && turnos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay turnos agendados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                turnos.map((turno) => (
                                    <TableRow
                                        key={turno.id_appointment}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <AccessTimeIcon fontSize="small" color="disabled" />
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{turno.date}</Typography>
                                                <Typography variant="body2" color="text.secondary">({turno.hour})</Typography>
                                            </Stack>
                                        </TableCell>

                                        {/* 💡 CELDAS: LECTURA SEGURA de IDs ANIDADOS */}
                                        <TableCell>{turno.patient?.id_patient ?? '-'}</TableCell>
                                        <TableCell>{turno.doctor?.id_doctor ?? '-'}</TableCell>
                                        <TableCell>{turno.medical_office?.number_office ?? '-'}</TableCell>

                                        <TableCell>{turno.observations?.substring(0, 30)}...</TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    bgcolor: getEstadoColor(turno.state ?? ''),
                                                    color: 'white',
                                                    px: 1, py: 0.5, borderRadius: 1,
                                                    display: 'inline-block', fontSize: '0.8rem', fontWeight: 500
                                                }}
                                            >
                                                {turno.state}
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            {/* Botón Editar */}
                                            <IconButton
                                                color="primary" size="small"
                                                onClick={() => handleOpenEdit(turno)} sx={{ mr: 1 }}
                                            >
                                                <EditOutlinedIcon />
                                            </IconButton>

                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => setTurnoToCancel(turno)} // 👈
                                            >
                                                <DeleteOutlineOutlinedIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modal de Creación/Edición */}
            <TurnoFormDialog
                open={openDialog}
                onClose={handleCloseDialog}
                turnoInicial={turnoToEdit}
                onSuccess={handleSuccess}
            />

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog
                open={!!turnoToCancel} // 👈
                onClose={() => setTurnoToCancel(null)} // 👈
                maxWidth="xs"
            >
                <DialogTitle sx={{ color: 'error.main' }}>Confirmar Cancelación de Turno</DialogTitle> // 👈
                <DialogContent dividers>
                    <Typography>
                        ¿Estás seguro de que deseas **cancelar** el turno del día **{turnoToCancel?.date}** a las **{turnoToCancel?.hour}**?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTurnoToCancel(null)} startIcon={<CancelIcon />}> // 👈
                        No, mantener
                    </Button>
                    <Button onClick={handleConfirmCancel} color="error" variant="contained" startIcon={<DeleteOutlineOutlinedIcon />} autoFocus> // 👈
                        Sí, Cancelar Turno // 👈
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}