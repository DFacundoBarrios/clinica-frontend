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
import type { PacienteCrearDto } from "./../types/PacienteTypes";
import { PacientesService } from "./../services/PacientesService";

const estadoInicial: PacienteCrearDto = {
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    direccion: "",
};

export default function PacientesCrearPage() {
    const [form, setForm] = useState<PacienteCrearDto>(estadoInicial);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); 
    const navigate = useNavigate();

    // Función de envío del formulario
    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await PacientesService.crearPaciente(form);
            alert("Paciente creado con éxito"); 
            navigate('/pacientes', { state: { successMessage: "Paciente creado con éxito." } });
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
    }

    return (
        // Contenedor principal centrado
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            {/* Contenedor de Formulario (Efecto de Tarjeta con Sombra) */}
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
                
                {/* Título de la Sección */}
                <Typography 
                    variant="h4" 
                    component="h1" 
                    gutterBottom 
                    color="primary" 
                    sx={{ fontWeight: 'bold', mb: 3 }}
                >
                    Registro de Nuevo Paciente 📝
                </Typography>
                
                {/* Mensaje de Error (si existe) */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Formulario */}
                <form autoComplete="off" noValidate onSubmit={handleOnSubmit}>
                    
                    {/* Campos del Formulario - Usando STACK para disposición vertical */}
                    <Stack spacing={2}> 
                        
                        {/* Nombre */}
                        <TextField
                            fullWidth
                            required
                            variant="outlined" 
                            value={form.nombre}
                            name="nombre"
                            onChange={handleOnChange}
                            label="Nombre"
                        />
                        
                        {/* Apellido */}
                        <TextField
                            fullWidth
                            required
                            variant="outlined"
                            value={form.apellido}
                            name="apellido"
                            onChange={handleOnChange}
                            label="Apellido"
                        />

                        {/* DNI */}
                        <TextField
                            fullWidth
                            required
                            variant="outlined"
                            value={form.dni}
                            name="dni"
                            onChange={handleOnChange}
                            label="DNI"
                            type="text" 
                        />
                        
                        {/* Teléfono */}
                        <TextField
                            fullWidth
                            required
                            variant="outlined"
                            value={form.telefono}
                            name="telefono"
                            onChange={handleOnChange}
                            label="Teléfono"
                            type="tel"
                        />
                        
                        {/* Dirección */}
                        <TextField
                            fullWidth
                            required
                            multiline
                            rows={2}
                            variant="outlined"
                            value={form.direccion}
                            name="direccion"
                            onChange={handleOnChange}
                            label="Dirección"
                        />
                        
                        {/* Botones de Acción */}
                        <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                            
                            {/* Botón de Guardar */}
                            <Button 
                                variant="contained" 
                                color="primary"
                                type="submit"
                                startIcon={<SaveIcon />}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </Button>
                            
                            {/* Botón de Cancelar */}
                            <Button 
                                variant="outlined" 
                                color="secondary"
                                onClick={() => navigate('/pacientes')} 
                                startIcon={<CancelIcon />}
                                disabled={isLoading}
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