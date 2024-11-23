import { NavLink } from "react-router-dom";

export const NavItem = ({ url, icon, name, state }) => {
  return (
      <NavLink className="navlink" to={url}>
        <i className={`menu-icon ico-${icon}`}></i>
        <span className="hidden md:block">{name}</span>
      </NavLink>
  );
}