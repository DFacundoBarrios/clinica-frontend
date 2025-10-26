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
import BadgeIcon from '@mui/icons-material/Badge'; 
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
            
            {/* Título */}
            <Box sx={{ width: '100%', maxWidth: 700 }}>
                <Typography 
                    variant="h4" 
                    component="h1" 
                    color="text.primary" 
                    sx={{ fontWeight: 'bold', mb: 4, pb: 1, borderBottom: '2px solid #007bff' }}
                >
                    Nuestros Profesionales 🩺
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
                    {/* 💡 CORRECCIÓN APLICADA: Usamos la función auxiliar */}
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
                            // Asegúrate de usar una propiedad única que exista en Doctor (ej: id_medico, id_doctor, enrollment)
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
                                        <BadgeIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
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
                                                {doctor.start_time}
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