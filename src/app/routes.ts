
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.tsx";
import DashboardPage from "../features/Dashboard/views/DashboardPage.tsx";
import PacientesPage from "../features/Pacientes/views/PacientesPage.tsx";
//import PacientesEditarPage from "../features/Pacientes/views/PacientesEditarPage.tsx";
//import PacientesEliminarPage from "../features/Pacientes/views/PacientesEliminarPage.tsx";
import MedicosPage from "src/features/Medicos/views/MedicosPage.tsx";
import TurnosPage from "src/features/Turnos/views/TurnosPage.tsx";
import PacientesCrearPage from "src/features/Pacientes/views/PacientesCrearPage.tsx";
import TurnosCrearPage from "src/features/Turnos/views/TurnosCrearPage.tsx";

// Creamos un componente de marcador de posición para la nueva ruta de Reportes

export const router = createBrowserRouter([
    {
        path: "/",
        Component: AppLayout,
        children: [
            // Inicio
            { index: true, Component: DashboardPage }, 

            // Pacientes
            { path: "pacientes", Component: PacientesPage },
            { path: "pacientes/crear", Component: PacientesCrearPage},
            // { path: "pacientes/editar/:id", Component: PacientesEditarPage}, // Descomentar cuando exista

            // Medicos
            { path: "medicos", Component: MedicosPage},
            
            // Agendar Turnos
            { path: "turnos", Component: TurnosPage},
            { path: "turnos/crear", Component: TurnosCrearPage},
            // { path: "turnos/editar/:id", Component: TurnosEditarPage}, // Descomentar cuando exista


        ]
    },
]);