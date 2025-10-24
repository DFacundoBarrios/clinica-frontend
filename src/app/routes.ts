import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.tsx";
import DashboardPage from "../features/Dashboard/views/DashboardPage.tsx";
import PacientesPage from "../features/Pacientes/views/PacientesPage.tsx";
//import PacientesEditarPage from "../features/Pacientes/views/PacientesEditarPage.tsx";
//import PacientesEliminarPage from "../features/Pacientes/views/PacientesEliminarPage.tsx";
import MedicosPage from "src/features/Medicos/views/MedicosPage.tsx";
import TurnosPage from "src/features/Turnos/views/TurnosPage.tsx";
import MedicosCrearPage from "src/features/Medicos/views/MedicosCrearPage.tsx";
import PacientesCrearPage from "src/features/Pacientes/views/PacientesCrearPage.tsx";
import TurnosCrearPage from "src/features/Turnos/views/TurnosCrearPage.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: AppLayout,
        children: [
            { index: true, Component: DashboardPage },
            { path: "pacientes", Component: PacientesPage },
            { path: "pacientes/crear", Component: PacientesCrearPage},
            //{ path: "pacientes/editar", Component: PacientesEditarPage},
            { path: "medicos", Component: MedicosPage},
            { path: "medicos/crear", Component:MedicosCrearPage},
            { path: "turnos", Component: TurnosPage},
            { path: "turnos/crear", Component: TurnosCrearPage}

        ]
    },
]);