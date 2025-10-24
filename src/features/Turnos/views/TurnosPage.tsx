import { useEffect, useState } from 'react'
import { TurnosService } from './../services/TurnosService'
import type { Turno } from "./../types/TurnosTypes"
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

export default function TurnosPage() {
    const [turnos, setTurnos] = useState<Turno[]>([])
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTurnos () {
            const resultado = await TurnosService.obtenerTurnos()
            setTurnos(resultado)
        }
        fetchTurnos()
    }, [])
    
    function handleButtonNavClickCrear() {
            navigate("crear");
        }
    
        function handleButtonNavClickEditar(id: number) {
            navigate(`editar/${id}`);
        }
    
        async function handleButtonNavClickEliminar(id: number) {
            await TurnosService.eliminarTurno(id);
            setTurnos(turnos.filter(p => p.id_turno !== id));
        }

    return (
        <>
            <div>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Button variant="contained" onClick={handleButtonNavClickCrear}>CREAR NUEVO TURNO</Button>
                    <Button variant="contained" onClick={handleButtonNavClickEditar}>EDITAR TURNO</Button>
                    <Button variant="contained" onClick={handleButtonNavClickEliminar}>ELIMINAR TURNO</Button>
                </Box>

            </div>

            <h2>INFORMACION DE TURNOS</h2>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID Turno</TableCell>
                            <TableCell>ID Paciente</TableCell>
                            <TableCell>ID Medico</TableCell>
                            <TableCell>Numero Consultorio</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Hora</TableCell>
                            <TableCell>Observaciones</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {turnos.map((turno) => (
                            <TableRow key={turno.id_turno}>
                                <TableCell>{turno.id_paciente}</TableCell>
                                <TableCell>{turno.id_medico}</TableCell>
                                <TableCell>{turno.numero_consultorio}</TableCell>
                                <TableCell>{turno.fecha}</TableCell>
                                <TableCell>{turno.hora}</TableCell>
                                <TableCell>{turno.observaciones}</TableCell>
                                <TableCell>{turno.estado}</TableCell>
                                <TableCell>
                                    <ButtonGroup variant="outlined">
                                        <IconButton color="primary" onClick={() => handleButtonNavClickEditar(turno.id_turno)}>
                                            <EditOutlinedIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleButtonNavClickEliminar(turno.id_turno)}>
                                            <DeleteOutlineOutlinedIcon />
                                        </IconButton>
                                    </ButtonGroup>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}