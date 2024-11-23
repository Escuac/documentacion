import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { addMonths, format } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// TODO: refactorizar usando date-fns
export const formatDate = (dateString, format = 'short') => {
  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error("Fecha no válida");
  }

  if (format === 'short') {
    // Formato corto (DD/MM/YY)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }); // "22/10/24"
  } else if (format === 'long') {
    // Formato largo (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else {
    throw new Error("Formato no soportado");
  }
};

export const getTodayDate = () => new Date().toISOString().split('T')[0];

export const calculateEndDate = (startDate) => {
  let nextMonth = addMonths(new Date(startDate), 1);

  // Formatear la fecha como 'YYYY-MM-DD'
  return format(nextMonth, 'yyyy-MM-dd');
};

export const calculateAge = (birthDate) => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const currentMonth = today.getMonth();
  const birthMonth = birth.getMonth();

  if (
      currentMonth < birthMonth || 
      (currentMonth === birthMonth && today.getDate() < birth.getDate())
  ) {
      age--;
  }

  return age;
}