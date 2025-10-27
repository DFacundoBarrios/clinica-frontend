import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';
import { 
    TextField, 
    Button, 
    Box, 
    Stack, 
    Typography, 
    Paper, 
    Alert 
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save'; 
import CancelIcon from '@mui/icons-material/Cancel'; 
import { apiService } from 'src/services/api';
import type { CreatePatient } from 'src/types';

// 💡 CORRECCIÓN: Usar los nombres de las propiedades esperadas por el backend (name, lastname)
const estadoInicial: CreatePatient = {
    name: "",      
    lastname: "",  
    dni: "",
    phone: "",
    address: "",
};

export default function PacientesCrearPage() {
    const [form, setForm] = useState<CreatePatient>(estadoInicial);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); 
    const navigate = useNavigate();

    // Función de envío del formulario
    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Envía el objeto 'form' con las propiedades en inglés (name, lastname)
            await apiService.createPatient(form);
            
            // Redirección con mensaje de éxito (sin alert nativo)
            navigate('/patients', { 
                state: { 
                    successMessage: `Paciente ${form.name} ${form.lastname} creado con éxito.` 
                } 
            });
            
        } catch (e) {
            console.error(e);
            setError("Error al crear el paciente. Por favor, verifica los datos e inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }

    // Manejador de cambios en los campos del formulario
    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setForm(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
        // Limpiar error al empezar a escribir
        if (error) { 
            setError(null);
        }
    }

    return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
                
                <Typography 
                    variant="h4" component="h1" gutterBottom color="primary" 
                    sx={{ fontWeight: 'bold', mb: 3 }}
                >
                    REGISTRO DE NUEVO PACIENTE 📝
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form autoComplete="off" noValidate onSubmit={handleOnSubmit}>
                    <Stack spacing={2}> 
                        
                        {/* Nombre */}
                        <TextField
                            fullWidth required variant="outlined" 
                            value={form.name}     
                            name="name"           
                            onChange={handleOnChange}
                            label="Nombre"        
                        />
                        
                        {/* Apellido */}
                        <TextField
                            fullWidth required variant="outlined"
                            value={form.lastname} 
                            name="lastname"       
                            onChange={handleOnChange}
                            label="Apellido"      
                        />

                        {/* DNI */}
                        <TextField
                            fullWidth required variant="outlined"
                            value={form.dni} name="dni"
                            onChange={handleOnChange} label="DNI"
                            type="text" 
                        />
                        
                        {/* Teléfono */}
                        <TextField
                            fullWidth required variant="outlined"
                            value={form.phone} name="phone"
                            onChange={handleOnChange} label="Teléfono"
                            type="tel"
                        />
                        
                        {/* Dirección */}
                        <TextField
                            fullWidth required multiline rows={2}
                            variant="outlined"
                            value={form.address} name="address"
                            onChange={handleOnChange} label="Dirección"
                        />
                        
                        {/* Botones de Acción */}
                        <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                            
                            <Button 
                                variant="contained" color="primary" type="submit"
                                startIcon={<SaveIcon />} disabled={isLoading}
                            >
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                            
                            <Button 
                                variant="outlined" color="secondary"
                                onClick={() => navigate('/patients')} 
                                startIcon={<CancelIcon />} disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}