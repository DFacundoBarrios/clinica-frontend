import React, { useState, useCallback } from 'react';
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
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Alert,
    type SelectChangeEvent
} from '@mui/material';

import { apiService } from 'src/services/api';
import type {  AppointmentReport } from 'src/types';

type AppointmentFilterType = 'week' | 'month' | 'year' | 'custom';

const ReportesPage: React.FC = () => {
    const [filterType, setFilterType] = useState<AppointmentFilterType>('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Estado para los datos y el estado de carga/error
    const [appointments, setAppointments] = useState<AppointmentReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Función para obtener los datos del backend
    const fetchAppointmentsReport = useCallback(async () => {
        setLoading(true);
        setError(null);

        //parámetros de la URL
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

            // La convertimos de nuevo a un string en formato YYYY-MM-DD.
            const adjustedEndDate = finalDate.toISOString().split('T')[0];

            params.append('startDate', startDate);
            params.append('endDate', adjustedEndDate);
        }

        try {
            const response = await apiService.getAppointmentsReport(params);
            setAppointments(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al obtener el reporte.');
            setAppointments([]); // Limpiamos los datos en caso de error
        } finally {
            setLoading(false);
        }
    }, [filterType, startDate, endDate]);


    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSearched(true);
        fetchAppointmentsReport();
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
                    REPORTE DE HISTORIAL DE TURNOS 
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
                            <TextField
                                label="Fecha de Inicio"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 200 }}
                            />
                            <TextField
                                label="Fecha de Fin"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ minWidth: 200 }}
                            />
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
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={3}>
                    <TableContainer>
                    <Table sx={{ minWidth: 700 }} aria-label="tabla de pacientes">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Hora</TableCell>
                                <TableCell>Paciente</TableCell>
                                <TableCell>Medico</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hasSearched && appointments.length > 0 ? (
                                appointments.map(app => (
                                    <TableRow key={app.id_appointment}>
                                        <TableCell>{new Date(app.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{app.hour}</TableCell>
                                        <TableCell>{`${app.patient.name} ${app.patient.lastname}`}</TableCell>
                                        <TableCell>{`${app.doctor.name} ${app.doctor.lastname}`}</TableCell>
                                    </TableRow>
                                ))
                            ) : hasSearched ? (
                                <TableRow><TableCell colSpan={4} align="center">No se encontraron turnos para el filtro seleccionado.</TableCell></TableRow>
                            ) : (
                                <TableRow><TableCell colSpan={4} align="center">Seleccione un filtro y genere un reporte para ver los resultados.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default ReportesPage;