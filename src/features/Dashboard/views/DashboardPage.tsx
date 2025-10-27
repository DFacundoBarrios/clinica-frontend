import React, { useState, useMemo } from 'react';
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
    CircularProgress,
    ButtonBase, 
    Dialog,     
    DialogTitle,
    DialogContent,
    DialogActions,
    ListItem
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';

//Para graficos
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Imports para datos reales ---
import { useApi } from 'src/hooks/useApi';
import { apiService } from 'src/services/api';
import type { Appointment, Patient } from 'src/types';

// --- Modales ---
import { PacienteFormDialog } from 'src/features/Pacientes/views/PacienteFormDialog';
import { TurnoFormDialog } from 'src/features/Turnos/views/TurnoFormDialog';


// --- Función de fecha  ---
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


// --- Componente Gráfico ---
interface ChartProps {
    data: { name: string; cantidad: number; fill: string }[];
}
const AppointmentStatusBarChart: React.FC<ChartProps> = ({ data }) => (
    <ResponsiveContainer width="100%" height={250}>
        <BarChart
            data={data}
            margin={{
                top: 5, right: 10, left: -20, bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="cantidad" barSize={30} radius={[4, 4, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
);


// --- . Componente del Modal de Información ---
const InfoDialog = ({ open, onClose, title, children }: {
    open: boolean,
    onClose: () => void,
    title: string,
    children: React.ReactNode
}) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">{title}</Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
            {children}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
    </Dialog>
);


// --- Componente Principal del Dashboard (Actualizado) ---
const DashboardPage: React.FC = () => {
    const [openPacienteDialog, setOpenPacienteDialog] = useState(false);
    const [openTurnoDialog, setOpenTurnoDialog] = useState(false);

    // 💡 3. Estado para el nuevo modal de información
    const [modalInfo, setModalInfo] = useState<{
        open: boolean;
        title: string;
        content: React.ReactNode;
    }>({ open: false, title: '', content: null });


    // --- Carga de datos (sin cambios) ---
    const {
        data: turnosData,
        loading: loadingTurnos,
        execute: fetchTurnos
    } = useApi<Appointment[]>(
        apiService.getAppointments
    );
    const {
        data: pacientesData,
        loading: loadingPacientes,
        execute: fetchPacientes
    } = useApi<Patient[]>(
        apiService.getPatients
    );

    // --- Procesar y calcular datos ---

    // Filtramos los turnos que son para hoy
    const turnosHoy = useMemo(() => {
        if (!turnosData) return [];
        const todayStr = getTodayString();
        return turnosData.filter(t => (t.date === todayStr || t.date.startsWith(todayStr)));
    }, [turnosData]);

    // 💡 Creamos la lista de turnos pendientes
    const turnosPendientes = useMemo(() => {
        return turnosHoy.filter(
            t => t.state?.toUpperCase() === 'RESERVADO'
        );
    }, [turnosHoy]);

    // Calculamos las estadísticas
    const stats = useMemo(() => {
        const todayAppointments = turnosHoy.length;
        const totalPacientes = pacientesData?.length ?? 0;
        const pendingConfirmations = turnosPendientes.length; // 💡 Usamos la lista

        return {
            todayAppointments,
            totalPacientes,
            pendingConfirmations,
        };
    }, [turnosHoy, pacientesData, turnosPendientes]); // 💡 Añadida dependencia

    // Datos del gráfico (sin cambios)
    const appointmentStatusData = useMemo(() => [
        { name: 'Reservados', cantidad: turnosHoy.filter(t => t.state === 'RESERVADO').length, fill: '#f1bd02ff' },
        { name: 'Atendidos', cantidad: turnosHoy.filter(t => t.state === 'ATENDIDO').length, fill: '#1eec0bff' },
        { name: 'Cancelados', cantidad: turnosHoy.filter(t => t.state === 'CANCELADO').length, fill: '#d10000ff' },
    ], [turnosHoy]);


    // handleSuccess (sin cambios)
    const handleSuccess = (message: string) => {
        console.log("Acción exitosa:", message);
        setOpenPacienteDialog(false);
        setOpenTurnoDialog(false);
        fetchTurnos();
        fetchPacientes();
    };

    // getStatusColor (sin cambios)
    const getStatusColor = (status?: string): "success" | "warning" | "error" | "info" | "default" => {
        switch (status?.toUpperCase()) {
            case 'RESERVADO': return 'success';
            case 'ATENDIDO': return 'info';
            case 'PENDIENTE': return 'warning';
            case 'CANCELADO': return 'error';
            default: return 'default';
        }
    }

    // --- 💡 5. Componentes para renderizar el contenido del modal ---

    // Renderizador para listas de Turnos
    const TurnosListRenderer = ({ turnos }: { turnos: Appointment[] }) => (
        <List dense>
            {turnos.length === 0 ? <ListItem><ListItemText primary="No hay turnos para mostrar." /></ListItem> : null}
            {turnos.map(turno => (
                <ListItem key={turno.id_appointment}>
                    <ListItemIcon><AccessTimeIcon fontSize="small" /></ListItemIcon>
                    <ListItemText
                        primary={`${turno.hour?.slice(0, 5) || 'Sin hora'} - ${turno.patient?.name} ${turno.patient?.lastname}`}
                        secondary={`Dr./a ${turno.doctor?.lastname || 'N/A'}`}
                    />
                    <Chip label={turno.state} color={getStatusColor(turno.state)} size="small" />
                </ListItem>
            ))}
        </List>
    );

    // Renderizador para listas de Pacientes
    const PacientesListRenderer = ({ pacientes }: { pacientes: Patient[] }) => (
        <List dense>
            {pacientes.length === 0 ? <ListItem><ListItemText primary="No hay pacientes para mostrar." /></ListItem> : null}
            {pacientes.map(p => (
                <ListItem key={p.id_patient}>
                    <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText
                        primary={`${p.name} ${p.lastname}`}
                        secondary={`DNI: ${p.dni} - Tel: ${p.phone}`}
                    />
                </ListItem>
            ))}
        </List>
    );

    // --- 💡 6. Handlers para abrir el modal de información ---

    const handleOpenTurnosHoy = () => {
        setModalInfo({
            open: true,
            title: 'Turnos para Hoy',
            content: <TurnosListRenderer turnos={turnosHoy} />
        });
    };

    const handleOpenPacientesTotales = () => {
        setModalInfo({
            open: true,
            title: 'Pacientes Totales',
            content: <PacientesListRenderer pacientes={pacientesData || []} />
        });
    };

    const handleOpenTurnosPendientes = () => {
        setModalInfo({
            open: true,
            title: 'Turnos Pendientes (Hoy)',
            content: <TurnosListRenderer turnos={turnosPendientes} />
        });
    };


    // Estado de Carga (sin cambios)
    if (loadingTurnos || loadingPacientes) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Cargando datos...</Typography>
            </Box>
        );
    }

    // --- RENDER (Actualizado) ---
    return (
        <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: 'calc(100vh - 64px)' }}>
            {/* Encabezado (sin cambios) */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                RESUMEN GENERAL 🏥
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Vista rápida de la actividad de la clínica.
            </Typography>

            {/* 💡 7. Sección de Estadísticas (Ahora Clicable) */}
            <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}
            >
                {/* Card 1: Turnos para Hoy */}
                <ButtonBase
                    onClick={handleOpenTurnosHoy} // 💡
                    sx={{ borderRadius: 2, flexGrow: 1, minWidth: '250px', textAlign: 'left', '&:hover': { boxShadow: 6 } }}
                >
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, width: '100%' }}>
                        <ListItemIcon sx={{ minWidth: 48, color: 'primary.main', mr: 2 }}>
                            <EventAvailableIcon sx={{ fontSize: 40 }} />
                        </ListItemIcon>
                        <Box> <Typography variant="h4" sx={{ fontWeight: 'bold' }}> {stats.todayAppointments} </Typography> <Typography variant="body2" color="text.secondary">Turnos para Hoy</Typography> </Box>
                    </Paper>
                </ButtonBase>

                {/* Card 2: Pacientes Totales */}
                <ButtonBase
                    onClick={handleOpenPacientesTotales} // 💡
                    sx={{ borderRadius: 2, flexGrow: 1, minWidth: '250px', textAlign: 'left', '&:hover': { boxShadow: 6 } }}
                >
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, width: '100%' }}>
                        <ListItemIcon sx={{ minWidth: 48, color: 'success.main', mr: 2 }}>
                            <PersonAddIcon sx={{ fontSize: 40 }} />
                        </ListItemIcon>
                        <Box> <Typography variant="h4" sx={{ fontWeight: 'bold' }}> {stats.totalPacientes} </Typography> <Typography variant="body2" color="text.secondary">Pacientes Totales</Typography> </Box>
                    </Paper>
                </ButtonBase>

                {/* Card 3: Turnos Pendientes */}
                <ButtonBase
                    onClick={handleOpenTurnosPendientes} // 💡
                    sx={{ borderRadius: 2, flexGrow: 1, minWidth: '250px', textAlign: 'left', '&:hover': { boxShadow: 6 } }}
                >
                    <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, width: '100%' }}>
                        <ListItemIcon sx={{ minWidth: 48, color: 'warning.main', mr: 2 }}>
                            <AssessmentIcon sx={{ fontSize: 40 }} />
                        </ListItemIcon>
                        <Box> <Typography variant="h4" sx={{ fontWeight: 'bold' }}> {stats.pendingConfirmations} </Typography> <Typography variant="body2" color="text.secondary">Turnos Pendientes (Hoy)</Typography> </Box>
                    </Paper>
                </ButtonBase>
            </Box>

            {/* Sección Principal (Turnos y Acciones) - Sin cambios */}
            <Box
                sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}
            >
                {/* Columna Izquierda: Lista de Próximos Turnos */}
                <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '70%' } }}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '91%' }}>
                        <Typography variant="h6" sx={{ mb: 1, px: 1 }}>Turnos de Hoy</Typography>
                        <List disablePadding>
                            {(turnosHoy && turnosHoy.length > 0) ? (
                                turnosHoy.map((appt, index) => (
                                    <React.Fragment key={appt.id_appointment || index}>
                                        <ListItemButton sx={{ borderRadius: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}> <AccessTimeIcon fontSize="small" color="action" /> </ListItemIcon>
                                            <ListItemText
                                                primaryTypographyProps={{ fontWeight: 500 }}
                                                primary={`${appt.hour?.slice(0, 5)} - ${appt.patient?.name ?? 'Paciente'} ${appt.patient?.lastname ?? 'N/A'}`}
                                                secondary={`Dr./a ${appt.doctor?.lastname ?? 'N/A'}`}
                                            />
                                            <Chip
                                                label={appt.state || 'Pendiente'}
                                                color={getStatusColor(appt.state)}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </ListItemButton>
                                        {index < turnosHoy.length - 1 && <Divider component="li" variant="inset" />}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}> No hay turnos agendados para hoy. </Typography>
                            )}
                        </List>
                    </Paper>
                </Box>

                {/* Columna Derecha: Acciones Rápidas y Gráfico */}
                <Box sx={{ flexGrow: 1, flexBasis: { xs: '100%', md: '70%' } }}>
                    <Stack spacing={3}>

                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Estado de Turnos Hoy</Typography>
                            <AppointmentStatusBarChart data={appointmentStatusData} />
                        </Paper>
                    </Stack>
                </Box>
            </Box>

            {/* Modales */}
            <PacienteFormDialog open={openPacienteDialog} onClose={() => setOpenPacienteDialog(false)} onSuccess={handleSuccess} />
            <TurnoFormDialog open={openTurnoDialog} onClose={() => setOpenTurnoDialog(false)} onSuccess={handleSuccess} />

            <InfoDialog
                open={modalInfo.open}
                onClose={() => setModalInfo({ open: false, title: '', content: null })}
                title={modalInfo.title}
            >
                {modalInfo.content}
            </InfoDialog>
        </Box>
    );
}

export default DashboardPage;