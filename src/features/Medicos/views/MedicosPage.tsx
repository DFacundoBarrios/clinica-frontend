import React, { useEffect, useState, useCallback } from 'react';
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

// --- 1. INTERFAZ MÉDICO ---
export interface Medico {
    id_medico: number;
    nombre: string;
    apellido: string;
    matricula: string;
    horario_atencion: string; 
}

// --- 2. SERVICIO DE EJEMPLO ---
const MedicosService = {
    obtenerMedicos: async (): Promise<Medico[]> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return [
            { id_medico: 101, nombre: "Dr. Esteban", apellido: "Kahn", matricula: "A1234", horario_atencion: "Lunes a Viernes, 8:00 - 16:00" },
            { id_medico: 102, nombre: "Dra. Sofía", apellido: "Rojas", matricula: "B5678", horario_atencion: "Martes y Jueves, 10:00 - 18:00" },
            { id_medico: 103, nombre: "Dr. Miguel", apellido: "Torres", matricula: "C9012", horario_atencion: "Lunes, Miércoles, Viernes, 14:00 - 20:00" },
            { id_medico: 104, nombre: "Dra. Elena", apellido: "Vega", matricula: "D3456", horario_atencion: "Sábados, 9:00 - 13:00" },
        ];
    },
};


export default function MedicosPage() {
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMedicos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const resultado = await MedicosService.obtenerMedicos();
            setMedicos(resultado);
        } catch (e) {
            console.error("Error al cargar médicos:", e);
            setError("No se pudo cargar la información de los médicos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedicos();
    }, [fetchMedicos]);

 
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
                    {error}
                </Alert>
            )}

            {/* Lista de médicos */}
            <Stack spacing={3} sx={{ width: '100%', maxWidth: 700 }}>
                {medicos.length === 0 && !isLoading && !error ? (
                    <Alert severity="info">
                        No se encontraron médicos registrados en el sistema.
                    </Alert>
                ) : (
                    medicos.map((medico) => (
                        <Card 
                            key={medico.id_medico}
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
                                {/* Nombre del médico */}
                                <Typography 
                                    variant="h5" 
                                    component="div" 
                                    sx={{ fontWeight: 600, color: 'primary.dark' }}
                                >
                                    {medico.nombre} {medico.apellido}
                                    
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
                                            {medico.matricula}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <AccessTimeIcon color="success" sx={{ mr: 1, fontSize: 18, mt: 0.3 }} />
                                        <Stack>
                                            <Typography variant="body1" fontWeight="bold">
                                                Horario de Atención:
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {medico.horario_atencion}
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
