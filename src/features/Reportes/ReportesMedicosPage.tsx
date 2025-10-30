import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    type SelectChangeEvent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { apiService } from 'src/services/api';
import type { Doctor, Patient } from 'src/types';

type AppointmentFilterType = 'week' | 'month' | 'year' | 'custom';

const ReportesMedicosPage: React.FC = () => {
    const [filterType, setFilterType] = useState<AppointmentFilterType>('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [doctorsWithAppointments, setDoctorsWithAppointments] = useState<Doctor[]>([]);
    const [allPatients, setAllPatients] = useState<Patient[]>([]); // <-- 1. Estado para guardar todos los pacientes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDoctorsReport = useCallback(async () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('filterType', filterType);

        if (filterType === 'custom') {
            if (!startDate || !endDate) {
                setError('Para el filtro personalizado, debe seleccionar una fecha de inicio y fin.');
                setLoading(false);
                return;
            }
            const finalDate = new Date(endDate);
            finalDate.setDate(finalDate.getDate() + 1);
            const adjustedEndDate = finalDate.toISOString().split('T')[0];

            params.append('startDate', startDate);
            params.append('endDate', adjustedEndDate);
        }

        try {
            const response = await apiService.getDoctorsReport(params);
            setDoctorsWithAppointments(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al obtener el reporte de médicos.');
            setDoctorsWithAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [filterType, startDate, endDate]);

    useEffect(() => {
        // <-- 2. Cargar la lista de pacientes al montar el componente
        const fetchAllPatients = async () => {
            try {
                const response = await apiService.getPatients();
                setAllPatients(response.data);
            } catch (err) {
                console.error("Error al cargar la lista de pacientes:", err);
                // No bloqueamos la UI, el reporte puede funcionar mostrando solo IDs.
            }
        };

        fetchAllPatients();
        fetchDoctorsReport();
    }, [fetchDoctorsReport]);

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        fetchDoctorsReport();
    };

    // <-- 3. Función para encontrar el nombre del paciente por su ID
    const getPatientDisplayInfo = (appointment: any): string => {
        // El backend devuelve el ID del paciente dentro de un objeto 'patient' parcial.
        const patientId = appointment.patient?.id_patient;

        if (!patientId) return 'N/A';

        const patient = allPatients.find(p => p.id_patient === patientId);
        if (patient) {
            return `${patient.name} ${patient.lastname} (ID: ${patientId})`;
        }
        return `ID Paciente: ${patientId}`; // Fallback si no se encuentra en la lista
    };

    return (
        <Box sx={{ 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            pb: 1,
            borderBottom: '1px solid #e0e0e0' 
        }}>
            <Typography variant="h4" component="h1" color="primary" sx={{ fontWeight: 'bold' }}>
                REPORTE DE ACTIVIDAD DE MÉDICOS
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box component="form" onSubmit={handleGenerateReport} sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                                            <InputLabel id="filter-type-label">FILTRAR POR</InputLabel>
                                            <Select
                                                labelId="filter-type-label"
                                                id="filter-type-select"
                                                value={filterType}
                                                label="Filtrar por"
                                                onChange={(e: SelectChangeEvent) => setFilterType(e.target.value as AppointmentFilterType)}
                                                MenuProps={{
                                                    PaperProps: {
                                                        sx: {
                                                            boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
                                                            border: (theme) => `1px solid ${theme.palette.divider}`,
                                                        },
                                                    },
                                                }}
                                            >
                                                <MenuItem value="week">ESTA SEMANA</MenuItem>
                                                <MenuItem value="month">ESTE MES</MenuItem>
                                                <MenuItem value="year">ESTE AÑO</MenuItem>
                                                <MenuItem value="custom">RANGO PERSONALIZADO</MenuItem>
                                            </Select>
                                        </FormControl>

                    {filterType === 'custom' && (
                        <>
                            <TextField label="Fecha de Inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
                            <TextField label="Fecha de Fin" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 200 }} />
                        </>
                    )}

                    <Button type="submit" variant="contained" disabled={loading} sx={{ height: '56px' }}>
                        {loading ? <CircularProgress size={24} /> : 'GENERAR REPORTE'}
                    </Button>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Typography variant="h5" gutterBottom>RESULTADOS</Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
                <Paper elevation={3} sx={{ overflow: 'hidden' }}>
                    {doctorsWithAppointments.length > 0 ? (
                        doctorsWithAppointments.map((doctor) => (
                            <Accordion key={doctor.id_doctor} disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
                                <AccordionSummary 
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        backgroundColor: 'primary.dark', 
                                        color: 'white',
                                        borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <Typography variant="h6">{`Dr. ${doctor.name} ${doctor.lastname}`}</Typography>
                                    <Typography sx={{ color: 'rgba(176, 168, 168, 1)', ml: 2 }}>
                                        {`(${doctor.appointments?.length || 0} turnos encontrados)`}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {doctor.appointments && doctor.appointments.length > 0 ? (
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Hora</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold' }}>Paciente</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {doctor.appointments.map(app => (
                                                    <TableRow key={app.id_appointment} hover>
                                                        <TableCell>{new Date(app.date).toLocaleDateString('es-AR', { timeZone: 'UTC' })}</TableCell>
                                                        <TableCell>{app.hour}</TableCell>
                                                        <TableCell>{getPatientDisplayInfo(app)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <Typography>No tuvo turnos en el período seleccionado.</Typography>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Alert severity="info" sx={{ m: 2 }}>No se encontraron médicos con actividad en el período seleccionado.</Alert>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default ReportesMedicosPage;
