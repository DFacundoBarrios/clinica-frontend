import { useState } from "react"
import type { FormEvent, ChangeEvent } from "react"
import { useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Box,
    Stack,
    Typography,
    Paper,
    CircularProgress,
    Alert,


    FormControl,
    InputLabel,
    Select,
    MenuItem,
    type SelectChangeEvent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';


export interface TurnoCrearDto {
    id_paciente: number;
    id_medico: number;
    numero_consultorio: string | number;
    fecha: string;
    hora: string;
    observaciones: string;
    estado: string; 
}
// ---------------------------------------------------


const ESTADOS_TURNO = ["RESERVADO", "ATENTIDO", "CANCELADO"];


const TurnosService = {
    crearTurnos: async (dto: TurnoCrearDto) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Turno creado (Simulación):", dto);
        return { success: true };
    },
};

const estadoInicial: TurnoCrearDto = {
    id_paciente: 0,
    id_medico: 0,
    numero_consultorio: '',
    fecha: '',
    hora: '',
    observaciones: '',
    estado: ESTADOS_TURNO[0] 
}

export default function TurnosCrearPage() {
    const [form, setForm] = useState<TurnoCrearDto>(estadoInicial)
    const [cargando, setCargando] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        // Validación básica
        if (!form.id_paciente || !form.id_medico || !form.fecha || !form.hora || !form.estado) {
            setError("Por favor, complete los campos obligatorios (Paciente, Médico, Fecha, Hora y Estado).");
            return;
        }

        try {
            setCargando(true)
            await TurnosService.crearTurnos(form)

            // Redirigir y mostrar mensaje de éxito
            navigate('/turnos', { state: { successMessage: "Turno agendado con éxito." } });
        } catch (e) {
            console.error("Error al crear turno:", e);
            setError("Error de conexión o servidor al crear el turno.");
        } finally {
            setCargando(false)
        }
    }

    // Manejador para TextField (texto, números)
    function handleTextFieldChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;

        const finalValue: string | number = (
            name === "id_paciente" || name === "id_medico" || name === "numero_consultorio"
        ) ? (value === "" ? 0 : Number(value)) : value;

        setForm(prevFormData => ({
            ...prevFormData,
            [name]: finalValue
        }));
    }

    // Manejador específico para Select
    function handleSelectChange(event: SelectChangeEvent<string>) {
        const { name, value } = event.target;

        setForm(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    }

    function handleClickCancelar() {
        navigate('/turnos');
    }

    return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={6} sx={{ p: 4, width: '100%', maxWidth: 500 }}>

                <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Agendar Nuevo Turno 📅
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form autoComplete="off" noValidate onSubmit={handleOnSubmit}>
                    <Stack spacing={2.5}>

                        {/* IDs de Enlace (Paciente y Médico) */}
                        <TextField
                            fullWidth required
                            value={form.id_paciente || ''}
                            type="number"
                            name="id_paciente"
                            onChange={handleTextFieldChange} 
                            label="ID de Paciente"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth required
                            value={form.id_medico || ''}
                            type="number"
                            name="id_medico"
                            onChange={handleTextFieldChange} 
                            label="ID de Médico"
                            variant="outlined"
                        />

                        {/* Consultorio */}
                        <TextField
                            fullWidth required
                            value={form.numero_consultorio || ''}
                            name="numero_consultorio"
                            onChange={handleTextFieldChange} 
                            label="Número de Consultorio"
                            variant="outlined"
                        />

                        {/* Fecha y Hora */}
                        <TextField
                            fullWidth required
                            value={form.fecha}
                            name="fecha"
                            onChange={handleTextFieldChange}
                            label="Fecha del Turno"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth required
                            value={form.hora}
                            name="hora"
                            onChange={handleTextFieldChange}
                            label="Hora del Turno"
                            type="time"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />

                        // ESTADO - REEMPLAZADO POR SELECT
                        <FormControl fullWidth required>
                            <InputLabel id="estado-select-label">Estado</InputLabel>
                            <Select
                                labelId="estado-select-label"
                                id="estado-select"
                                value={form.estado}
                                name="estado"
                                label="Estado"
                                onChange={handleSelectChange} 
                            >
                                {/* Mapear las opciones de estado */}
                                {ESTADOS_TURNO.map((estado) => (
                                    <MenuItem key={estado} value={estado}>
                                        {estado}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Observaciones */}
                        <TextField
                            fullWidth
                            value={form.observaciones}
                            name="observaciones"
                            onChange={handleTextFieldChange}
                            label="Observaciones"
                            variant="outlined"
                            multiline
                            rows={3}
                        />

                        {/* Botones de Acción */}
                        <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                            <Button
                                variant="contained"
                                type="submit"
                                color="primary"
                                startIcon={cargando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                disabled={cargando}
                            >
                                {cargando ? 'Agendando...' : 'Guardar Turno'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleClickCancelar}
                                startIcon={<CancelIcon />}
                                disabled={cargando}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    )
}