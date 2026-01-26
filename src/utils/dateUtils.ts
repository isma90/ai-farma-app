/**
 * Obtiene la fecha actual como string YYYY-MM-DD
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Convierte una fecha a string YYYY-MM-DD
 */
export const formatDateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Obtiene el nombre del día de la semana
 */
export const getDayName = (date: Date): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

/**
 * Formatea una fecha para mostrar al usuario (ej: "Lunes, 26 de enero")
 */
export const formatDateForDisplay = (date: Date): string => {
  const day = getDayName(date);
  const dayOfMonth = date.getDate();
  const monthNames = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const month = monthNames[date.getMonth()];

  return `${day}, ${dayOfMonth} de ${month}`;
};

/**
 * Compara dos fechas ignorando la hora
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const daysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

/**
 * Parsea un tiempo en formato HH:MM
 */
export const parseTime = (timeString: string): { hours: number; minutes: number } => {
  const [hoursStr, minutesStr] = timeString.split(':');
  return {
    hours: parseInt(hoursStr, 10),
    minutes: parseInt(minutesStr, 10),
  };
};

/**
 * Formatea un tiempo en minutos a HH:MM
 */
export const formatTime = (hours: number, minutes: number): string => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
