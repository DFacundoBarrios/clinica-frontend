import { useEffect, useState } from 'react';
import type { Paciente } from "./../types/PacienteTypes";
import { PacientesService } from './../services/PacientesService';
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

export default function PacientesPage() {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPacientes() {
            const resultado = await PacientesService.obtenerPacientes();
            setPacientes(resultado);
        }
        fetchPacientes();
    }, []);

    function handleButtonNavClickCrear() {
        navigate("crear");
    }

    function handleButtonNavClickEditar(id: number) {
        navigate(`editar/${id}`);
    }

    async function handleButtonNavClickEliminar(id: number) {
        await PacientesService.eliminarPaciente(id);
        setPacientes(pacientes.filter(p => p.id_paciente !== id));
    }

    return (
        <>
            <div>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Button variant="contained" onClick={handleButtonNavClickCrear}>CREAR NUEVO PACIENTE</Button>
                    <Button variant="contained" onClick={handleButtonNavClickEditar}>EDITAR PACIENTE</Button>
                    <Button variant="contained" onClick={handleButtonNavClickEliminar}>ELIMINAR PACIENTE</Button>
                </Box>

            </div>

            <h2>INFORMACION DE PACIENTES</h2>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Apellido</TableCell>
                            <TableCell>DNI</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Dirección</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pacientes.map((paciente) => (
                            <TableRow key={paciente.id_paciente}>
                                <TableCell>{paciente.id_paciente}</TableCell>
                                <TableCell>{paciente.nombre}</TableCell>
                                <TableCell>{paciente.apellido}</TableCell>
                                <TableCell>{paciente.dni}</TableCell>
                                <TableCell>{paciente.telefono}</TableCell>
                                <TableCell>{paciente.direccion}</TableCell>
                                <TableCell>
                                    <ButtonGroup variant="outlined">
                                        <IconButton color="primary" onClick={() => handleButtonNavClickEditar(paciente.id_paciente)}>
                                            <EditOutlinedIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleButtonNavClickEliminar(paciente.id_paciente)}>
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