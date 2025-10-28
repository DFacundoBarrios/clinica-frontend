import * as React from "react";
import {
  AppBar, Avatar, Box, Divider, Drawer, IconButton, List, Menu, MenuItem, Toolbar, Typography, useMediaQuery
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import SidenavLinks from '../components/SidenavLinks.tsx';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const DRAWER_WIDTH = 280;

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  minHeight: "100dvh",
  background: theme.palette.mode === "light" ? "#eeeeeeff" : theme.palette.background.default,
}));

export default function AppLayout() {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => setMobileOpen((p) => !p);
  const handleClickSidenav = () => !mdUp ? handleDrawerToggle() : undefined;

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <LocalHospitalIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" fontWeight={700}>
          Clínica
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 1, flex: 1, overflow: "auto" }}>
        <List component="nav">
          <SidenavLinks handleClick={handleClickSidenav} />
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} UTN FRRa
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Barra Superior */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar sx={{ gap: 1 }}>
          {!mdUp && (
            <IconButton edge="start" aria-label="open drawer" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 300, 
              letterSpacing: '1.5px', 
              textTransform: 'uppercase',
              color: 'text.primary' 
            }}
          >
            CLINICA RAFAELA
          </Typography>

          <Box sx={{ flex: 1 }} />

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>A</Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => setAnchorEl(null)}>Administradores(Ian - Facundo)</MenuItem>

          </Menu>
        </Toolbar>
      </AppBar>

      {/* Menú Lateral */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {mdUp ? (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
            open
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Contenido Principal */}
      <Main>
        <Toolbar />
        <Outlet />
      </Main>
    </Box>
  );
}