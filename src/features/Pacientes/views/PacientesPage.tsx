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
    Alert,
    CircularProgress
} from '@mui/material';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';

//para conectar con backend
import { useApi } from 'src/hooks/useApi';
import { apiService } from 'src/services/api';
import { PacienteFormDialog } from './PacienteFormDialog';
import type {  Patient } from 'src/types';


export default function PacientesPage() {

    const {
        data: pacientes,
        loading: isLoadingList,
        error: errorList,
        execute: fetchPacientes,
        setData: setPacientes    
    } = useApi<Patient[]>(apiService.getPatients);

    // Estados que el componente sigue manejando
    const [openDialog, setOpenDialog] = useState(false);
    const [pacienteToEdit, setPacienteToEdit] = useState<Patient | null>(null);
    const [pacienteToDelete, setPacienteToDelete] = useState<Patient | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

    useEffect(() => {
        if (errorList) {
            setAlertMessage({ tipo: 'error', texto: errorList });
        }
    }, [errorList]);


    // Manejadores de Modal (sin cambios)
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

    // 💡 4. 'handleSuccess' ahora llama a 'fetchPacientes' (que es el 'execute' del hook)
    const handleSuccess = (message: string) => {
        setAlertMessage({ tipo: 'success', texto: message });
        fetchPacientes(); // 💡 Refresca la lista volviendo a ejecutar la API call
    };

    // Manejadores de Eliminación
    const handleConfirmDelete = async () => {
        if (!pacienteToDelete) return;

        try {
            // 💡 5. Usamos 'apiService' directamente (basado en el plan de refactor)
            await apiService.deletePatient(pacienteToDelete.id_patient);
            handleSuccess(`Paciente ${pacienteToDelete.name} ${pacienteToDelete.lastname} eliminado con éxito.`);

        } catch (error) {
            console.error("Error al eliminar paciente:", error);
            setAlertMessage({ tipo: 'error', texto: `No se pudo eliminar al paciente ${pacienteToDelete.name}.` });
        } finally {
            setPacienteToDelete(null);
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

    return (
        <Box sx={{ p: 3 }}>

            {/* Título y Botón (sin cambios) */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    // ...
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

            {/* Mensaje de Alerta (sin cambios) */}
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
                            {/* ... (Cabecera de la tabla sin cambios) ... */}
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
                            {/* 💡 6. Lógica de renderizado actualizada */}
                            {isLoadingList ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <CircularProgress size={24} sx={{ mr: 2 }} />
                                        Cargando pacientes...
                                    </TableCell>
                                </TableRow>
                            ) : !pacientes || pacientes.length === 0 ? ( // 💡 Comprueba 'null' o 'length 0'
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay pacientes registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // 💡 Usamos (pacientes ?? []) por si acaso, aunque 'data' debería ser array
                                (pacientes ?? []).map((paciente) => (
                                    <TableRow key={paciente.id_patient} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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

            {/* Modal de Creación/Edición (sin cambios) */}
            <PacienteFormDialog
                open={openDialog}
                onClose={handleCloseDialog}
                pacienteInicial={pacienteToEdit}
                onSuccess={handleSuccess}
            />

            {/* Diálogo de Confirmación de Eliminación (sin cambios) */}
            <Dialog
                open={!!pacienteToDelete}
                onClose={() => setPacienteToDelete(null)}
                maxWidth="xs"
            >
                {/* ... (Contenido del diálogo sin cambios) ... */}
                <DialogTitle sx={{ color: 'error.main' }}>Confirmar Eliminación</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar al paciente
                        *{pacienteToDelete?.name} {pacienteToDelete?.lastname}?*
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