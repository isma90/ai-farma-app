# Project Context

## Purpose

Desarrollar una aplicación móvil multiplataforma (iOS/Android) que resuelva el problema de acceso a farmacias de turno en Chile durante emergencias nocturnas, integrando inteligencia artificial conversacional para:

1. **Localización inteligente de farmacias**: Mostrar farmacias abiertas según horario (diurno/nocturno) con geolocalización en tiempo real
2. **Asistente farmacéutico IA**: Proporcionar orientación sobre medicamentos recetados, incluyendo:
    - Optimización de horarios de toma para evitar interacciones
    - Información sobre medicamentos bioequivalentes (alternativas más económicas)
    - Alertas de combinaciones problemáticas
    - Simulación de efectos secundarios temporales
3. **Planificación de tratamientos**: Gestión automatizada de alarmas para adherencia terapéutica
4. **Navegación integrada**: Inicio directo de rutas hacia farmacias seleccionadas mediante Google Maps/Waze

### Objetivos principales:
- Reducir el tiempo de búsqueda de farmacias abiertas en emergencias
- Mejorar la adherencia y seguridad en tratamientos farmacológicos
- Democratizar el acceso a información sobre alternativas económicas de medicamentos
- Prevenir errores de automedicación y combinaciones peligrosas

## Tech Stack

### Frontend/Mobile
- **React Native** - Framework principal para desarrollo multiplataforma
- **TypeScript** - Lenguaje de programación principal
- **React Navigation** - Navegación entre pantallas
- **React Native Maps** - Visualización de mapas y geolocalización

### UI/UX
- **React Native Paper** - Componentes UI
- **Tailwind CSS (NativeWind)** - Estilos
- **React Native Gesture Handler** - Interacciones táctiles

### Estado y Datos
- **React Query (TanStack Query)** - Gestión de datos asíncronos y caché
- **Redux Toolkit** - Estado global de la aplicación
- **AsyncStorage** - Persistencia local de datos

### IA y Servicios Backend
- **OpenAI API** - Agente conversacional principal
- **Firebase** - Backend as a Service (autenticación, Firestore, Cloud Functions)
- **Axios** - Cliente HTTP para consumo de APIs

### Geolocalización y Mapas
- **React Native Geolocation Service** - Acceso a GPS del dispositivo
- **Google Maps API** - Geocodificación y cálculo de distancias
- **React Native Maps** - Renderizado de mapas
- **Linking API (React Native)** - Deep links a Google Maps/Waze

### Notificaciones y Alarmas
- **React Native Push Notifications** - Notificaciones locales/push
- **React Native Calendar Events** - Integración con calendario del dispositivo
- **React Native Local Notifications** - Alarmas programadas

### APIs Externas
- **API Farmacias Chile** - Listado completo de farmacias con direcciones "https://midas.minsal.cl/farmacia_v2/WS/getLocales.php" se puede obtener una vez y dejarlo cargado y actualizarse de forma batch una vez al día, para que no se consulte la API en cada momento, solo una vez al día y la aplicación trabaje con la información que tiene en un base de conocimiento interno
- **API Turnos Chile** - Farmacias de turno actualizadas diariamente "https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php" se puede obtener una vez y dejarlo cargado y actualizarse de forma batch una vez al día, para que no se consulte la API en cada momento, solo una vez al día y la aplicación trabaje con la información que tiene en un base de conocimiento interno
- **Google Maps Platform** - Geocoding, Directions, Places API
- **Waze Deep Links** - Navegación alternativa

### Testing
- **Jest** - Framework de testing
- **React Native Testing Library** - Testing de componentes
- **Detox** - Testing E2E
- **MSW (Mock Service Worker)** - Mocking de APIs

### DevOps
- necesito un script que me permita compilar la imagen para Android e IOS y subirla manualmente en modo developer al un movil.

## Project Conventions

### Code Style

#### General
- **Idioma**: Código en inglés (variables, funciones, comentarios), interfaz de usuario en español
- **Indentación**: 2 espacios
- **Line length**: Máximo 100 caracteres
- **Quotes**: Single quotes para strings, double quotes para JSX
- **Semicolons**: Obligatorios al final de cada statement

#### Naming Conventions
```typescript
// Components: PascalCase
export const PharmacyCard = () => { }

// Hooks: camelCase con prefijo 'use'
export const usePharmacyLocation = () => { }

// Constants: UPPER_SNAKE_CASE
export const MAX_PHARMACY_DISTANCE = 5000;

// Interfaces/Types: PascalCase con prefijo 'I' para interfaces
interface IPharmacy {
  id: string;
  name: string;
}

type PharmacyStatus = 'open' | 'closed' | 'on-duty';

// Functions: camelCase, verbos descriptivos
const calculateDistance = (point1, point2) => { }

// Files: kebab-case
// pharmacy-list.component.tsx
// use-pharmacy-search.hook.ts
```

#### Component Structure
```typescript
// 1. Imports externos
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. Imports internos
import { usePharmacyLocation } from '@/hooks';
import { PharmacyCard } from '@/components';

// 3. Types/Interfaces
interface PharmacyListProps {
  onPharmacySelect: (id: string) => void;
}

// 4. Component
export const PharmacyList: React.FC<PharmacyListProps> = ({ onPharmacySelect }) => {
  // 4.1 Hooks
  const { location, loading } = usePharmacyLocation();
  
  // 4.2 State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 4.3 Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 4.4 Handlers
  const handleSelect = (id: string) => {
    setSelectedId(id);
    onPharmacySelect(id);
  };
  
  // 4.5 Render helpers
  const renderItem = (item) => { };
  
  // 4.6 Return
  return (
    <View>
      {/* JSX */}
    </View>
  );
};
```

### Architecture Patterns

#### Estructura de Carpetas
```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes UI básicos
│   ├── pharmacy/        # Componentes específicos de farmacias
│   └── medication/      # Componentes de medicamentos
├── screens/             # Pantallas de la app
│   ├── home/
│   ├── chat/
│   ├── map/
│   └── medication-schedule/
├── hooks/               # Custom hooks
├── services/            # Servicios y lógica de negocio
│   ├── api/            # Clientes de APIs
│   ├── ai/             # Integración con Claude/OpenAI
│   └── geolocation/    # Servicios de ubicación
├── store/              # Estado global (Zustand/Redux)
├── types/              # Type definitions globales
├── utils/              # Funciones auxiliares
├── constants/          # Constantes de la aplicación
├── navigation/         # Configuración de navegación
└── config/            # Configuración general
```

#### Patrones de Diseño

**1. Separation of Concerns**
- Componentes solo para UI
- Hooks para lógica reutilizable
- Services para comunicación con APIs
- Store para estado global

**2. Composition over Inheritance**
```typescript
// Composición de componentes pequeños
<PharmacyCard>
  <PharmacyHeader />
  <PharmacyAddress />
  <PharmacyDistance />
  <PharmacyActions />
</PharmacyCard>
```

**3. Custom Hooks para Lógica Compartida**
```typescript
// hooks/use-pharmacy-search.ts
export const usePharmacySearch = () => {
  const { location } = useUserLocation();
  const { data, isLoading } = useQuery(['pharmacies', location], 
    () => fetchNearbyPharmacies(location)
  );
  
  return { pharmacies: data, loading: isLoading };
};
```

**4. Service Layer Pattern**
```typescript
// services/api/pharmacy-api.service.ts
export class PharmacyApiService {
  async getAll(): Promise<IPharmacy[]> { }
  async getOnDuty(): Promise<IPharmacy[]> { }
  async getNearby(location: ILocation): Promise<IPharmacy[]> { }
}
```

**5. Repository Pattern para IA**
```typescript
// services/ai/medication-advisor.service.ts
export class MedicationAdvisorService {
  constructor(private aiClient: ClaudeClient) {}
  
  async analyzePrescription(prescription: string): Promise<IAdvice> { }
  async checkInteractions(medications: IMedication[]): Promise<IWarning[]> { }
  async suggestSchedule(medications: IMedication[]): Promise<ISchedule> { }
}
```

### Testing Strategy

#### Niveles de Testing

**1. Unit Tests (70% cobertura)**
- Funciones puras en `utils/`
- Hooks personalizados
- Servicios de negocio
- Transformadores de datos

```typescript
// __tests__/utils/calculate-distance.test.ts
describe('calculateDistance', () => {
  it('should calculate correct distance between two points', () => {
    const result = calculateDistance(point1, point2);
    expect(result).toBeCloseTo(1500, 0);
  });
});
```

**2. Integration Tests (20% cobertura)**
- Flujos completos de componentes con hooks
- Integración con servicios mock
- Navegación entre pantallas

```typescript
// __tests__/integration/pharmacy-search.test.tsx
describe('Pharmacy Search Flow', () => {
  it('should display nearby pharmacies when location is available', async () => {
    const { getByText } = render(<PharmacySearchScreen />);
    await waitFor(() => {
      expect(getByText('Farmacia Cruz Verde')).toBeTruthy();
    });
  });
});
```

**3. E2E Tests (10% cobertura)**
- Flujos críticos de usuario
- Casos de uso completos end-to-end

```typescript
// e2e/critical-flows.test.ts
describe('Emergency Pharmacy Search', () => {
  it('should find and navigate to nearest on-duty pharmacy', async () => {
    await device.launchApp();
    await element(by.id('emergency-button')).tap();
    await waitFor(element(by.id('pharmacy-list')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('navigate-button-0')).tap();
  });
});
```

### Git Workflow

#### Branching Strategy (Git Flow modificado)

**Branches principales**
- `main` - Código en producción, siempre estable
- `develop` - Branch de integración para desarrollo

**Branches de soporte**
- `feature/*` - Nuevas funcionalidades
- `bugfix/*` - Corrección de bugs en develop
- `hotfix/*` - Corrección urgente en producción
- `release/*` - Preparación de releases

#### Nomenclatura de Branches
```
feature/pharmacy-map-integration
feature/ai-medication-scheduler
bugfix/pharmacy-distance-calculation
hotfix/crash-on-location-permission-denied
release/v1.2.0
```

#### Commit Conventions (Conventional Commits)

**Formato**: `<type>(<scope>): <subject>`

**Types**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, puntos y comas faltantes, etc.
- `refactor`: Refactorización de código
- `test`: Agregar o corregir tests
- `chore`: Cambios en build, dependencias, etc.
- `perf`: Mejoras de performance

**Ejemplos**:
```bash
feat(pharmacy): add real-time on-duty pharmacy filter
fix(geolocation): handle permission denied gracefully
docs(readme): update installation instructions
refactor(ai): extract medication analysis to separate service
test(pharmacy): add unit tests for distance calculation
chore(deps): upgrade react-native to 0.73
perf(map): optimize pharmacy marker rendering
```

## Domain Context

### Contexto del Sistema de Salud Chileno

#### Sistema de Farmacias de Turno
- **Regulación**: Establecido por el Ministerio de Salud de Chile (MINSAL)
- **Obligatoriedad**: Toda comuna debe tener al menos una farmacia disponible 24/7
- **Rotación**: El turno se asigna rotativamente entre farmacias registradas
- **Publicación**: El listado oficial se actualiza diariamente y debe estar disponible públicamente
- **Zonas rurales**: Pueden tener esquemas especiales con horarios reducidos

#### Medicamentos en Chile

**Clasificación**:
1. **Venta directa**: Sin receta médica requerida
2. **Receta simple**: Requiere receta, pero se puede dispensar en múltiples oportunidades
3. **Receta retenida**: La farmacia debe retener la receta
4. **Receta cheque**: Para psicotrópicos y estupefacientes (control estricto)

**Bioequivalencia**:
- Programa del ISP (Instituto de Salud Pública)
- Medicamentos genéricos que han demostrado equivalencia terapéutica
- Precio promedio 30-50% menor que marcas originales
- Base de datos oficial: www.ispch.cl/bioequivalencia
- Farmacéutico puede sugerir pero no sustituir sin autorización médica

**Interacciones Medicamentosas Comunes en Chile**:
- Anticoagulantes + AINEs
- ISRS + Tramadol (síndrome serotoninérgico)
- Anticonceptivos + antibióticos (reducción de eficacia)
- Estatinas + jugo de pomelo

### Terminología Específica

**Farmacéutica**:
- **POS (Punto de Venta)**: Farmacia física
- **QF (Químico Farmacéutico)**: Profesional a cargo
- **Magistral**: Preparación personalizada de medicamento
- **DAU (Dosis de Administración Única)**: Sistema hospitalario

**Médica**:
- **RAM (Reacción Adversa a Medicamentos)**: Efecto no deseado
- **AINES**: Antiinflamatorios No Esteroidales
- **ISRS**: Inhibidores Selectivos de la Recaptación de Serotonina
- **Vida media**: Tiempo que tarda en reducirse 50% de concentración plasmática

**Geográfica Chile**:
- **Regiones**: 16 regiones administrativas (Arica a Magallanes)
- **Comunas**: 346 unidades territoriales
- **RM (Región Metropolitana)**: Santiago y alrededor, ~40% población nacional
- **Zonas rurales**: Acceso limitado, pueden estar a >50km de farmacia más cercana

### Casos de Uso Principales

**Nocturno (2:00 AM)**:
```
Usuario: "Necesito ibuprofeno urgente"
Sistema: 
  1. Detecta horario nocturno
  2. Filtra solo farmacias de turno
  3. Calcula distancia desde ubicación actual
  4. Muestra las 3 más cercanas con ETA
  5. Ofrece iniciar navegación
```

**Receta Compleja**:
```
Usuario: *sube foto de receta con 4 medicamentos*
Sistema (IA):
  1. OCR de receta médica
  2. Identifica: Enalapril, Atorvastatina, Omeprazol, Aspirina
  3. Detecta interacción: Aspirina + Omeprazol (gastroprotección correcta)
  4. Sugiere horarios:
     - Enalapril: 8:00 (antes desayuno)
     - Atorvastatina: 22:00 (mayor eficacia nocturna)
     - Omeprazol: 7:30 (30 min antes desayuno)
     - Aspirina: 8:00 (con alimento)
  5. Ofrece bioequivalentes con ahorro estimado
  6. Configura alarmas automáticas
```

**Modo Viaje**:
```
Usuario: "Voy de Santiago a Valparaíso, necesito comprar medicamento"
Sistema:
  1. Detecta ruta mediante GPS tracking
  2. Identifica farmacias en ruta Ruta 68
  3. Prioriza las con menor desvío (max 2km)
  4. Muestra horarios (ej: "Abre 9:00, llegarás ~10:30")
```

### Regulaciones y Consideraciones Legales

#### Privacidad de Datos (Ley 19.628)
- Datos de salud son sensibles, requieren consentimiento explícito
- Almacenamiento debe ser cifrado
- Usuario tiene derecho a eliminar sus datos
- No compartir información médica con terceros sin autorización

#### Responsabilidad Profesional
- La app NO sustituye consulta médica
- Disclaimers obligatorios en:
    - Sugerencias de horarios
    - Alertas de interacciones
    - Información sobre bioequivalentes
- Debe recomendar consultar QF en caso de dudas

#### Publicidad de Medicamentos (Ley 20.724)
- No se puede promover venta de medicamentos de receta
- Información debe ser objetiva, no persuasiva
- No incluir precios de medicamentos de receta retenida

## Important Constraints

### Técnicas

#### Performance
- **Tiempo de respuesta IA**: Máximo 8 segundos para respuesta completa
- **Carga de mapa**: Máximo 3 segundos para renderizar 50 markers
- **Tamaño de app**: Máximo 50MB (descarga), 150MB (instalada)
- **Batería**: Uso de GPS en background limitado a 15 minutos
- **Offline**: Funcionalidades básicas deben funcionar sin internet:
    - Ver farmacias guardadas
    - Historial de medicamentos
    - Alarmas configuradas

#### Compatibilidad
- **Android**: Mínimo API 23 (Android 6.0) - 95% de dispositivos
- **iOS**: Mínimo iOS 13 - 98% de dispositivos activos
- **Resoluciones**: Desde 320x568 (iPhone SE) hasta tablets

#### Limitaciones de APIs Externas
- **API Farmacias Chile**:
    - Rate limit: 100 requests/minuto
    - Actualización: Diaria a las 00:00 CLT
    - Sin garantía de tiempo de uptime
- **API Turnos**:
    - Rate limit: 50 requests/minuto
    - Cache requerido mínimo 1 hora
- **Google Maps API**:
    - Límite gratuito: 28,000 cargas de mapa/mes
    - Costo posterior: $7 USD por 1000 requests adicionales
- **OpenAI API**:
    - Rate limits según tier contratado
    - Costo por token (input/output)
    - Latencia promedio 2-5 segundos

### Regulatorias

#### MINSAL (Ministerio de Salud)
- No se puede **diagnosticar** enfermedades
- No se puede **recetar** medicamentos
- Solo se puede **informar** sobre medicamentos autorizados por ISP
- Debe incluir advertencia: "Esta aplicación no reemplaza la atención médica profesional"

#### Protección de Datos Personales
- Consentimiento explícito para:
    - Geolocalización (cada sesión)
    - Almacenar información de medicamentos
    - Crear alarmas en calendario
- Derecho a olvido: Usuario puede eliminar todo su historial
- Datos de salud no se pueden usar para marketing
- No vender datos a terceros

#### Accesibilidad
- Cumplir con WCAG 2.1 AA mínimo
- Soporte para VoiceOver (iOS) y TalkBack (Android)
- Tamaños de fuente ajustables
- Alto contraste para usuarios con baja visión

### Negocio

#### Restricciones Éticas
- No manipular orden de resultados por pago de farmacias
- No recomendar bioequivalente si no hay evidencia científica
- No enviar notificaciones promocionales de medicamentos
- Transparencia total sobre cómo funciona la IA
- La IA debe contestar solo información relacionada con medicamentos y farmacias, toda otra información que sea consultada debe ser rechazada indicando el tipo de temas e información a las cuales si puede responder.

### Operacionales

#### Mantenimiento
- Actualización de base de datos de farmacias: Mínimo semanal
- Monitoreo 24/7 de disponibilidad de APIs críticas
- Tiempo de respuesta ante fallas críticas: Máximo 2 horas

#### Soporte
- Horario de soporte: 8:00-22:00 CLT (días hábiles)
- Canal principal: In-app chat o email
- SLA de respuesta: 24 horas laborales
- Escalamiento a QF profesional para consultas complejas

#### Escalabilidad
- Infraestructura debe soportar:
    - 10,000 usuarios concurrentes
    - 1 millón de requests/día a APIs
    - 100,000 interacciones con IA/día
- Plan de crecimiento para 500k usuarios en primer año

## External Dependencies

### APIs Críticas

#### 1. API Farmacias Chile (Primaria)
- **URL Base**: `https://api.farmacias.cl/v1/` (ejemplo, confirmar URL real)
- **Autenticación**: API Key en header `X-API-Key`
- **Endpoints**:
  ```
  GET /farmacias - Lista todas las farmacias
  GET /farmacias/{id} - Detalle de farmacia
  GET /farmacias/region/{region_id} - Farmacias por región
  ```
- **Rate Limit**: 100 req/min
- **Formato**: JSON
- **Campos clave**: id, nombre, direccion, comuna, region, lat, lng, telefono, horario
- **Actualización**: Base de datos se actualiza semanalmente
- **SLA**: No garantizado (servicio público)
- **Fallback**: Cache local de 7 días

#### 2. API Turnos Farmacias Chile
- **URL Base**: `https://api.turnosfarmacias.cl/v1/` (ejemplo)
- **Autenticación**: Sin autenticación (público)
- **Endpoints**:
  ```
  GET /turnos/hoy - Farmacias de turno del día actual
  GET /turnos/fecha/{YYYY-MM-DD} - Farmacias de turno por fecha
  GET /turnos/comuna/{comuna_id} - Turnos filtrados por comuna
  ```
- **Rate Limit**: 50 req/min
- **Actualización**: Diaria 00:00 CLT
- **Cache requerido**: Mínimo 1 hora
- **Fallback**: Mostrar aviso "Información puede estar desactualizada"

#### 3. Google Maps Platform
**3.1 Maps SDK (Mobile)**
- **Documentación**: https://developers.google.com/maps/documentation/android-sdk
- **API Keys**: Separadas para Android/iOS en Google Cloud Console
- **Funcionalidades**:
    - Renderizado de mapa
    - Markers de farmacias
    - Custom info windows
- **Límite gratuito**: 28,000 dynamic map loads/mes
- **Costo excedente**: $7 USD / 1000 loads

**3.2 Geocoding API**
- **Endpoint**: `https://maps.googleapis.com/maps/api/geocode/json`
- **Uso**: Convertir direcciones de farmacias a coordenadas
- **Límite**: 40,000 requests/mes gratis
- **Cache**: Obligatorio por ToS (cachear resultados)

**3.3 Directions API**
- **Endpoint**: `https://maps.googleapis.com/maps/api/directions/json`
- **Uso**: Calcular rutas y distancias
- **Límite**: 40,000 requests/mes gratis
- **Optimización**: Usar Distance Matrix para múltiples destinos

**3.4 Places API**
- **Uso**: Información adicional de farmacias (fotos, reviews, horarios)
- **Opcional**: Para enriquecer datos
- **Límite**: 28,000 requests/mes gratis

#### 4. ISP Chile - Base de Datos Bioequivalentes
- **URL**: `https://www.ispch.cl/bioequivalencia` (web scraping o API si disponible)
- **Tipo**: Posiblemente scraping de sitio público o solicitar API oficial
- **Datos**:
    - Principio activo
    - Nombre comercial
    - Laboratorio
    - Estado de bioequivalencia
- **Actualización**: Mensual
- **Estrategia**:
    - Scrapear y almacenar en base de datos propia
    - Actualizar semanalmente en background
- **Legal**: Verificar términos de uso de datos públicos ISP

### Servicios de Infraestructura

#### Firebase (Backend as a Service)
**Firebase Authentication**
- Auth anónima para usuarios sin registro
- Auth con email/Google/Apple para usuarios con cuenta
- Gestión de sesiones

**Cloud Firestore**
- Almacenar:
    - Perfiles de usuario
    - Historial de medicamentos
    - Alarmas programadas
    - Farmacias favoritas
- Estructura:
  ```
  users/{userId}/
    ├── profile
    ├── medications/
    ├── alarms/
    └── favorites/
  ```

**Cloud Functions**
- Actualización scheduled de farmacias de turno
- Envío de notificaciones de alarmas
- Procesamiento de imágenes de recetas (OCR)
- Rate limiting de requests a APIs externas

**Firebase Cloud Messaging (FCM)**
- Push notifications para alarmas
- Alertas de interacciones si usuario agrega nuevo medicamento

**Firebase Analytics**
- Tracking de eventos clave:
    - Búsquedas de farmacias
    - Uso de chat IA
    - Navegación a farmacias
    - Configuración de alarmas

**Firebase Crashlytics**
- Monitoreo de crashes en producción
- Reportes de errores no fatales

#### Sentry
- Monitoreo de errores en tiempo real
- Source maps para stack traces legibles
- Performance monitoring
- Release tracking

### Servicios de Navegación

#### Deep Links
**Google Maps**
```
https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=driving
```

**Waze**
```
https://waze.com/ul?ll={lat},{lng}&navigate=yes
```

**Apple Maps (iOS)**
```
http://maps.apple.com/?daddr={lat},{lng}&dirflg=d
```