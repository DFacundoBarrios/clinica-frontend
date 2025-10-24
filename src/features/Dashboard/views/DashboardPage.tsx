
import React from 'react';
import type { FC } from 'react'; // Importamos el tipo FunctionComponent
import styles from './DashboardPage.module.css';


// --- Definición de Tipos ---
interface Appointment {
    time: string;
    patientName: string;
    doctorName: string;
    status: 'Confirmado' | 'Pendiente'; // Usamos tipos literales para más seguridad
}

interface Stats {
    todayAppointments: number;
    newPatients: number;
}


// --- Iconos SVG (sin cambios, son componentes funcionales) ---
const CalendarIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
);

const UserPlusIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="22" x2="22" y1="8" y2="14" /><line x1="19" x2="25" y1="11" y2="11" /></svg>
);

const ClockIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);


// --- Componente Principal del Dashboard ---
const DashboardPage: FC = () => {
    // Datos de ejemplo, ahora tipados con nuestras interfaces
    const upcomingAppointments: Appointment[] = [
        { time: '09:00 AM', patientName: 'Ana García', doctorName: 'Dr. Carlos Ruiz', status: 'Confirmado' },
        { time: '10:30 AM', patientName: 'Luis Martínez', doctorName: 'Dra. Elena Soto', status: 'Confirmado' },
        { time: '12:00 PM', patientName: 'Sofía Rodríguez', doctorName: 'Dr. Carlos Ruiz', status: 'Pendiente' },
    ];

    const stats: Stats = {
        todayAppointments: 14,
        newPatients: 3,
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1 className={styles.headerTitle}>¡Bienvenido de nuevo!</h1>
                <p className={styles.headerSubtitle}>Resumen de la actividad de hoy en la clínica.</p>
            </header>
            
            {/* Sección de Estadísticas */}
            <section className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
                        <CalendarIcon />
                    </div>
                    <div>
                        <p className={styles.statValue}>{stats.todayAppointments}</p>
                        <p className={styles.statTitle}>Turnos para Hoy</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
                        <UserPlusIcon />
                    </div>
                    <div>
                        <p className={styles.statValue}>{stats.newPatients}</p>
                        <p className={styles.statTitle}>Nuevos Pacientes</p>
                    </div>
                </div>
            </section>

            {/* Sección Principal (Turnos y Acciones) */}
            <main className={styles.mainGrid}>
                <div className={styles.appointmentsList}>
                    <h2 className={styles.sectionTitle}>Próximos Turnos</h2>
                    {upcomingAppointments.map((appt, index) => (
                        <div key={index} className={styles.appointmentItem}>
                            <div className={styles.appointmentTime}>
                                <ClockIcon /> {appt.time}
                            </div>
                            <div className={styles.appointmentDetails}>
                                <p className={styles.patientName}>{appt.patientName}</p>
                                <p className={styles.doctorName}>{appt.doctorName}</p>
                            </div>
                            <span className={`${styles.statusBadge} ${appt.status === 'Confirmado' ? styles.statusConfirmed : styles.statusPending}`}>
                                {appt.status}
                            </span>
                        </div>
                    ))}
                </div>


            </main>
        </div>
    );
}

export default DashboardPage;