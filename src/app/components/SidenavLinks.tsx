import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

const SidenavLink = ({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const selected = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      onClick={onClick}
      selected={selected}
      sx={{ borderRadius: 1, mb: 0.5 }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
};

interface SidenavLinksProps {
  handleClick: () => void;
}

/*
* Enlaces principales para el Gestor de Turnos.
*/
export default function SidenavLinks(props: SidenavLinksProps) {
  return (
    <>
      <SidenavLink to="/" icon={<DashboardOutlinedIcon />} label="HOME" onClick={props.handleClick} />
      <SidenavLink to="/turnos" icon={<CalendarMonthOutlinedIcon />} label="ABM TURNOS" onClick={props.handleClick} />
      <SidenavLink to="/pacientes" icon={<PeopleAltOutlinedIcon />} label="ABM PACIENTES" onClick={props.handleClick} />
      <SidenavLink to="/medicos" icon={<MedicalServicesOutlinedIcon />} label="ABM MEDICOS" onClick={props.handleClick} />
    </>
  )
}