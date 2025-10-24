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


export default function SidenavLinks(props: SidenavLinksProps) {
  return (
    <>
      <SidenavLink to="/" icon={<DashboardOutlinedIcon />} label="Inicio" onClick={props.handleClick} />
      <SidenavLink to="/turnos" icon={<CalendarMonthOutlinedIcon />} label="Agenda Turnos" onClick={props.handleClick} />
      <SidenavLink to="/pacientes" icon={<PeopleAltOutlinedIcon />} label="Pacientes" onClick={props.handleClick} />
      <SidenavLink to="/medicos" icon={<MedicalServicesOutlinedIcon />} label="Medicos" onClick={props.handleClick} />
    </>
  )
}