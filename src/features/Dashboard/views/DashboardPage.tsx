import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    List,
    ListItemButton, 
    ListItemText,
    ListItemIcon,
    Chip,
    Divider,
    Stack,
    useTheme 
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';

//Para graficos
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


import { PacienteFormDialog } from 'src/features/Pacientes/views/PacienteFormDialog';
import { TurnoFormDialog } from 'src/features/Turnos/views/TurnoFormDialog';

// Importa los tipos si los necesitas
import type { Appointment } from 'src/types';

// --- Datos de Ejemplo (Mock Data) ---
interface DashboardStats {
    todayAppointments: number;
    newPatients: number;
    pendingConfirmations: number;
}

const mockStats: DashboardStats = {
    todayAppointments: 8,
    newPatients: 2,
    pendingConfirmations: 3,
};

// Usamos Partial<Appointment> para no tener que simular todos los campos anidados
const mockUpcomingAppointments: Partial<Appointment>[] = [
    { id_appointment: 1, hour: '09:00:00', patient: { name: 'Ana', lastname: 'García' } as any, doctor: { lastname: 'Ruiz' } as any, state: 'RESERVADO' },
    { id_appointment: 2, hour: '10:30:00', patient: { name: 'Luis', lastname: 'Martínez' } as any, doctor: { lastname: 'Soto' } as any, state: 'RESERVADO' },
    { id_appointment: 3, hour: '11:15:00', patient: { name: 'Carla', lastname: 'Pérez' } as any, doctor: { lastname: 'Gómez' } as any, state: 'ATENDIDO' },
    { id_appointment: 4, hour: '12:00:00', patient: { name: 'Sofía', lastname: 'Rodríguez' } as any, doctor: { lastname: 'Ruiz' } as any, state: 'CANCELADO' },
    { id_appointment: 5, hour: '14:00:00', patient: { name: 'Marcos', lastname: 'López' } as any, doctor: { lastname: 'Soto' } as any, state: 'RESERVADO' },
];

// 💡 Preparamos los datos para el gráfico de barras contando los estados
const appointmentStatusData = [
  { name: 'Reservados', cantidad: mockUpcomingAppointments.filter(t => t.state === 'RESERVADO').length, fill: '#82ca9d' /* Verde */ },
  { name: 'Atendidos', cantidad: mockUpcomingAppointments.filter(t => t.state === 'ATENDIDO').length, fill: '#8884d8' /* Violeta */ },
  { name: 'Cancelados', cantidad: mockUpcomingAppointments.filter(t => t.state === 'CANCELADO').length, fill: '#ff8042' /* Naranja */ },
  // Agrega otros estados si los tienes, ej:
  // { name: 'Pendientes', cantidad: mockUpcomingAppointments.filter(t => t.state === 'PENDIENTE').length, fill: '#ffbb28' /* Amarillo */ },
];


// --- Componente Gráfico ---
const AppointmentStatusBarChart = () => {
    const theme = useTheme(); // Para acceder a los colores del tema si quieres
    return (
        // Contenedor responsivo que ajusta el tamaño del gráfico
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                data={appointmentStatusData}
                margin={{
                    top: 5, right: 10, left: -20, bottom: 5, // Ajusta márgenes para que entren las etiquetas
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} /> {/* Líneas de guía horizontales */}
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} /> {/* Eje X con nombres de estado */}
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false}/> {/* Eje Y con cantidades */}
                <Tooltip cursor={{ fill: 'transparent' }}/> {/* Muestra info al pasar el mouse */}
                {/* <Legend />  // Leyenda (opcional) */}
                {/* Usamos el 'fill' definido en los datos */}
                <Bar dataKey="cantidad" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};


// --- Componente Principal del Dashboard ---
const DashboardPage: React.FC = () => {

    const [openPacienteDialog, setOpenPacienteDialog] = useState(false);
    const [openTurnoDialog, setOpenTurnoDialog] = useState(false);

    const stats = mockStats;
    const upcomingAppointments = mockUpcomingAppointments;

    const handleSuccess = (message: string) => {
        console.log("Acción simulada exitosa:", message);
        setOpenPacienteDialog(false);
        setOpenTurnoDialog(false);
        // Podrías añadir un Snackbar aquí
    };

    const getStatusColor = (status?: string): "success" | "warning" | "error" | "info" | "default" => {
         switch (status?.toUpperCase()) {
            case 'RESERVADO': return 'success';
            case 'ATENDIDO': return 'info';
            case 'PENDIENTE': return 'warning';
            case 'CANCELADO': return 'error';
            default: return 'default';
        }
    }

    return (
        <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: 'calc(100vh - 64px)' }}>
            {/* Encabezado */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                Resumen General 🏥
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Vista rápida de la actividad de la clínica.
            </Typography>

            {/* Sección de Estadísticas */}
            <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}
            >
                {/* Cards de Estadísticas (sin cambios) */}
                 <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, flexGrow: 1, minWidth: '250px' }}>
                    <ListItemIcon sx={{ minWidth: 48, color: 'primary.main', mr: 2 }}>
                        <EventAvailableIcon sx={{ fontSize: 40 }}/>
                    </ListItemIcon>
                    <Box> <Typography variant="h4" sx={{ fontWeight: 'bold' }}> {stats.todayAppointments} </Typography> <Typography variant="body2" color="text.secondary">Turnos para Hoy</Typography> </Box>
                </Paper>
                 <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, flexGrow: 1, minWidth: '250px' }}>
                    <ListItemIcon sx={{ minWidth: 48, color: 'success.main', mr: 2 }}>
                        <PersonAddIcon sx={{ fontSize: 40 }}/>
                    </ListItemIcon>
                    <Box> <Typography variant="h4" sx={{ fontWeight: 'bold' }}> {stats.newPatients} </Typography> <Typography variant="body2" color="text.secondary">Nuevos Pacientes</Typography> </Box>
                </Paper>
                 <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, flexGrow: 1, minWidth: '250px' }}>
                    <ListItemIcon sx={{ minWidth: 48, color: 'warning.main', mr: 2 }}>
                        <AssessmentIcon sx={{ fontSize: 40 }}/>
                    </ListItemIcon>
                    <Box> <Typography variant="h4" sx={{ fontWeight: 'bold' }}> {stats.pendingConfirmations} </Typography> <Typography variant="body2" color="text.secondary">Confirmaciones Pendientes</Typography> </Box>
                </Paper>
            </Box>

            {/* Sección Principal (Turnos y Acciones) */}
            <Box
                sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}
            >
                {/* Columna Izquierda: Lista de Próximos Turnos */}
                <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '60%' } }}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 1, px: 1 }}>Próximos Turnos</Typography>
                        <List disablePadding>
                            {(upcomingAppointments && upcomingAppointments.length > 0) ? (
                                upcomingAppointments.map((appt, index) => (
                                    <React.Fragment key={appt.id_appointment || index}>
                                        <ListItemButton sx={{ borderRadius: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}> <AccessTimeIcon fontSize="small" color="action" /> </ListItemIcon>
                                            <ListItemText
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                                primary={`${appt.hour?.slice(0,5)} - ${appt.patient?.name} ${appt.patient?.lastname}`}
                                                secondary={`Dr./a ${appt.doctor?.lastname ?? 'N/A'}`}
                                            />
                                            <Chip
                                                label={appt.state || 'Pendiente'}
                                                color={getStatusColor(appt.state)}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </ListItemButton>
                                        {index < upcomingAppointments.length - 1 && <Divider component="li" variant="inset" />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}> No hay próximos turnos. </Typography>
                            )}
                        </List>
                         <Box sx={{ textAlign: 'right', p: 1, pt: 2 }}> <Button size="small">Ver Agenda Completa</Button> </Box>
                    </Paper>
                </Box>

                {/* Columna Derecha: Acciones Rápidas y Gráfico */}
                <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '40%' } }}>
                    <Stack spacing={3}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Acciones Rápidas</Typography>
                            <Stack spacing={2}>
                                <Button variant="contained" startIcon={<AddCircleOutlineIcon />} size="large" onClick={() => setOpenTurnoDialog(true)} fullWidth > Agendar Turno </Button>
                                <Button variant="contained" color="secondary" startIcon={<PersonAddIcon />} size="large" onClick={() => setOpenPacienteDialog(true)} fullWidth > Registrar Paciente </Button>
                            </Stack>
                        </Paper>

                        {/* 💡 AQUÍ VA EL GRÁFICO */}
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                             <Typography variant="h6" sx={{ mb: 2 }}>Estado de Turnos Hoy</Typography>
                             {/* Renderiza el componente del gráfico */}
                             <AppointmentStatusBarChart />
                        </Paper>
                    </Stack>
                </Box>
            </Box>

             {/* Modales (sin cambios) */}
            <PacienteFormDialog open={openPacienteDialog} onClose={() => setOpenPacienteDialog(false)} onSuccess={handleSuccess} />
            <TurnoFormDialog open={openTurnoDialog} onClose={() => setOpenTurnoDialog(false)} onSuccess={handleSuccess} />
        </Box>
    );
}

export default DashboardPage;