import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Stack, Typography } from '@mui/material';
import type { PacienteCrearDto } from "./../types/PacienteTypes";
import { PacientesService } from "./../services/PacientesService";

const estadoInicial: PacienteCrearDto = {
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    direccion: "",
};

export default function PacientesCrearPage() {
    const [form, setForm] = useState<PacienteCrearDto>(estadoInicial);
    const navigate = useNavigate();

    async function handleOnSubmit(event: FormEvent) {
        event.preventDefault();
        try {
            await PacientesService.crearPaciente(form);
            alert("Paciente creado con éxito");
            navigate('/pacientes'); // Redirige a la lista de pacientes
        } catch (e) {
            console.error(e);
            alert("Error al crear el paciente");
        }
    }

    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setForm(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    }

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Registrar Nuevo Paciente
            </Typography>
            <form autoComplete="off" noValidate onSubmit={handleOnSubmit}>
                <Stack spacing={2} sx={{ maxWidth: 400 }}>
                    <TextField
                        required
                        value={form.nombre}
                        name="nombre"
                        onChange={handleOnChange}
                        label="Nombre"
                    />
                    <TextField
                        required
                        value={form.apellido}
                        name="apellido"
                        onChange={handleOnChange}
                        label="Apellido"
                    />
                    <TextField
                        required
                        value={form.dni}
                        name="dni"
                        onChange={handleOnChange}
                        label="DNI"
                    />
                    <TextField
                        required
                        value={form.telefono}
                        name="telefono"
                        onChange={handleOnChange}
                        label="Teléfono"
                    />
                    <TextField
                        required
                        value={form.direccion}
                        name="direccion"
                        onChange={handleOnChange}
                        label="Dirección"
                    />
                    <Box>
                        <Button variant="contained" type="submit">Guardar</Button>
                        <Button variant="outlined" onClick={() => navigate('/pacientes')} sx={{ ml: 1 }}>Cancelar</Button>
                    </Box>
                </Stack>
            </form>
        </Box>
    );
}