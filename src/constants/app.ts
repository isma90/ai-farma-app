/**
 * Constantes globales de la aplicación
 */

// Versión de la app
export const APP_VERSION = '1.0.0';

// Límites y timeouts
export const DEFAULT_LOCATION_TIMEOUT = 10000; // 10 segundos
export const DEFAULT_API_TIMEOUT = 8000; // 8 segundos
export const DEFAULT_LOCATION_ACCURACY = 100; // metros
export const LOCATION_WATCH_THRESHOLD = 500; // metros

// Cache
export const PHARMACY_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días
export const ONDUTY_CACHE_DURATION = 60 * 60 * 1000; // 1 hora
export const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Distancias
export const MAX_PHARMACY_SEARCH_RADIUS_KM = 50;
export const DEFAULT_PHARMACY_SEARCH_RADIUS_KM = 5;
export const PHARMACY_SEARCH_RADIUS_OPTIONS = [5, 10, 25, 50];

// Notificaciones
export const DEFAULT_REMINDER_ADVANCE_MINUTES = 15;
export const MAX_REMINDERS_PER_MEDICATION = 3;

// Validación
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_MEDICATION_NAME_LENGTH = 100;
export const MAX_DOSAGE_LENGTH = 50;

// URLS
export const MINSAL_PHARMACIES_URL = 'https://midas.minsal.cl/farmacia_v2/WS/getLocales.php';
export const MINSAL_ONDUTY_URL = 'https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php';

// Colores
export const COLORS = {
  PRIMARY: '#2196F3',
  SECONDARY: '#FF9800',
  SUCCESS: '#4CAF50',
  ERROR: '#FF6B6B',
  WARNING: '#FBC02D',
  INFO: '#03A9F4',
  DARK_GRAY: '#333333',
  MEDIUM_GRAY: '#666666',
  LIGHT_GRAY: '#999999',
  BORDER_GRAY: '#CCCCCC',
  BACKGROUND: '#F5F5F5',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
};

// Estados de farmacias
export const PHARMACY_STATUS = {
  ON_DUTY: 'on_duty',
  CLOSED: 'closed',
  OPEN: 'open',
} as const;

// Frecuencias de medicamento
export const MEDICATION_FREQUENCIES = {
  ONCE: 'once',
  TWICE: 'twice',
  THRICE: 'thrice',
  CUSTOM: 'custom',
} as const;

// Requisitos de comida
export const MEAL_REQUIREMENTS = {
  FASTING: 'fasting',
  WITH_FOOD: 'with-food',
  ANY: 'any',
} as const;

// Idiomas soportados
export const SUPPORTED_LANGUAGES = {
  SPANISH: 'es',
  ENGLISH: 'en',
} as const;

// Temas soportados
export const SUPPORTED_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
