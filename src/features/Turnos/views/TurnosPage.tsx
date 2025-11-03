import { useEffect, useState } from 'react';

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
    Chip,
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';

// backend
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

    //Estados para Modales
    const [openDialog, setOpenDialog] = useState(false); // Modal de Formulario (Crear/Editar)
    const [turnoToEdit, setTurnoToEdit] = useState<Appointment | null>(null);
    const [turnoToDelete, setTurnoToDelete] = useState<Appointment | null>(null);
    const [turnoToCancel, setTurnoToCancel] = useState<Appointment | null>(null); // Modal de Confirmar Cancelación

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [turnoToShow, setTurnoToShow] = useState<Appointment | null>(null);

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

    //Handlers para Modal de Detalles 
    const handleOpenDetailModal = (turno: Appointment) => {
        setTurnoToShow(turno); // Guarda el turno 
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setTurnoToShow(null);
    };

    const handleSuccess = (message: string) => {
        setAlertMessage({ tipo: 'success', texto: message });
        fetchTurnos();
    };

    // Manejadores de cancelacion de turno 
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

    //Manejador de eliminacion de turno
    const handleConfirmDelete = async () => {
        if (!turnoToDelete) return;

        try {
            await apiService.deleteAppointment(turnoToDelete.id_appointment);
            handleSuccess(`Turno con id: ${turnoToDelete.id_appointment} eliminado con éxito.`);

        } catch (error) {
            console.error("Error al eliminar turno:", error);
            setAlertMessage({ tipo: 'error', texto: `No se pudo eliminar al turno ${turnoToDelete.id_appointment}.` });
        } finally {
            setTurnoToDelete(null);
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

            {alertMessage && (
                <Alert
                    severity={alertMessage.tipo}
                    onClose={() => setAlertMessage(null)}
                    sx={{ mb: 2 }}
                >
                    {alertMessage.texto}
                </Alert>
            )}


            {isLoadingList && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            )}

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
                            {!isLoadingList && (!turnos || turnos.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay turnos agendados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (turnos ?? []).map((turno) => (
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
                                        <TableCell>{turno.patient?.name} {turno.patient?.lastname},  {`(${turno.patient?.id_patient ?? '-'})`}</TableCell>
                                        <TableCell>Dr {turno.doctor?.name} {turno.doctor?.lastname}, {`(${turno.doctor?.id_doctor ?? '-'})`}</TableCell>
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
                                                color="default"
                                                size="small"
                                                onClick={() => handleOpenDetailModal(turno)}
                                                sx={{ mr: 1 }}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>


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
                                                <EventBusyOutlinedIcon />
                                            </IconButton>

                                            <IconButton color="error" size="small" aria-label="eliminar" onClick={() => setTurnoToDelete(turno)} >
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

            {/* Modal */}
            <TurnoFormDialog
                open={openDialog}
                onClose={handleCloseDialog}
                turnoInicial={turnoToEdit}
                onSuccess={handleSuccess}
                turnos={turnos ?? []}
            />


            <Dialog
                open={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6">DETALLES DEL TURNO</Typography>
                </DialogTitle>

                <DialogContent dividers>
                    {turnoToShow && (
                        <Stack spacing={2.5} sx={{ pt: 1.5 }}>
                            <Typography variant="body1">
                                <strong>Paciente:</strong>
                                {` ${turnoToShow.patient?.name} ${turnoToShow.patient?.lastname} (DNI: ${turnoToShow.patient?.dni ?? '-'})`}
                            </Typography>

                            <Typography variant="body1">
                                <strong>Médico:</strong>
                                {` Dr. ${turnoToShow.doctor?.name} ${turnoToShow.doctor?.lastname}`}
                            </Typography>

                            <Typography variant="body1">
                                <strong>Consultorio:</strong>
                                {` Nro. ${turnoToShow.medical_office?.number_office ?? '-'}`}
                            </Typography>

                            <Typography variant="body1">
                                <strong>Fecha y Hora:</strong>
                                {` ${turnoToShow.date} a las ${turnoToShow.hour} hs.`}
                            </Typography>

                            <Typography variant="body1" component="div">
                                <strong>Estado:</strong>
                                <Chip
                                    label={turnoToShow.state}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        color: 'white',
                                        bgcolor: getEstadoColor(turnoToShow.state ?? ''),
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}
                                />
                            </Typography>

                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                <strong>Observaciones:</strong>
                                {`\n${turnoToShow.observations || 'N/A'}`}
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDetailModal} variant="outlined" color="secondary" startIcon={<CancelIcon />}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={!!turnoToCancel}
                onClose={() => setTurnoToCancel(null)}
                maxWidth="xs"
            >
                <DialogTitle sx={{ color: 'error.main' }}>CONFIRMAR CANCELACION DE TURNO</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        ¿Deseas cancelar el turno del día ({turnoToCancel?.date}) a las {turnoToCancel?.hour} hs?
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
            <Dialog
                open={!!turnoToDelete}
                onClose={() => setTurnoToDelete(null)}
                maxWidth="xs"
            >

                <DialogTitle sx={{ color: 'error.main' }}>CONFIRMAR ELIMINACION</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar el turno?
                        Esta acción es irreversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTurnoToDelete(null)} startIcon={<CancelIcon />}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" startIcon={<DeleteOutlineOutlinedIcon />} autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}