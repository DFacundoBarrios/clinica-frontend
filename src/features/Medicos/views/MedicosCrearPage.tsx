import { useState } from "react"
import type { FormEvent, ChangeEvent } from "react"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type { MedicoCrearDto } from "./../types/MedicoTypes" 
import { MedicosService } from "./../services/MedicosService"

const estadoInicial: MedicoCrearDto = {
    nombre: "",
    apellido: "",
    matricula: "",
    horario_atencion: "",
}

export default function MedicosCrearPage() {
    const [form, setForm] = useState<MedicoCrearDto>(estadoInicial)
    const [cargando, setCargando] = useState<boolean>(false)

    async function handleOnSubmit (event: FormEvent) {
        event.preventDefault();
        try {
            setCargando(true)
            const result = await MedicosService.crearMedico(form)
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
                <h1>Formulario para crear Medicos</h1>
            </div>

            <form autoComplete="off" noValidate onSubmit={handleOnSubmit}>
                <div>
                    
                    <TextField
                    value={form.nombre}
                    name="nombre"
                    onChange={handleOnChange}
                    label="Nombre"/>

                    <TextField
                    value={form.apellido}
                    name="apellido"
                    onChange={handleOnChange}
                    label="apellido"/>

                    <TextField
                    required
                    value={form.matricula}
                    name="matricula"
                    onChange={handleOnChange}
                    label="Numero de Matricula"/>

                    <TextField
                    value={form.horario_atencion}
                    name="horario_atencion"
                    onChange={handleOnChange}
                    label="Horario de Atencion"/>

                    <div>
                        <Button variant="contained" type="submit">Enviar</Button>
                        <Button variant="outlined" onClick={handleClickReiniciar}>Cancelar</Button>
                    </div>
                </div>
            </form>

        </div>
    )
}