import  { useEffect, useState } from 'react';

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
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

//para el backend
import { useApi } from 'src/hooks/useApi';
import { apiService } from 'src/services/api';
import type { Appointment, UpdateAppointment } from 'src/types';
import { TurnoFormDialog } from './TurnoFormDialog';


//Componente principal
export default function TurnosPage() {

    const {
        data: turnos,
        loading: isLoadingList,
        error: errorList,
        execute: fetchTurnos 
    } = useApi<Appointment[]>(apiService.getAppointments); 

    const [openDialog, setOpenDialog] = useState(false);
    const [turnoToEdit, setTurnoToEdit] = useState<Appointment | null>(null);
    const [turnoToCancel, setTurnoToCancel] = useState<Appointment | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);


    useEffect(() => {
        if (errorList) {
            setAlertMessage({ tipo: 'error', texto: errorList });
        }
    }, [errorList]);


    // Manejadores de Modal
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

    // 💡 5. 'handleSuccess' ahora llama a 'fetchTurnos' (que es el 'execute' del hook)
    const handleSuccess = (message: string) => {
        setAlertMessage({ tipo: 'success', texto: message });
        fetchTurnos(); 
    };

    // Manejadores de Eliminación (Cancelación)
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

    // Timer de Alerta 
    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    // Función de ayuda 
    const getEstadoColor = (state: string) => {
        switch (state.toLowerCase()) {
            case 'confirmado':
            case 'reserved': 
            case 'reservado': 
                return 'success.main';
            case 'pendiente':
            case 'atendido': 
                return 'warning.main';
            case 'cancelado':
                return 'error.main';
            default:
                return 'text.secondary';
        }
    };


    return (
        <Box sx={{ p: 3 }}>

            <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 1,
                    borderBottom: '1px solid #e0e0e0' 
                }}>
                <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                    AGENDA DE TURNOS 🗓️
                </Typography>

                <Button
                    variant="contained" color="primary" size="large"
                    startIcon={<AddIcon />} onClick={handleOpenCreate}
                    disabled={isLoadingList} 
                >
                    NUEVO TURNO
                </Button>
            </Box>

            {/* Mensaje de Alerta  */}
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
                        {/* ... (TableHead sin cambios) ... */}
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
                            {/* 💡 6. Lógica de renderizado actualizada para 'null' */}
                            {!isLoadingList && (!turnos || turnos.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay turnos agendados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // 💡 7. Mapeo seguro con (turnos ?? [])
                                (turnos ?? []).map((turno) => (
                                    <TableRow
                                        key={turno.id_appointment}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        {/* ... (Celdas de la tabla sin cambios) ... */}
                                        <TableCell component="th" scope="row">
                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                <AccessTimeIcon fontSize="small" color="disabled" />
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{turno.date}</Typography>
                                                <Typography variant="body2" color="text.secondary">({turno.hour})</Typography>
                                            </Stack>
                                        </TableCell>
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
                                            <IconButton
                                                color="primary" size="small"
                                                onClick={() => handleOpenEdit(turno)} sx={{ mr: 1 }}
                                            >
                                                <EditOutlinedIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                size="small"
                                                onClick={() => setTurnoToCancel(turno)}
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

            {/* Modal de Creación/Edición (sin cambios) */}
            <TurnoFormDialog
                open={openDialog}
                onClose={handleCloseDialog}
                turnoInicial={turnoToEdit}
                onSuccess={handleSuccess}
            />

            {/* Diálogo de Confirmación de Eliminación (sin cambios) */}
            <Dialog
                open={!!turnoToCancel}
                onClose={() => setTurnoToCancel(null)}
                maxWidth="xs"
            >
                {/* ... (Contenido del diálogo sin cambios) ... */}
                <DialogTitle sx={{ color: 'error.main' }}>Confirmar Cancelación de Turno</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        ¿Estás seguro de que deseas **cancelar** el turno del día **{turnoToCancel?.date}** a las **{turnoToCancel?.hour}**?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTurnoToCancel(null)} startIcon={<CancelIcon />}>
                        No, mantener
                    </Button>
                    <Button onClick={handleConfirmCancel} color="error" variant="contained" startIcon={<DeleteOutlineOutlinedIcon />} autoFocus>
                        Sí, Cancelar Turno
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}