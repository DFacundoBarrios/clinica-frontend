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
    CircularProgress 
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; 

export interface Turno {
    id_turno: number;
    id_paciente: number;
    id_medico: number;
    numero_consultorio: string;
    fecha: string; 
    hora: string;  
    observaciones: string;
    estado: string; 
}

export interface TurnoCrearDto {
    id_paciente: number;
    id_medico: number;
    numero_consultorio: string;
    fecha: string;
    hora: string;
    observaciones: string;
    estado: string;
}

// --- SIMULACIÓN DEL SERVICIO (REEMPLAZAR) ---
const TurnosService = {
    obtenerTurnos: async (): Promise<Turno[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return JSON.parse(localStorage.getItem('turnosMock') || JSON.stringify([
            { id_turno: 1, id_paciente: 1, id_medico: 101, numero_consultorio: "A05", fecha: "2025-10-28", hora: "10:00", observaciones: "Control anual", estado: "Confirmado" },
            { id_turno: 2, id_paciente: 2, id_medico: 103, numero_consultorio: "B12", fecha: "2025-10-28", hora: "11:30", observaciones: "Dolor de cabeza", estado: "Pendiente" },
        ]));
    },
    crearTurno: async (dto: TurnoCrearDto): Promise<Turno> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const turnos: Turno[] = JSON.parse(localStorage.getItem('turnosMock') || '[]');
        const newId = Math.max(0, ...turnos.map(t => t.id_turno)) + 1;
        const newTurno: Turno = { id_turno: newId, ...dto };
        localStorage.setItem('turnosMock', JSON.stringify([...turnos, newTurno]));
        return newTurno;
    },
    editarTurno: async (id: number, dto: TurnoCrearDto): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let turnos: Turno[] = JSON.parse(localStorage.getItem('turnosMock') || '[]');
        turnos = turnos.map(t => t.id_turno === id ? { ...t, ...dto } : t);
        localStorage.setItem('turnosMock', JSON.stringify(turnos));
    },
    eliminarTurno: async (id: number): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let turnos: Turno[] = JSON.parse(localStorage.getItem('turnosMock') || '[]');
        turnos = turnos.filter(t => t.id_turno !== id);
        localStorage.setItem('turnosMock', JSON.stringify(turnos));
    }
};
// --- FIN SIMULACIÓN ---


const estadoInicialForm: TurnoCrearDto = {
    id_paciente: 0,
    id_medico: 0,
    numero_consultorio: "",
    fecha: "",
    hora: "",
    observaciones: "",
    estado: "Pendiente",
};


interface TurnoFormDialogProps {
    open: boolean;
    onClose: () => void;
    turnoInicial?: Turno | null; 
    onSuccess: (message: string) => void;
}

const TurnoFormDialog: React.FC<TurnoFormDialogProps> = ({ open, onClose, turnoInicial, onSuccess }) => {
    
    const initialFormState = useMemo(() => {
        if (turnoInicial) {
            return {
                id_paciente: turnoInicial.id_paciente,
                id_medico: turnoInicial.id_medico,
                numero_consultorio: turnoInicial.numero_consultorio,
                fecha: turnoInicial.fecha,
                hora: turnoInicial.hora,
                observaciones: turnoInicial.observaciones,
                estado: turnoInicial.estado,
            } as TurnoCrearDto; 

        }
    
        return estadoInicialForm;
    }, [turnoInicial]); 
    
    
    const [form, setForm] = useState<TurnoCrearDto>(initialFormState);
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
        const finalValue = name.startsWith('id_') ? parseInt(value, 10) || 0 : value;
        
        setForm(prevFormData => ({
            ...prevFormData,
            [name]: finalValue
        }));
    }

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isEditing) {
                const id = turnoInicial!.id_turno;
                await TurnosService.editarTurno(id, form);
                onSuccess(`Turno ${id} actualizado con éxito.`);
            } else {
                await TurnosService.crearTurno(form);
                onSuccess(`Turno creado con éxito.`);
            }
            onClose(); 
        } catch (e) {
            console.error(e);
            setError("Error al guardar el turno. Inténtalo de nuevo.");
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
                    
                    {/* 🚨 REEMPLAZO DE GRID POR STACK 🚨 */}
                    <Stack spacing={2}>
                        
                        {/* IDs y Consultorio */}
                        <TextField fullWidth required label="ID Paciente" name="id_paciente" type="number" value={form.id_paciente} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="ID Médico" name="id_medico" type="number" value={form.id_medico} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="Consultorio Nro." name="numero_consultorio" value={form.numero_consultorio} onChange={handleOnChange} variant="outlined" />

                        {/* Fecha y Hora (Apilados verticalmente) */}
                        <TextField fullWidth required label="Fecha" name="fecha" type="date" value={form.fecha} onChange={handleOnChange} variant="outlined" InputLabelProps={{ shrink: true }} />
                        <TextField fullWidth required label="Hora" name="hora" type="time" value={form.hora} onChange={handleOnChange} variant="outlined" InputLabelProps={{ shrink: true }} />

                        {/* Estado y Observaciones */}
                        <TextField fullWidth required label="Estado" name="estado" value={form.estado} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth label="Observaciones" name="observaciones" value={form.observaciones} onChange={handleOnChange} variant="outlined" multiline rows={3} />
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

// --- Componente Principal TurnosPage ---

export default function TurnosPage() {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [turnoToEdit, setTurnoToEdit] = useState<Turno | null>(null);
    const [turnoToDelete, setTurnoToDelete] = useState<Turno | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    const fetchTurnos = useCallback(async () => {
        setIsLoadingList(true);
        try {
            const resultado = await TurnosService.obtenerTurnos();
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

    // Manejadores de Modal
    const handleOpenCreate = () => {
        setTurnoToEdit(null); 
        setOpenDialog(true);
    };

    const handleOpenEdit = (turno: Turno) => {
        setTurnoToEdit(turno);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setTurnoToEdit(null); 
    };

    // Manejo de éxito: refresca la lista y muestra el mensaje
    const handleSuccess = (message: string) => {
        setAlertMessage({ tipo: 'success', texto: message });
        fetchTurnos(); 
    };

    // Manejadores de Eliminación (Usando Dialog de MUI para confirmación)
    const handleConfirmDelete = async () => {
        if (!turnoToDelete) return;

        try {
            await TurnosService.eliminarTurno(turnoToDelete.id_turno);
            handleSuccess(`Turno para el ${turnoToDelete.fecha} a las ${turnoToDelete.hora} eliminado con éxito.`);
        } catch (error) {
            console.error("Error al eliminar turno:", error);
            setAlertMessage({ tipo: 'error', texto: `No se pudo eliminar el turno.` });
        } finally {
            setTurnoToDelete(null); 
        }
    };

    // Función para cerrar el mensaje de alerta después de un tiempo
    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(null);
            }, 6000); 
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    // Función de ayuda para obtener el color del estado (Badge)
    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'confirmado':
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
                    mb: 3,
                    pb: 1,
                    borderBottom: '1px solid #e0e0e0' 
                }}
            >
                <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                    Agenda de Turnos 🗓️
                </Typography>
                
                {/* Botón de Acción Principal (CREAR) */}
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate} 
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Consultorio</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Observaciones</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {turnos.map((turno) => (
                                <TableRow 
                                    key={turno.id_turno} 
                                    hover 
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {/* Visualización de Fecha y Hora */}
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <AccessTimeIcon fontSize="small" color="disabled" />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{turno.fecha}</Typography>
                                            <Typography variant="body2" color="text.secondary">({turno.hora})</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{turno.id_paciente}</TableCell>
                                    <TableCell>{turno.id_medico}</TableCell>
                                    <TableCell>{turno.numero_consultorio}</TableCell>
                                    <TableCell>{turno.observaciones.substring(0, 30)}...</TableCell>
                                    
                                    {/* Celda de Estado (Badge moderno) */}
                                    <TableCell>
                                        <Box 
                                            sx={{ 
                                                bgcolor: getEstadoColor(turno.estado), 
                                                color: 'white', 
                                                px: 1, py: 0.5, 
                                                borderRadius: 1, 
                                                display: 'inline-block', 
                                                fontSize: '0.8rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            {turno.estado}
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell align="center">
                                        {/* Botón Editar */}
                                        <IconButton 
                                            color="primary" 
                                            size="small"
                                            onClick={() => handleOpenEdit(turno)}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditOutlinedIcon />
                                        </IconButton>
                                        {/* Botón Eliminar */}
                                        <IconButton 
                                            color="error" 
                                            size="small"
                                            onClick={() => setTurnoToDelete(turno)} 
                                        >
                                            <DeleteOutlineOutlinedIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {/* Mensaje de no datos */}
                {!isLoadingList && turnos.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">No hay turnos agendados.</Typography>
                    </Box>
                )}
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
                open={!!turnoToDelete} 
                onClose={() => setTurnoToDelete(null)} 
                maxWidth="xs"
            >
                <DialogTitle sx={{ color: 'error.main' }}>Confirmar Cancelación de Turno</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar el turno del día **{turnoToDelete?.fecha}** a las **{turnoToDelete?.hora}**?
                        Esta acción es irreversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTurnoToDelete(null)} startIcon={<CancelIcon />}>
                        Mantener
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" startIcon={<DeleteOutlineOutlinedIcon />} autoFocus>
                        Eliminar Turno
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}