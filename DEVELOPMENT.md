# Development Guide

Guía de desarrollo para el proyecto AI Farma.

## Primeros Pasos

### 1. Configuración Inicial

```bash
# Clone el repositorio
git clone https://github.com/ai-farma/ai-farma-app.git
cd ai-farma-app

# Instale dependencias
npm install

# Configure las variables de entorno
cp .env.example .env
# Edite .env con sus credenciales de Firebase y Google Maps
```

### 2. Configurar Firebase (Ver FIREBASE_SETUP.md)

### 3. Ejecutar la App

```bash
# Inicie Expo
npm start

# En otra terminal, ejecute en iOS o Android
npm run ios
# o
npm run android
```

## Estructura del Proyecto

```
ai-farma-app/
├── src/
│   ├── App.tsx                 # Entrada principal
│   ├── components/             # Componentes reutilizables
│   ├── screens/               # Pantallas
│   │   ├── auth/             # Pantallas de autenticación
│   │   └── app/              # Pantallas principales
│   ├── navigation/            # Configuración de navegación
│   ├── services/              # Servicios (API, Auth, Location, etc)
│   ├── redux/                 # Estado global
│   │   ├── slices/
│   │   └── store.ts
│   ├── hooks/                 # Custom hooks
│   ├── utils/                 # Funciones utilitarias
│   ├── constants/             # Constantes
│   └── types/                 # Tipos TypeScript
├── docs/                      # Documentación
├── .env.example              # Variables de entorno template
├── app.json                  # Configuración de Expo
├── package.json              # Dependencias
├── tsconfig.json             # Configuración TypeScript
└── README.md
```

## Servicios Disponibles

### AuthService

```typescript
import { authService } from '@services/AuthService';

// Autenticación anónima
const user = await authService.signInAnonymously();

// Registro con email
const user = await authService.signUpWithEmail(email, password, displayName);

// Login
const user = await authService.signInWithEmail(email, password);

// Logout
await authService.signOut();

// Obtener usuario actual
const user = await authService.getCurrentUser();

// Verificar si es anónimo
const isAnon = authService.isCurrentUserAnonymous();
```

### LocationService

```typescript
import { locationService } from '@services/LocationService';

// Obtener ubicación actual
const location = await locationService.getLocation();
// { latitude: -33.8688, longitude: -151.2093, accuracy: 100 }

// Iniciar monitoreo de ubicación
await locationService.startLocationWatcher((location) => {
  console.log('Ubicación actualizada:', location);
});

// Calcular distancia entre dos puntos
const distance = locationService.calculateDistance(loc1, loc2); // en km

// Detener monitoreo
locationService.stopLocationWatcher();
```

### PharmacyService

```typescript
import { pharmacyService } from '@services/PharmacyService';

// Obtener todas las farmacias
const pharmacies = await pharmacyService.fetchPharmacies();

// Obtener farmacias de turno
const onDutyIds = await pharmacyService.fetchOnDutyPharmacies();

// Obtener farmacias cercanas a ubicación
const nearby = await pharmacyService.getPharmaciesNearby(location, 5); // 5km

// Buscar farmacia por nombre/dirección
const results = await pharmacyService.searchPharmacies('Ahumada');

// Obtener detalles de una farmacia
const pharmacy = await pharmacyService.getPharmacyById(id);
```

### MedicationService

```typescript
import { medicationService } from '@services/MedicationService';

// Crear medicamento
const medication = await medicationService.createMedication(userId, {
  medicationName: 'Paracetamol',
  dosage: '500mg',
  frequency: 'twice',
  times: ['08:00', '20:00'],
  startDate: new Date(),
});

// Obtener medicamentos del usuario
const medications = await medicationService.getMedications(userId);

// Actualizar medicamento
await medicationService.updateMedication(userId, medicationId, {
  dosage: '1000mg',
});

// Registrar que se tomó un medicamento
await medicationService.recordAdherence(userId, medicationId, true);

// Obtener medicamentos de hoy
const todaysMeds = await medicationService.getTodaysMedications(userId);

// Obtener estadísticas de adherencia
const stats = await medicationService.getAdherenceStats(userId, medicationId, 7);
// { taken: 5, total: 7, percentage: 71, days: 7 }
```

### NotificationService

```typescript
import { notificationService } from '@services/NotificationService';

// Solicitar permisos
const granted = await notificationService.requestPermissions();

// Programar recordatorio
await notificationService.scheduleReminder(medication, 15); // 15 minutos antes

// Mostrar notificación local
await notificationService.showLocalNotification(
  'Recordatorio',
  'Es hora de tomar tu medicamento'
);

// Cancelar recordatorio
await notificationService.cancelReminder(medicationId);

// Configurar manejador de notificaciones
notificationService.setupNotificationHandler((response) => {
  const { medicationId } = response.notification.request.content.data;
  // Marcar como tomado
});
```

### SyncService

```typescript
import { syncService } from '@services/SyncService';

// Agregar operación a cola de sincronización
await syncService.addToSyncQueue(
  userId,
  'CREATE',
  'medication',
  medicationId,
  { medicationName: 'Paracetamol', ... }
);

// Procesar cola
const result = await syncService.processSyncQueue(userId, (current, total) => {
  console.log(`Sincronizando ${current}/${total}`);
});

// Obtener tamaño de cola
const size = await syncService.getSyncQueueSize(userId);

// Verificar si hay pendencias
const hasPending = await syncService.hasPendingSync(userId);

// Limpiar cola
await syncService.clearSyncQueue(userId);
```

## Custom Hooks

### useUserLocation()

```typescript
import { useUserLocation } from '@hooks/useUserLocation';

export const MyComponent = () => {
  const {
    location,
    isLoading,
    error,
    getLocation,
    startWatching,
    stopWatching,
  } = useUserLocation(true); // true = auto-start

  return (
    <View>
      {location && <Text>Lat: {location.latitude}</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};
```

### usePharmacies()

```typescript
import { usePharmacies } from '@hooks/usePharmacies';

export const PharmacyList = () => {
  const {
    pharmacies,
    nearby,
    isLoading,
    error,
    searchPharmacies,
    getPharmaciesNearby,
  } = usePharmacies();

  return (
    <FlatList
      data={nearby}
      renderItem={({ item }) => <PharmacyCard pharmacy={item} />}
    />
  );
};
```

### useSyncQueue()

```typescript
import { useSyncQueue } from '@hooks/useSyncQueue';

export const SyncIndicator = () => {
  const {
    queueSize,
    isSyncing,
    syncProgress,
    processSyncQueue,
  } = useSyncQueue();

  return (
    <View>
      {queueSize > 0 && (
        <TouchableOpacity onPress={processSyncQueue}>
          <Text>
            Sincronizar {queueSize} items {isSyncing && `(${syncProgress.percentage}%)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

## Convenciones de Código

### TypeScript

- Usar `strict` mode
- Tipificar todos los parámetros y retornos
- Usar interfaces para tipos complejos (prefijo `I`)
- Usar `type` para tipos simples

```typescript
// ✅ Bien
interface IPharmacy {
  id: string;
  name: string;
  location: ILocation;
}

// ✅ Bien
type PharmacyStatus = 'open' | 'closed' | 'on-duty';

// ❌ Evitar
interface IData {}
type data = any;
```

### Naming

- **Componentes**: PascalCase
- **Funciones/variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase con prefijo `I`
- **Archivos**: camelCase para utilidades, PascalCase para componentes/screens

```typescript
// Archivos
src/screens/PharmacyListScreen.tsx          // PascalCase
src/hooks/useUserLocation.ts                // camelCase
src/utils/distanceUtils.ts                  // camelCase
src/services/LocationService.ts             // PascalCase
src/constants/app.ts                        // camelCase

// Código
const MAX_DISTANCE = 50;                    // UPPER_SNAKE_CASE
const userLocation = await getLocation();   // camelCase
interface IPharmacy {}                      // I + PascalCase
export const PharmacyCard = () => {};       // PascalCase para componentes
```

### Imports

- Usar rutas absolutas con `@/`:
  ```typescript
  import { authService } from '@services/AuthService';
  import { IPharmacy } from '@types/index';
  import { useUserLocation } from '@hooks/useUserLocation';
  ```

### Async/Await vs Promises

Preferir async/await:

```typescript
// ✅ Bien
const user = await authService.getCurrentUser();

// ❌ Evitar
authService.getCurrentUser().then(user => {});
```

## Testing

### Ejecutar Pruebas

```bash
npm test                    # Ejecutar una vez
npm run test:watch         # Modo watch
npm run test:coverage      # Con cobertura
```

### Escribir Tests

```typescript
// src/services/__tests__/LocationService.test.ts
import { locationService } from '@services/LocationService';

describe('LocationService', () => {
  it('should calculate distance between two points', () => {
    const loc1 = { latitude: 0, longitude: 0 };
    const loc2 = { latitude: 1, longitude: 1 };
    const distance = locationService.calculateDistance(loc1, loc2);
    expect(distance).toBeGreaterThan(0);
  });
});
```

## Debugging

### Usar React DevTools

```bash
# En terminal separada
npm install -g react-devtools
react-devtools
```

### Console Logging

```typescript
// Para desarrollo
console.log('Debug info:', data);

// Para errores
console.error('Error occurred:', error);

// Para warnings
console.warn('Warning:', message);
```

### Redux DevTools

```typescript
// Instalado automáticamente en desarrollo
// Accesible desde Flipper (herramienta de debugging de React Native)
```

## Commits

Seguir Conventional Commits:

```bash
# Feature nueva
git commit -m "feat(auth): agregar login con Google"

# Fix de bug
git commit -m "fix(location): corregir timeout de ubicación"

# Documentación
git commit -m "docs(setup): agregar instrucciones de Firebase"

# Refactoring
git commit -m "refactor(services): simplificar AuthService"

# Tests
git commit -m "test(location): agregar tests para cálculo de distancia"
```

## Performance Tips

1. **Lazy loading**: Cargar componentes bajo demanda
   ```typescript
   const PharmacyMap = React.lazy(() => import('./PharmacyMap'));
   ```

2. **Memoization**: Evitar re-renders innecesarios
   ```typescript
   export const PharmacyCard = React.memo(({ pharmacy }) => {
     return <View>...</View>;
   });
   ```

3. **AsyncStorage**: Cachear datos locales
   ```typescript
   const cached = await AsyncStorage.getItem('pharmacies');
   ```

4. **Virtual scrolling**: Para listas grandes
   ```typescript
   import { FlashList } from '@shopify/flash-list';
   ```

## Recursos

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Firebase React Native](https://rnfirebase.io/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
