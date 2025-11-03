Clínica Frontend
Este proyecto es el frontend de una aplicación web para la gestión de una clínica. Permite administrar pacientes, médicos, turnos y generar reportes. Está construido con React, Vite, TypeScript y Material-UI.

✨ Características
El frontend se conecta a una API backend para gestionar las siguientes entidades:

Dashboard: Página principal de la aplicación.

Gestión de Pacientes: Crear, leer, actualizar y eliminar pacientes.

Gestión de Médicos: Listar y ver detalles de los médicos.

Gestión de Turnos: Agendar, leer, actualizar, cancelar turnos y eliminarlos de la tabla

Reportes: Generar reportes de turnos y de médicos.


🚀 Stack Tecnológico
Las principales tecnologías y librerías utilizadas en este proyecto son:

Framework/Librería: React 19, React DOM 19

Bundler: Vite

Lenguaje: TypeScript

Routing: React Router

Estilos:

Material-UI (MUI) con Emotion

Tailwind CSS

Lucide React (iconos)

Cliente HTTP: Axios

Grillas/Tablas: AG-Grid React

Gráficos: Recharts

Linting/Formato: ESLint, TypeScript-ESLint


🔧 Instalación
Clona el repositorio:

Bash

git clone https://URL-DEL-REPOSITORIO.git
cd clinica-frontend
Instala las dependencias del proyecto:

Bash

npm install
o

Bash

yarn install
⚙️ Configuración
El proyecto requiere una variable de entorno para saber la URL base de la API backend.

Crea un archivo .env en la raíz del proyecto.

Añade la siguiente variable:

Fragmento de código

VITE_BASE_URL="http://localhost:3000"
Ajusta la URL si tu backend corre en un puerto o dominio diferente.

📜 Scripts Disponibles
Puedes ejecutar los siguientes scripts desde la raíz del proyecto:

npm run dev Inicia el servidor de desarrollo de Vite en modo "watch".

npm run build Compila el proyecto de TypeScript y lo empaqueta para producción.

npm run lint Ejecuta ESLint para analizar el código en busca de errores y problemas de estilo.

npm run preview Inicia un servidor local para previsualizar la build de producción.

🔀 Rutas de la Aplicación
La aplicación utiliza react-router-dom para gestionar la navegación. Las rutas principales son:

/: Dashboard (página de inicio)

/pacientes: Página de gestión de pacientes

/medicos: Página de gestión de médicos

/turnos: Página para agendar turnos

/reportes: Página de reportes de turnos

/reportes/medicos: Página de reportes de médicos

🔌 Conexión con la API
Toda la lógica de comunicación con el backend está centralizada en src/services/api.ts. Este servicio utiliza axios y expone métodos para interactuar con los siguientes endpoints:

/patients

/doctors

/appointments

/medical-specialty

/medical-office

/reports/appointments

/reports/doctors
