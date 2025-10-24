import { useState } from "react"
import type { FormEvent, ChangeEvent } from "react"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type { TurnoCrearDto } from "./../types/TurnosTypes" 
import { TurnosService } from "./../services/TurnosService"

const estadoInicial: TurnoCrearDto = {
    id_paciente: 0,
    id_medico: 0,
    numero_consultorio: 0,
    fecha: '',
    hora: '',
    observaciones: '',
    estado: ''
}

export default function TurnosCrearDto() {
    const [form, setForm] = useState<TurnoCrearDto>(estadoInicial)
    const [cargando, setCargando] = useState<boolean>(false)

    async function handleOnSubmit (event: FormEvent) {
        event.preventDefault();
        try {
            setCargando(true)
            const result = await TurnosService.crearTurnos(form)
            reiniciarForm()
        } catch (e) {
            console.error(e)
        } finally {
            setCargando(false)
        }
    }
    function handleOnChange (event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setForm(prevFormData => ({
            ...prevFormData,
            [name]: name === "stock" || name === "precio" ? Number(value) : value
        }));
    }
    function handleClickReiniciar () {
        reiniciarForm()
    }
    function reiniciarForm () {
        setForm(estadoInicial)
    }
    return (
        <div>
            <div>
                <h1>Formulario para crear Turnos</h1>
            </div>

            <form autoComplete="off" noValidate onSubmit={handleOnSubmit}>
                <div>
                    <TextField
                    required
                    value={form.id_paciente}
                    type="number"
                    name="id_paciente"
                    onChange={handleOnChange}
                    label="Numero ID de Paciente"/>

                    <TextField
                    required
                    value={form.id_medico}
                    type="number"
                    name="id_medico"
                    onChange={handleOnChange}
                    label="Numero ID de Medico"/>

                    <TextField
                    required
                    value={form.numero_consultorio}
                    type="number"
                    name="numero_consultorio"
                    onChange={handleOnChange}
                    label="Numero de Consultorio"/>

                    <TextField
                    value={form.fecha}
                    name="fecha"
                    onChange={handleOnChange}
                    label="Fecha"/>

                    <TextField
                    value={form.hora}
                    name="hora"
                    onChange={handleOnChange}
                    label="Hora"/>

                    <TextField
                    value={form.observaciones}
                    name="observaciones"
                    onChange={handleOnChange}
                    label="Observaciones"/>

                    <TextField
                    required
                    value={form.estado}
                    name="estado"
                    onChange={handleOnChange}
                    label="estado"/>

                    <div>
                        <Button variant="contained" type="submit">Enviar</Button>
                        <Button variant="outlined" onClick={handleClickReiniciar}>Cancelar</Button>
                    </div>
                </div>
            </form>

        </div>
    )
}