import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.tsx";
import DashboardPage from "../features/Dashboard/views/DashboardPage.tsx";
import PacientesPage from "../features/Pacientes/views/PacientesPage.tsx";
import MedicosPage from "src/features/Medicos/views/MedicosPage.tsx";
import TurnosPage from "src/features/Turnos/views/TurnosPage.tsx";


export const router = createBrowserRouter([
    {
        path: "/",
        Component: AppLayout,
        children: [
            // Inicio
            { index: true, Component: DashboardPage },

            // Pacientes
            { path: "pacientes", Component: PacientesPage },

            // Medicos
            { path: "medicos", Component: MedicosPage },

            // Agendar Turnos
            { path: "turnos", Component: TurnosPage },

        ]
    },
]);