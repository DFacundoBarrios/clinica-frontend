import { useEffect, useState } from 'react'
import { MedicosService } from './../services/MedicosService'
import type { Medico } from "./../types/MedicoTypes"
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


export default function MedicosPage() {
    const [medicos, setMedicos] = useState<Medico[]>([])
    useEffect(() => {
        async function fn () {
            const resultado = await MedicosService.obtenerMedicos()
            setMedicos(resultado)
        }
        fn()
    }, [])
    const navigate = useNavigate();
    
    function handleButtonNavClickCrear() {
            navigate("crear");
        }
    
        function handleButtonNavClickEditar(id: number) {
            navigate(`editar/${id}`);
        }
    
        async function handleButtonNavClickEliminar(id: number) {
            await MedicosService.eliminarMedico(id);
            setMedicos(medicos.filter(p => p.id_medico !== id));
        }
    
        return (
            <>
                <div>
                    <Box sx={{ width: '100%', mb: 2 }}>
                        <Button variant="contained" onClick={handleButtonNavClickCrear}>CREAR NUEVO MEDICO</Button>
                        <Button variant="contained" onClick={handleButtonNavClickEditar}>EDITAR MEDICO</Button>
                        <Button variant="contained" onClick={handleButtonNavClickEliminar}>ELIMINAR MEDICO</Button>
                    </Box>
    
                </div>
    
                <h2>INFORMACION DE MEDICOS</h2>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID Medico</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Apellido</TableCell>
                                <TableCell>Matricula</TableCell>
                                <TableCell>Horario de Atencion</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {medicos.map((medico) => (
                                <TableRow key={medico.id_medico}>
                                    <TableCell>{medico.nombre}</TableCell>
                                    <TableCell>{medico.apellido}</TableCell>
                                    <TableCell>{medico.matricula}</TableCell>
                                    <TableCell>{medico.horario_atencion}</TableCell>
                                    <TableCell>
                                        <ButtonGroup variant="outlined">
                                            <IconButton color="primary" onClick={() => handleButtonNavClickEditar(medico.id_medico)}>
                                                <EditOutlinedIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleButtonNavClickEliminar(medico.id_medico)}>
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