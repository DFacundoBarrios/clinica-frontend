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
    Typography
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { apiService } from 'src/services/api'; 
import type { CreatePatient, Patient, UpdatePatient } from 'src/types'; 

//datos para el formulario
const estadoInicialForm: CreatePatient = { 
    name: '', 
    lastname: '', 
    dni: '', 
    phone: '', 
    address: '' 
};

// 2. Props que el componente recibirá
export interface PacienteFormDialogProps {
    open: boolean;
    onClose: () => void;
    pacienteInicial?: Patient | null; 
    onSuccess: (message: string) => void;
}



export const PacienteFormDialog: React.FC<PacienteFormDialogProps> = ({ open, onClose, pacienteInicial, onSuccess }) => {
    

    const initialFormState = useMemo(() => {
        if (pacienteInicial) {
            const { name, lastname, dni, phone, address } = pacienteInicial;
            return { name, lastname, dni, phone, address } as CreatePatient; 
        }
        // Usa el objeto de estado inicial vacío para crear uno nuevo
        return estadoInicialForm; 
    }, [pacienteInicial]);
    
    // Estados internos del formulario
    const [form, setForm] = useState<CreatePatient>(initialFormState); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Efecto para resetear el formulario cuando cambian las props 
    useEffect(() => {
        setForm(initialFormState);
        setError(null);
    }, [initialFormState, open]); 

    const isEditing = !!pacienteInicial;
    const dialogTitle = isEditing ? "EDITAR PACIENTE EXISTENTE" : "AGENDAR NUEVO PACIENTE";
    
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
                // Llama a apiService.updatePatient con id_patient y el DTO
                const id = pacienteInicial!.id_patient; 
                await apiService.updatePatient(id, form as UpdatePatient);
                onSuccess(`Paciente ${form.name} actualizado con éxito.`);
            } else {
                // Llama a apiService.createPatient con el DTO
                await apiService.createPatient(form);
                onSuccess(`Paciente ${form.name} creado con éxito.`);
            }
            onClose(); // Cierra el modal solo si la operación fue exitosa
        } catch (e) {
            console.error(e);
            // Intenta obtener un mensaje de error más específico si la API lo envía
            const errorMsg = (e as any).response?.data?.message || "Error al guardar el paciente. Inténtalo de nuevo.";
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog 
            open={open} 
            onClose={onClose} // Permite cerrar el modal haciendo clic fuera
            fullWidth 
            maxWidth="sm"
        >
            <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">{dialogTitle}</Typography>
            </DialogTitle>
            
            {/* El <form> es necesario para el handleOnSubmit */}
            <form onSubmit={handleOnSubmit}>
                
                <DialogContent dividers sx={{ pt: 2 }}> {/* Añade padding top */}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <Stack spacing={2}>
                        <TextField fullWidth required label="Nombre" name="name" value={form.name} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="Apellido" name="lastname" value={form.lastname} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="DNI" name="dni" value={form.dni} onChange={handleOnChange} variant="outlined" />
                        <TextField fullWidth required label="Teléfono" name="phone" value={form.phone} onChange={handleOnChange} variant="outlined" type="tel" />
                        <TextField fullWidth required label="Dirección" name="address" value={form.address} onChange={handleOnChange} variant="outlined" multiline rows={2} />
                    </Stack>
                </DialogContent>
                
                <DialogActions sx={{ p: 2 }}> {/* Añade padding */}
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