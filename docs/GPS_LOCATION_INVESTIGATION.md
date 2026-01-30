# 🔍 Investigación: Obtener Ubicación Simulada desde Expo Go

**Fecha**: 28 Enero 2026
**Status**: ✅ INVESTIGACIÓN COMPLETADA
**Conclusión**: SÍ ES POSIBLE - Bien documentado y soportado

---

## 📋 Resumen Ejecutivo

Expo Go **SÍ soporta ubicación simulada** del simulador/emulador a través de la librería `expo-location`. No requiere ninguna librería adicional ni cambios especiales en el código.

### ¿Cómo Funciona?

```
┌─────────────────────────────────────────┐
│ iOS Simulator / Android Emulator        │
│ (Simulas una ubicación manualmente)     │
└────────────────┬──────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│ expo-location.getCurrentPositionAsync() │
│ (Lee la ubicación simulada)             │
└────────────────┬──────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│ LocationService.getLocation()           │
│ (Retorna lat/lon reales)                │
└────────────────┬──────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│ PharmacyService.getPharmaciesNearby()   │
│ (Calcula distancia con coords reales)   │
└────────────────┬──────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│ UI: Farmacias ordenadas correctamente   │
└─────────────────────────────────────────┘
```

---

## 🔧 Configuración Requerida

### iOS Simulator

**Ubicación donde simular**:

1. Abre el Simulator de Xcode
2. Ve a: **Features** > **Location**
3. Selecciona una ubicación predefinida (Apple Park, Google, etc.)
   - O selecciona **Custom Location** para coordenadas específicas

**Ejemplo: Simular Chillán, Chile**:
```
Features > Location > Custom Location
Latitude: -36.6021
Longitude: -71.9451
```

Alternativa (en algunas versiones):
```
Debug > Location > Custom Location
```

### Android Emulator

**Ubicación donde simular**:

1. Abre Android Emulator (AVD)
2. En la barra de herramientas del emulador, haz clic en **⋯ (More)**
3. Ve a la pestaña **Location**
4. Ingresa Latitude y Longitude
5. Haz clic en **Send** o **Add**

**Ejemplo: Simular Chillán, Chile**:
```
Latitude: -36.6021
Longitude: -71.9451
Send / Add
```

**IMPORTANTE para Android 12+**:
```
Settings > Location > Location Services > Google Location Accuracy
→ Desactiva "Improve Location Accuracy"

Esto desactiva Wi-Fi location para usar solo GPS simulado.
```

---

## 💻 Implementación Técnica

### Librería Requerida

Ya instalada en el proyecto:

```bash
expo-location
```

### Código Necesario

Reemplazar en `src/services/LocationService.ts`:

```typescript
import * as Location from 'expo-location';

class LocationService {
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[LocationService] Error requesting permission:', error);
      return false;
    }
  }

  async getLocation(): Promise<ILocation> {
    try {
      // Solicitar permiso si no lo tenemos
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        console.warn('[LocationService] Location permission denied, using default');
        return DEFAULT_LOCATION;
      }

      // Obtener ubicación actual (soporta ubicación simulada)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const result: ILocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      this.lastLocation = result;
      await this.cacheLocation(result);

      console.log('[LocationService] Got real location:', result);
      return result;
    } catch (error) {
      console.error('[LocationService] Error getting location, using default:', error);
      return DEFAULT_LOCATION;
    }
  }

  // ... resto del código sin cambios
}
```

### Flujo de Datos

1. **Usuario simula ubicación** en iOS Simulator/Android Emulator
2. **getCurrentPositionAsync()** lee la ubicación simulada
3. **LocationService** retorna las coordenadas reales
4. **PharmacyService** calcula distancia a todas las farmacias
5. **UI** muestra farmacias ordenadas correctamente

---

## ✅ Ventajas de Esta Implementación

| Aspecto | Beneficio |
|--------|-----------|
| **Soporte nativo** | Expo Go lo soporta sin configuración especial |
| **Simuladores** | iOS Simulator y Android Emulator ambos funcionar |
| **Sin dependencias adicionales** | Ya está en `expo-location` |
| **Permisos simples** | Solo solicita ForegroundPermission |
| **Fácil testing** | Cambiar ubicación en segundos |
| **Ubicación real** | Si se ejecuta en dispositivo real, obtiene GPS real |
| **Fallback automático** | Si falla, usa DEFAULT_LOCATION |

---

## ⚠️ Limitaciones Conocidas

### 1. **Expo Go en Dispositivos Reales**
- **NO puede simular ubicación** en Expo Go en dispositivos reales
- Requiere development build (`eas build --platform ios --profile preview`)
- Razón: iOS y Android no permiten mock location en apps de terceros

### 2. **Android - Problema Potencial**
- En algunos Android devices, `getCurrentPositionAsync()` puede **colgarse indefinidamente**
- Solución: Usar `getLastKnownPositionAsync()` como fallback
- O usar watchPositionAsync() para continuous updates

### 3. **iOS - Permisos**
- Requiere permiso `NSLocationWhenInUseUsageDescription` en Info.plist
- Expo maneja esto automáticamente

### 4. **Precisión**
- Simuladores dan coordenadas exactas (no hay variación GPS)
- Dispositivos reales tienen ±5-20 metros de variación

---

## 🧪 Pruebas Recomendadas

### Test 1: iOS Simulator
```
1. Abre Simulator
2. Features > Location > Custom Location
3. Ingresa: -36.6021, -71.9451 (Chillán)
4. Abre la app → Farmacias
5. Verifica console:
   [LocationService] Got real location: {latitude: -36.6021, longitude: -71.9451}
6. Verifica TOP 10 CLOSEST PHARMACIES en console
7. Primera farmacia debe ser cercana a Chillán
```

### Test 2: Android Emulator
```
1. Abre Android Emulator
2. Haz clic en ⋯ (More)
3. Ve a Location tab
4. Latitude: -36.6021
5. Longitude: -71.9451
6. Haz clic Send/Add
7. Abre la app → Farmacias
8. Verifica console (mismo que Test 1)
```

### Test 3: Cambiar Ubicación en Vivo
```
1. App abierta en Farmacias
2. Cambiar ubicación en Simulator/Emulator
3. Cerrar y abrir la sección de Farmacias
4. Las farmacias mostradas deben cambiar
5. TOP 10 debe corresponder a nueva ubicación
```

---

## 📊 Comparación: DEFAULT_LOCATION vs GPS Real

| Característica | DEFAULT_LOCATION (Actual) | GPS Real (Propuesto) |
|--------|---|---|
| **Ubicación** | Chillán (-36.6021, -71.9451) | La del simulador/dispositivo |
| **Configuración** | Código estático | Simulador/dispositivo |
| **Testing** | Limitado a Chillán | Cualquier ubicación |
| **Dispositivo real** | Sigue mostrando Chillán | Muestra ubicación real |
| **Cambios dinámicos** | No soporta | Soporta cambios en tiempo real |
| **Complejidad** | Muy simple | Simple (una función) |

---

## 🚀 Recomendación Final

**IMPLEMENTAR**: Reemplazar LocationService para obtener GPS real

### Razones:

1. ✅ **Completamente soportado** en Expo Go
2. ✅ **Sin dependencias nuevas** (ya está expo-location)
3. ✅ **Fallback seguro** a DEFAULT_LOCATION si falla
4. ✅ **Más realista** para testing
5. ✅ **Funciona en dispositivo real** (no solo simulador)
6. ✅ **Fácil de cambiar ubicación** en Simulator/Emulator
7. ✅ **Verifiable en console** con logs

### Cambios Necesarios:

**Solo archivo**: `src/services/LocationService.ts`

- Cambio de ~30 líneas
- 1 método nuevo: `requestLocationPermission()`
- 1 método modificado: `getLocation()`
- Resto del código: sin cambios

### Tiempo Estimado:
- Implementación: ~10 minutos
- Testing: ~5 minutos
- Total: ~15 minutos

---

## 📚 Referencias

- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [iOS Simulator Location Testing](https://spin.atomicobject.com/current-location-expo-react-native/)
- [Android Emulator Location Setup](https://coffey.codes/articles/building-location-based-features-using-expo-location/)
- [GitHub Issue: Mock Location Detection](https://github.com/expo/expo/issues/24856)

---

## ✨ Conclusión

**SÍ SE PUEDE IMPLEMENTAR**

La investigación demuestra que:
1. Expo Go soporta ubicación simulada del simulador
2. `expo-location` está completamente funcional
3. Los simuladores iOS y Android ambos permiten simular ubicación
4. La implementación es simple y directa
5. Hay fallback seguro a DEFAULT_LOCATION

**Próximo paso**: ¿Implementamos el cambio a LocationService?

---

**Investigado por**: Claude Code
**Fecha**: 28 Enero 2026
**Status**: ✅ LISTO PARA IMPLEMENTACIÓN
