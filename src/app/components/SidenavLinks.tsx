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
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      end // le dice a NavLink que solo se active con una coincidencia exacta de la URL.
      onClick={onClick}
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
      <SidenavLink to="/" icon={<DashboardOutlinedIcon />} label="INICIO" onClick={props.handleClick} />
      <SidenavLink to="/turnos" icon={<CalendarMonthOutlinedIcon />} label="AGENDA TURNOS" onClick={props.handleClick} />
      <SidenavLink to="/pacientes" icon={<PeopleAltOutlinedIcon />} label="PACIENTES" onClick={props.handleClick} />
      <SidenavLink to="/medicos" icon={<MedicalServicesOutlinedIcon />} label="MEDICOS" onClick={props.handleClick} />
      <SidenavLink to="/reportes" icon={<DashboardOutlinedIcon />} label="REPORTES DE TURNOS" onClick={props.handleClick} />
      <SidenavLink to="/reportes/medicos" icon={<DashboardOutlinedIcon />} label="REPORTES DE MEDICOS" onClick={props.handleClick} />
    </>
  )
}