import { ILocation } from '@types/index';

/**
 * Calcula la distancia entre dos ubicaciones usando la fórmula Haversine
 * @param loc1 Primera ubicación (latitud, longitud)
 * @param loc2 Segunda ubicación (latitud, longitud)
 * @returns Distancia en kilómetros
 */
export const calculateDistance = (loc1: ILocation, loc2: ILocation): number => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.latitude)) *
      Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convierte grados a radianes
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Formatea la distancia para mostrar al usuario
 * @param distanceKm Distancia en kilómetros
 * @returns Distancia formateada (ej: "5.2 km" o "250 m")
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Calcula el tiempo estimado de viaje
 * @param distanceKm Distancia en kilómetros
 * @param averageSpeedKmh Velocidad promedio en km/h (default: 40 km/h para ciudad)
 * @returns Tiempo en minutos
 */
export const calculateETA = (distanceKm: number, averageSpeedKmh: number = 40): number => {
  return Math.ceil((distanceKm / averageSpeedKmh) * 60);
};

/**
 * Formatea el ETA para mostrar al usuario
 */
export const formatETA = (minutes: number): string => {
  if (minutes < 1) {
    return '<1 min';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
