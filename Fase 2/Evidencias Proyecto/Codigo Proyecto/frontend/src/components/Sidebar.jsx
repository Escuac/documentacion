import { NavItem } from "./NavItem";
import { Button } from "@/components/shadcn/button"
import { ExitIcon } from "@radix-ui/react-icons"
import { BASE_API_URL } from "@/constants"
export const Sidebar = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
  
      if (response.ok) {
        // Aquí puedes redirigir o realizar alguna acción, por ejemplo:
        window.location.href = '/'; // Redirige al login o donde quieras
      } else {
        console.error("Error al cerrar sesión", response.statusText);
      }
    } catch (error) {
      console.error("Error al hacer logout:", error);
    }
  };
  return (
    <div className="sidebar">
      <div className='text-2xl hidden md:block font-bold text-center mt-10 mb-10 '>ApoloSport</div>
      <nav>
        <ul>
          <p className="mb-4 hidden md:block text-muted-foreground font-semibold">General</p>
          <NavItem url="/" icon="dash" name="Dashboard" state="active" />
          <NavItem url="/alumno" icon="alumnos" name="Alumnos" />
          <NavItem url="/pago" icon="pago" name="Pagos" />
          <NavItem url="/medicion" icon="medicion" name="Mediciones" />
          {/* <NavItem url="/ingreso" icon="ingreso" name="Ingresos" /> */}
        </ul>
      </nav>

      <Button 
        className="mt-auto"
        onClick={handleLogout}
        >
        <ExitIcon className="md:mr-2 h-5 w-5" /> <span className="hidden md:block">Cerrar Sesión</span>
      </Button>

    </div>
  )
}