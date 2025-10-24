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
    Alert
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export interface Paciente {
    id_paciente: number; 
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    direccion: string;
}

export interface PacienteCrearDto {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    direccion: string;
}


const PacientesService = {
    obtenerPacientes: async (): Promise<Paciente[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return JSON.parse(localStorage.getItem('pacientesMock') || '[]');
    },
    crearPaciente: async (dto: PacienteCrearDto): Promise<Paciente> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const pacientes: Paciente[] = JSON.parse(localStorage.getItem('pacientesMock') || '[]');
        const newId = Math.max(0, ...pacientes.map(p => p.id_paciente)) + 1;
        const newPaciente: Paciente = { id_paciente: newId, ...dto };
        localStorage.setItem('pacientesMock', JSON.stringify([...pacientes, newPaciente]));
        return newPaciente;
    },
    editarPaciente: async (id: number, dto: PacienteCrearDto): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let pacientes: Paciente[] = JSON.parse(localStorage.getItem('pacientesMock') || '[]');
        pacientes = pacientes.map(p => p.id_paciente === id ? { ...p, ...dto } : p);
        localStorage.setItem('pacientesMock', JSON.stringify(pacientes));
    },
    eliminarPaciente: async (id: number): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let pacientes: Paciente[] = JSON.parse(localStorage.getItem('pacientesMock') || '[]');
        pacientes = pacientes.filter(p => p.id_paciente !== id);
        localStorage.setItem('pacientesMock', JSON.stringify(pacientes));
    }
};
// --- FIN SIMULACIÓN ---


const estadoInicialForm: PacienteCrearDto = {
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    direccion: "",
};

// --- Componente de Diálogo para el Formulario (Anidado) ---

interface PacienteFormDialogProps {
    open: boolean;
    onClose: () => void;
    pacienteInicial?: Paciente | null; // Usado para Edición
    onSuccess: (message: string) => void;
}

const PacienteFormDialog: React.FC<PacienteFormDialogProps> = ({ open, onClose, pacienteInicial, onSuccess }) => {
    
    const initialFormState = useMemo(() => {
        // 1. Verificación explícita de nulidad para TypeScript
        if (pacienteInicial) {
            // 2. Extraer los campos necesarios para el DTO (sin id_paciente)
            const { 
                nombre, 
                apellido, 
                dni, 
                telefono, 
                direccion 
            } = pacienteInicial;
            
            // Retornamos un objeto que coincide exactamente con PacienteCrearDto
            return {
                nombre,
                apellido,
                dni,
                telefono,
                direccion
            } as PacienteCrearDto;

        }
        // Si no hay paciente inicial (modo Creación), retorna el estado inicial vacío
        return estadoInicialForm;
    }, [pacienteInicial]); // Se recalcula si pacienteInicial cambia
    
    // ... (el resto del código del componente PacienteFormDialog sigue igual) ...
    // ...
    // ...
    
    const [form, setForm] = useState<PacienteCrearDto>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sincronizar el estado interno del formulario cuando cambia pacienteInicial (al abrir/cerrar)
    useEffect(() => {
        setForm(initialFormState);
        setError(null);
    }, [initialFormState]);

    const isEditing = !!pacienteInicial;
    const dialogTitle = isEditing ? "Editar Paciente" : "Registrar Nuevo Paciente";
    
    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setForm(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    }

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isEditing) {
                // Lógica de edición: se necesita el id_paciente para el servicio
                const id = pacienteInicial!.id_paciente;
                await PacientesService.editarPaciente(id, form);
                onSuccess(`Paciente ${form.nombre} actualizado con éxito.`);
            } else {
                // Lógica de creación
                await PacientesService.crearPaciente(form);
                onSuccess(`Paciente ${form.nombre} creado con éxito.`);
            }
            onClose(); // Cierra el modal al tener éxito
            // No reseteamos el form aquí, sino que la dependencia `initialFormState` lo hará en el próximo render.
        } catch (e) {
            console.error(e);
            // Manejo de errores más específico, si es posible
            setError("Error al guardar el paciente. Inténtalo de nuevo.");
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
                    <Stack spacing={2}>
                        <TextField
                            fullWidth required label="Nombre" name="nombre" value={form.nombre}
                            onChange={handleOnChange} variant="outlined" 
                        />
                        <TextField
                            fullWidth required label="Apellido" name="apellido" value={form.apellido}
                            onChange={handleOnChange} variant="outlined"
                        />
                        <TextField
                            fullWidth required label="DNI" name="dni" value={form.dni}
                            onChange={handleOnChange} variant="outlined"
                        />
                        <TextField
                            fullWidth required label="Teléfono" name="telefono" value={form.telefono}
                            onChange={handleOnChange} variant="outlined" type="tel"
                        />
                        <TextField
                            fullWidth required label="Dirección" name="direccion" value={form.direccion}
                            onChange={handleOnChange} variant="outlined" multiline rows={2}
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

// --- Componente Principal PacientesPage ---

export default function PacientesPage() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [pacienteToEdit, setPacienteToEdit] = useState<Paciente | null>(null);
    const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    const fetchPacientes = useCallback(async () => {
        setIsLoadingList(true);
        try {
            const resultado = await PacientesService.obtenerPacientes();
            setPacientes(resultado);
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            setAlertMessage({ tipo: 'error', texto: 'Error al cargar la lista de pacientes.' });
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    useEffect(() => {
        // Inicializar la simulación de datos si no existen
        if (!localStorage.getItem('pacientesMock')) {
            localStorage.setItem('pacientesMock', JSON.stringify([
                { id_paciente: 1, nombre: "Juan", apellido: "Pérez", dni: "12345678", telefono: "555-0001", direccion: "Calle Falsa 123" },
                { id_paciente: 2, nombre: "Ana", apellido: "García", dni: "87654321", telefono: "555-0002", direccion: "Av. Siempre Viva 45" },
            ]));
        }
        fetchPacientes();
    }, [fetchPacientes]);

    // Manejadores de Modal
    const handleOpenCreate = () => {
        setPacienteToEdit(null); // Modo Creación
        setOpenDialog(true);
    };

    const handleOpenEdit = (paciente: Paciente) => {
        setPacienteToEdit(paciente);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setPacienteToEdit(null); // Limpiar el paciente a editar
    };

    // Manejo de éxito: refresca la lista y muestra el mensaje
    const handleSuccess = (message: string) => {
        setAlertMessage({ tipo: 'success', texto: message });
        fetchPacientes(); // Refrescar la lista para ver el cambio
    };

    // Manejadores de Eliminación (Usando Dialog de MUI para confirmación)
    const handleConfirmDelete = async () => {
        if (!pacienteToDelete) return;

        try {
            await PacientesService.eliminarPaciente(pacienteToDelete.id_paciente);
            handleSuccess(`Paciente ${pacienteToDelete.nombre} ${pacienteToDelete.apellido} eliminado con éxito.`);
        } catch (error) {
            console.error("Error al eliminar paciente:", error);
            setAlertMessage({ tipo: 'error', texto: `No se pudo eliminar el paciente ${pacienteToDelete.nombre}.` });
        } finally {
            setPacienteToDelete(null); // Cierra el diálogo de confirmación
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
                    Gestión de Pacientes 🧑‍⚕️
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
                    Nuevo Paciente
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

            {/* Lista/Tabla de Pacientes */}
            <Paper elevation={3}> 
                <TableContainer>
                    <Table sx={{ minWidth: 700 }} aria-label="tabla de pacientes">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Apellido</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>DNI</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pacientes.length === 0 && !isLoadingList ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay pacientes registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pacientes.map((paciente) => (
                                    <TableRow 
                                        key={paciente.id_paciente} 
                                        hover 
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">{paciente.id_paciente}</TableCell>
                                        <TableCell>{paciente.nombre}</TableCell>
                                        <TableCell>{paciente.apellido}</TableCell>
                                        <TableCell>{paciente.dni}</TableCell>
                                        <TableCell>{paciente.telefono}</TableCell>
                                        <TableCell>{paciente.direccion}</TableCell>
                                        <TableCell align="center">
                                            {/* Botón Editar */}
                                            <IconButton 
                                                color="primary" 
                                                size="small"
                                                aria-label="editar"
                                                onClick={() => handleOpenEdit(paciente)}
                                                sx={{ mr: 1 }}
                                            >
                                                <EditOutlinedIcon />
                                            </IconButton>
                                            {/* Botón Eliminar */}
                                            <IconButton 
                                                color="error" 
                                                size="small"
                                                aria-label="eliminar"
                                                onClick={() => setPacienteToDelete(paciente)} 
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
                {/* Opcional: Mostrar indicador de carga */}
                {isLoadingList && <Box sx={{ p: 2, textAlign: 'center' }}>Cargando pacientes...</Box>}
            </Paper>

            {/* Modal de Creación/Edición */}
            <PacienteFormDialog 
                open={openDialog}
                onClose={handleCloseDialog}
                pacienteInicial={pacienteToEdit}
                onSuccess={handleSuccess}
            />

            {/* Diálogo de Confirmación de Eliminación */}
            <Dialog 
                open={!!pacienteToDelete} 
                onClose={() => setPacienteToDelete(null)} 
                maxWidth="xs"
            >
                <DialogTitle sx={{ color: 'error.main' }}>Confirmar Eliminación</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar al paciente 
                        **{pacienteToDelete?.nombre} {pacienteToDelete?.apellido}**?
                        Esta acción es irreversible.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPacienteToDelete(null)} startIcon={<CancelIcon />}>
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