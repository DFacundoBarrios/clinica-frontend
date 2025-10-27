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
    CircularProgress // Añadido para mostrar carga en la tabla
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiService } from 'src/services/api';
import type { CreatePatient, Patient, UpdatePatient } from 'src/types';


// =================================================================
// 💡 DEFINICIONES NECESARIAS
// =================================================================

// 1. Estado inicial del formulario (usa los nombres del backend: inglés)
const estadoInicialForm: CreatePatient = { 
    name: '', 
    lastname: '', 
    dni: '', 
    phone: '', 
    address: '' 
};

// 2. Adaptador de Servicio para operaciones de eliminación (usa apiService)
const PacientesService = {
    eliminarPaciente: async (id: number): Promise<void> => {
        await apiService.deletePatient(id);
    }
};

// =================================================================
// 💡 COMPONENTE MODAL (CREACIÓN/EDICIÓN) - PacienteFormDialog
// =================================================================

interface PacienteFormDialogProps {
    open: boolean;
    onClose: () => void;
    pacienteInicial?: Patient | null; // Usado para Edición
    onSuccess: (message: string) => void;
}

const PacienteFormDialog: React.FC<PacienteFormDialogProps> = ({ open, onClose, pacienteInicial, onSuccess }) => {
    
    const initialFormState = useMemo(() => {
        if (pacienteInicial) {
            // 💡 EXTRAER PROPIEDADES EN INGLÉS DE LA INTERFAZ PATIENT
            const { name, lastname, dni, phone, address } = pacienteInicial;
            return { name, lastname, dni, phone, address } as CreatePatient; 
        }
        // 💡 Usar el objeto de estado inicial vacío
        return estadoInicialForm; 
    }, [pacienteInicial]);
    
    // 💡 Usa CreatePatient como tipo de estado
    const [form, setForm] = useState<CreatePatient>(initialFormState); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sincronizar estado interno
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
        if (error) setError(null); // Limpiar error al escribir
    }

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isEditing) {
                // 💡 Llama a apiService.updatePatient con id_patient y el DTO
                const id = pacienteInicial!.id_patient; 
                // Se asume que CreatePatient y UpdatePatient tienen la misma estructura
                await apiService.updatePatient(id, form as UpdatePatient);
                onSuccess(`Paciente ${form.name} actualizado con éxito.`);
            } else {
                // 💡 Llama a apiService.createPatient con el DTO
                await apiService.createPatient(form);
                onSuccess(`Paciente ${form.name} creado con éxito.`);
            }
            onClose(); 
        } catch (e) {
            console.error(e);
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
                        {/* 💡 CAMPOS CON NOMBRE DE PROPIEDAD DEL BACKEND (name, lastname, phone, address) */}
                        <TextField fullWidth required label="Nombre" name="name" value={form.name} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="Apellido" name="lastname" value={form.lastname} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="DNI" name="dni" value={form.dni} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="Teléfono" name="phone" value={form.phone} onChange={handleOnChange} variant="outlined" type="tel" />
                        <TextField fullWidth required label="Dirección" name="address" value={form.address} onChange={handleOnChange} variant="outlined" multiline rows={2} />
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

// =================================================================
// 💡 COMPONENTE PRINCIPAL - PacientesPage
// =================================================================

export default function PacientesPage() {
    const [pacientes, setPacientes] = useState<Patient[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [pacienteToEdit, setPacienteToEdit] = useState<Patient | null>(null);
    const [pacienteToDelete, setPacienteToDelete] = useState<Patient | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    const fetchPacientes = useCallback(async () => {
        setIsLoadingList(true);
        try {
            // 💡 CONEXIÓN REAL: Llama a la API y obtiene los datos
            const response = await apiService.getPatients();
            setPacientes(response.data); 
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            setAlertMessage({ tipo: 'error', texto: 'Error al cargar la lista de pacientes.' });
        } finally {
            setIsLoadingList(false);
        }
    }, []);

    useEffect(() => {
        // 💡 ELIMINAR MOCKING: Se elimina la lógica de localStorage
        fetchPacientes();
    }, [fetchPacientes]);

    // Manejadores de Modal
    const handleOpenCreate = () => {
        setPacienteToEdit(null);
        setOpenDialog(true);
    };

    const handleOpenEdit = (paciente: Patient) => {
        setPacienteToEdit(paciente);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setPacienteToEdit(null);
    };

    // Manejo de éxito: refresca la lista y muestra el mensaje
    const handleSuccess = (message: string) => {
        setAlertMessage({ tipo: 'success', texto: message });
        fetchPacientes(); // Refrescar la lista
    };

    // Manejadores de Eliminación (Usando Dialog de MUI para confirmación)
    const handleConfirmDelete = async () => {
        if (!pacienteToDelete) return;

        try {
            // 💡 CONEXIÓN REAL: Llama al servicio de eliminación con id_patient
            await PacientesService.eliminarPaciente(pacienteToDelete.id_patient); 
            // 💡 Usa las propiedades en inglés para el mensaje
            handleSuccess(`Paciente ${pacienteToDelete.name} ${pacienteToDelete.lastname} eliminado con éxito.`); 
        } catch (error) {
            console.error("Error al eliminar paciente:", error);
            setAlertMessage({ tipo: 'error', texto: `No se pudo eliminar al paciente ${pacienteToDelete.name}.` });
        } finally {
            setPacienteToDelete(null); 
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
                    mb: 3, pb: 1,
                    borderBottom: '1px solid #e0e0e0' 
                }}
            >
                <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                    AGENDA DE PACIENTES 🧑‍⚕️
                </Typography>
                
                <Button 
                    variant="contained" color="primary" size="large"
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
                            {isLoadingList ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress size={24} sx={{ mr: 2 }} />
                                        Cargando pacientes...
                                    </TableCell>
                                </TableRow>
                            ) : pacientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay pacientes registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pacientes.map((paciente) => (
                                    <TableRow key={paciente.id_patient} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        {/* 💡 CELDAS CON PROPIEDADES EN INGLÉS */}
                                        <TableCell component="th" scope="row">{paciente.id_patient}</TableCell>
                                        <TableCell>{paciente.name}</TableCell>
                                        <TableCell>{paciente.lastname}</TableCell>
                                        <TableCell>{paciente.dni}</TableCell>
                                        <TableCell>{paciente.phone}</TableCell>
                                        <TableCell>{paciente.address}</TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" size="small" aria-label="editar" onClick={() => handleOpenEdit(paciente)} sx={{ mr: 1 }}>
                                                <EditOutlinedIcon />
                                            </IconButton>
                                            <IconButton color="error" size="small" aria-label="eliminar" onClick={() => setPacienteToDelete(paciente)} >
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
                        *{pacienteToDelete?.name} {pacienteToDelete?.lastname}?* {/* 💡 Usa name/lastname */}
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