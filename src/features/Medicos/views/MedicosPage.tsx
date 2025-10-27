import {
    Box,
    Typography,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Divider,
    Stack
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import { useApi } from 'src/hooks/useApi';
import { apiService } from 'src/services/api';
import type { Doctor } from 'src/types';

// Función auxiliar para obtener el mensaje de error de forma segura
const getErrorMessage = (err: unknown): string => {
    if (!err) return 'Error desconocido.';

    // Si el error es una cadena, la devolvemos.
    if (typeof err === 'string') {
        return err;
    }

    // Si es un objeto, intentamos acceder a 'message' o proporcionamos un mensaje predeterminado.
    if (err && typeof err === 'object' && 'message' in err) {
        return err.message as string;
    }

    return 'Error al cargar los médicos.';
};


export default function MedicosPage() {
    const { data: doctors, loading: isLoading, error } = useApi<Doctor[]>(
        apiService.getDoctors
    );

    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 1,
                    borderBottom: '1px solid #e0e0e0' 
                }}>
                <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                                    NUESTROS PROFESIONALES 🩺
                                </Typography>
            </Box>

            {/* Estado de carga */}
            {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, alignItems: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ ml: 2 }}>Cargando directorio...</Typography>
                </Box>
            )}

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 700 }}>
                    {getErrorMessage(error)}
                </Alert>
            )}

            {/* Lista de médicos */}
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 700 }}>
                {!isLoading && !error && (!doctors || doctors.length === 0) ? (
                    <Alert severity="info">
                        No se encontraron médicos registrados en el sistema.
                    </Alert>
                ) : (
                    doctors?.map((doctor) => (
                        <Card
                            key={doctor.id_doctor || doctor.enrollment}
                            elevation={4}
                            sx={{
                                borderLeft: `5px solid #007bff`,
                                transition: '0.3s',
                                '&:hover': {
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                }
                            }}
                        >
                            <CardContent>
                                {/* Nombre y Apellido: Asumo que tu tipo Doctor usa 'name' y 'lastname' */}
                                <Typography
                                    variant="h5"
                                    component="div"
                                    sx={{ fontWeight: 600, color: 'primary.dark' }}
                                >
                                    {doctor.name} {doctor.lastname}
                                </Typography>

                                <Divider sx={{ my: 1.5 }} />

                                {/* Detalles */}
                                <Stack spacing={1} sx={{ mt: 1 }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>  
                                        <PermContactCalendarIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />

                                        <Typography variant="body1" fontWeight="bold">
                                            Matrícula:
                                        </Typography>

                                        <Typography variant="body1" sx={{ ml: 0.5 }}>
                                            {doctor.enrollment}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <AccessTimeIcon color="success" sx={{ mr: 1, fontSize: 18, mt: 0.3 }} />
                                        <Stack>
                                            <Typography variant="body1" fontWeight="bold">
                                                Horario de Atención:
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {/* 💡 CORRECCIÓN APLICADA: Usamos .slice(0, 5) para obtener solo HH:MM */}
                                                {doctor.start_time.slice(0, 5)} - {doctor.end_time.slice(0, 5)}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))
                )}
            </Stack>
        </Box>
    );
}