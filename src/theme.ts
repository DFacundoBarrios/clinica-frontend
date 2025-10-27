
import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale'; 

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#00695c', // Un verde azulado (teal) oscuro para confianza
            light: '#439889',
            dark: '#003d33',
        },
        secondary: {
            main: '#0277bd', // Un azul sereno
            light: '#58a5f0',
            dark: '#004c8c',
        },
        background: {
            default: '#f4f6f8', // Un gris muy claro para el fondo
            paper: '#ffffff', // Blanco puro para las tarjetas y modales
        },
        text: {
            primary: '#1c1c1c', // Negro suave
            secondary: '#5a5a5a', // Gris para texto secundario
        },
        success: {
            main: '#2e7d32', // Verde para éxito
        },
        warning: {
            main: '#ed6c02', // Naranja para advertencias
        }
    },

    // Typography
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: '2.125rem',
            color: '#1c1c1c',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.25rem',
        }
    },

    // ✨ Estilos globales para componentes
    components: {
        // Aplicar un estilo "plano" y moderno a todas las tarjetas/papeles
        MuiPaper: {
            defaultProps: {
                elevation: 0, // Sin sombras por defecto
                variant: 'outlined', // Usar un borde sutil
            },
            styleOverrides: {
                root: {
                    borderRadius: 8, // Bordes redondeados consistentes
                },
            }
        },
        MuiCard: {
            defaultProps: {
                elevation: 0,
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            }
        },
        // Estilo de la barra superior
        MuiAppBar: {
            defaultProps: {
                elevation: 0, // Quitar sombra de la barra
                color: 'inherit',
            },
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff', // Fondo blanco para la barra superior
                    borderBottom: '1px solid #e0e0e0', // Borde sutil
                }
            }
        },
        // Botones
        MuiButton: {
            defaultProps: {
                disableElevation: true, // Botones planos
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none', // Sin MAYÚSCULAS
                    fontWeight: 600,
                },
                containedPrimary: {
                    color: '#ffffff', // Texto blanco en botones primarios
                }
            }
        },
        // Menú lateral
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: 'none', // Quitar el borde del menú lateral
                    backgroundColor: '#ffffff',
                }
            }
        },
        // Links del menú lateral
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '0 8px',
                    '&.Mui-selected': {
                        backgroundColor: '#00695c1a', // Fondo sutil para el ítem seleccionado
                        color: '#003d33',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: '#00695c26',
                        }
                    },
                    '&:hover': {
                        backgroundColor: '#f1f1f1',
                    }
                }
            }
        }
    }
}, esES); // 💡 Aplicar el idioma español (para fechas, paginación, etc.)

export default theme;