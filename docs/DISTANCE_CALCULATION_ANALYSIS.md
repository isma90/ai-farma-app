# 📊 Análisis: Cálculo de Distancias - Línea Recta vs Ruta Real

**Fecha**: 28 Enero 2026
**Status**: ✅ ANÁLISIS COMPLETADO
**Conclusión**: Necesitas Google Maps Distance Matrix API para distancias de ruta real

---

## 🔍 El Problema Identificado

Observaste una **diferencia significativa** entre:
- ✗ App mostrando: **52 km** (más cercana)
- ✓ Google Maps web mostrando: **74 km**

**Razón**: La app calcula **línea recta (geodésica)**, Google Maps calcula **ruta real por carreteras**.

---

## 📐 Cómo Funciona Actualmente

### Fórmula Haversine (Línea Recta)

```
Punto A (Usuario):        -36.6021, -71.9451
Punto B (Farmacia):       -36.5900, -71.9500

Cálculo:
└─ Distancia línea recta entre A y B
└─ Como si volaras en línea recta
└─ Ignora carreteras, montañas, desviaciones

Resultado: 52 km
```

### Visualización

```
        A (Chillán)
        │
        │  52 km (línea recta - HAVERSINE)
        │  ↓
        └─────────── B (Farmacia)

Vs.

        A (Chillán)
        │
        ├─→ (carretera norte)
        │
        ├─→ (carretera este)
        │
        ├─→ (carretera sur)
        │
        └─────── B (Farmacia)

        74 km (ruta real - GOOGLE MAPS)
```

---

## 🗺️ Por Qué Haversine Está Incorrecto para Este Caso

Haversine **SÍ es correcto** para:
- ✅ Cálculos aproximados rápidos
- ✅ Aplicaciones donde precisión no importa
- ✅ Casos sin necesidad de rutas reales

Haversine **NO es correcto** para:
- ❌ Servicio de farmacias (usuario necesita distancia real de viaje)
- ❌ Comparar con Google Maps (da resultados muy diferentes)
- ❌ Ordenamiento importante (el ranking cambia)

**En tu caso**: El ranking de farmacias podría ser **completamente diferente** si usas distancia de ruta real vs línea recta.

---

## 💡 Solución: Google Maps Distance Matrix API

### Opción 1: Google Maps Distance Matrix API (Recomendado)

**¿Qué es?**
- API oficial de Google Maps
- Calcula distancia/tiempo de ruta REAL
- Considerando carreteras, tráfico, etc.

**Ventajas:**
- ✅ Distancia exacta de ruta
- ✅ Tiempo de viaje real
- ✅ Soporte para múltiples modos (auto, bici, a pie, transporte)
- ✅ Información de tráfico (con fee adicional)
- ✅ Oficial y confiable

**Desventajas:**
- ❌ Requiere API Key
- ❌ Costo por solicitud
- ❌ Limitaciones de cuota
- ❌ Requiere conexión a internet

**Precio:**
- 10,000 llamadas GRATIS por mes
- Después: $0.005 - $0.010 USD por elemento
- Para 2220 farmacias por cálculo = ~$11 USD
- Si usuarios buscan 100 veces/mes = $1,100 USD/mes

### Opción 2: Alternativa Open Source (Más Barato)

**OpenRouteService** o **OSRM** (Open Source Routing Machine)
- Costo: Self-hosted (gratis) o SaaS ($0.002-0.003 por request)
- Datos de OpenStreetMap
- Menos preciso que Google Maps
- Buena alternativa si presupuesto es limitado

### Opción 3: Híbrido (Mejor Relación Costo/Beneficio)

1. Usa Haversine para ordenamiento inicial
2. Una vez que usuario selecciona una farmacia, calcula ruta real con Google Maps
3. Muestra solo la distancia real para la farmacia seleccionada

---

## 📊 Comparación de Métodos

| Característica | Haversine (Actual) | Google Maps API | OSRM |
|---|---|---|---|
| **Precisión** | Baja (línea recta) | Muy alta | Alta |
| **Velocidad** | Instantáneo | 200-500ms por request | 200-500ms |
| **Costo** | $0 | $0.005-0.01/elemento | $0.002-0.003/elemento |
| **Configuración** | Nada | API Key requerida | Self-hosted o SaaS |
| **Confiabilidad** | Alta (local) | Muy alta (Google) | Media-alta |
| **Distancia Real** | ❌ No | ✅ Sí | ✅ Sí |
| **Tiempo Viaje** | ❌ No | ✅ Sí | ✅ Sí |
| **Tráfico** | ❌ No | ✅ Sí (fee extra) | Sí (fee extra) |
| **Offline** | ✅ Sí | ❌ No | Sí |

---

## 🎯 Recomendación

### Opción A: Corto Plazo (Rápido)
**Implementar Google Maps Distance Matrix API**

```
✅ Ventajas:
  - Distancia exacta de ruta
  - Fácil implementación (~2 horas)
  - Confiable y oficial
  - Usuario ve distancia correcta

⚠️ Costo:
  - 10,000 gratis/mes
  - Después: ~$0.005 por farmacia
  - Para 2220 farmacias: ~$11 USD por búsqueda
  - Si 100 búsquedas/mes: ~$1,100/mes

💡 Optimización:
  - Caché de distancias (24 horas)
  - Solo calcular top 50 farmacias más cercanas (Haversine)
  - Luego refinar con Google Maps API
  - Reduce costo a ~$0.25/búsqueda
```

### Opción B: Largo Plazo (Barato)
**Implementar OSRM auto-hospedado**

```
✅ Ventajas:
  - Costo bajo (solo hosting)
  - Control total
  - Offline posible

❌ Desventajas:
  - Requiere servidor propio
  - Menos preciso que Google Maps
  - Mantenimiento necesario
  - Datos de OpenStreetMap (no tan actualizados)
```

### Opción C: Híbrido (Mejor Ratio)
**Haversine + Google Maps Only en Detalles**

```
1. Usa Haversine para ordenamiento inicial (rápido, gratis)
2. Usuario abre farmacia seleccionada
3. Calcula ruta real con Google Maps API
4. Muestra distancia exacta solo para esa farmacia

Costo: ~$0.005 × 1 farmacia = muy bajo
Ventaja: Ordenamiento rápido + distancia exacta para seleccionada
```

---

## 🔧 Implementación: Google Maps Distance Matrix API

### Paso 1: Obtener API Key

```bash
1. Ve a https://console.cloud.google.com/
2. Crea nuevo proyecto
3. Habilita "Distance Matrix API"
4. Crea credential (API Key)
5. Copia la API Key
6. Restringe a "Distance Matrix API" solamente
```

### Paso 2: Agregar a .env

```
GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### Paso 3: Crear servicio de distancia

```typescript
// src/services/DistanceMatrixService.ts

import axios from 'axios';

interface DistanceResult {
  distance: number; // en metros
  duration: number; // en segundos
  text_distance: string;
  text_duration: string;
}

class DistanceMatrixService {
  private apiKey = process.env.GOOGLE_MAPS_API_KEY;
  private baseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  async getDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DistanceResult | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          mode,
          key: this.apiKey,
        },
      });

      const result = response.data.rows[0].elements[0];

      if (result.status === 'OK') {
        return {
          distance: result.distance.value, // metros
          duration: result.duration.value, // segundos
          text_distance: result.distance.text,
          text_duration: result.duration.text,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting distance:', error);
      return null;
    }
  }

  async getDistanceBatch(
    origin: { lat: number; lng: number },
    destinations: Array<{ lat: number; lng: number }>,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<DistanceResult[]> {
    try {
      const destString = destinations
        .map(d => `${d.lat},${d.lng}`)
        .join('|');

      const response = await axios.get(this.baseUrl, {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: destString,
          mode,
          key: this.apiKey,
        },
      });

      return response.data.rows[0].elements
        .map((el: any) => {
          if (el.status === 'OK') {
            return {
              distance: el.distance.value,
              duration: el.duration.value,
              text_distance: el.distance.text,
              text_duration: el.duration.text,
            };
          }
          return null;
        })
        .filter((x: any) => x !== null);
    } catch (error) {
      console.error('Error getting batch distances:', error);
      return [];
    }
  }
}

export const distanceMatrixService = new DistanceMatrixService();
```

### Paso 4: Usar en PharmacyService

```typescript
// En PharmacyService.getPharmaciesNearby()

// Paso 1: Usar Haversine para ordenamiento rápido
const pharmaciesWithDistance = pharmacies
  .map(p => ({
    ...p,
    distanceKm: locationService.calculateDistance(location, {
      latitude: p.latitud,
      longitude: p.longitud,
    }),
  }))
  .filter(p => p.distanceKm !== Infinity)
  .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

// Paso 2: Obtener distancias reales para top 50
const top50 = pharmaciesWithDistance.slice(0, 50);
const realDistances = await distanceMatrixService.getDistanceBatch(
  { lat: location.latitude, lng: location.longitude },
  top50.map(p => ({ lat: p.latitud, lng: p.longitud }))
);

// Paso 3: Reemplazar con distancias reales
const finalPharmacies = top50
  .map((p, idx) => ({
    ...p,
    distanceKm: (realDistances[idx]?.distance || 0) / 1000, // metros a km
    durationMinutes: (realDistances[idx]?.duration || 0) / 60, // segundos a minutos
  }))
  .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
```

---

## ⚠️ Consideraciones Importantes

### 1. Costo

```
Escenario 1: Todas las farmacias (2220)
  └─ 2220 × $0.005 = $11.10 por búsqueda
  └─ 100 búsquedas/mes = $1,110/mes ❌ CARO

Escenario 2: Solo top 50 (recomendado)
  └─ 50 × $0.005 = $0.25 por búsqueda
  └─ 100 búsquedas/mes = $25/mes ✅ BARATO

Escenario 3: Solo farmacia seleccionada
  └─ 1 × $0.005 = $0.005 por búsqueda
  └─ 100 búsquedas/mes = $0.50/mes ✅ MUY BARATO
```

### 2. Latencia

Google Maps API responde en 200-500ms:
- Haversine: <5ms (local)
- Google Maps: 200-500ms (red)

**Solución**: Usar Haversine primero para mostrar lista rápidamente, luego actualizar con distancias reales.

### 3. Cuota Gratis

```
10,000 llamadas gratis por mes
├─ Opción "top 50": 200 solicitudes = 10,000 elementos gratis
├─ Opción "seleccionada": 10,000 solicitudes = gratis
└─ Después: pagas $0.005 por elemento
```

---

## 🎯 Mi Recomendación

### Implementar Híbrido Optimizado:

```
1. Usa Haversine para ordenamiento inicial (RÁPIDO, GRATIS)
   └─ Muestra lista de "52 km, 48 km, 45 km..." (aproximado)

2. Calcula distancias reales para TOP 50 (PRECISO, BARATO)
   └─ Cuando app inicia o usuario busca
   └─ Costo: $0.25 por búsqueda
   └─ Reordena basado en distancia real

3. Muestra ambas distancias al usuario:
   └─ "Línea recta: 52 km"
   └─ "Ruta real: 74 km" ← La que importa

Ventajas:
✅ Ordenamiento exacto por ruta real
✅ Costo bajo ($0.25 por búsqueda)
✅ Rápido (usa Haversine primero)
✅ Transparente (muestra ambas)
```

---

## 📋 Decisión Necesaria

**¿Qué quieres hacer?**

1. **Opción A**: Mantener Haversine (línea recta)
   - Costo: $0
   - Problema: Incorrecto comparado con Google Maps

2. **Opción B**: Implementar Google Maps API
   - Costo: $0.25-$11 por búsqueda (según cantidad)
   - Ventaja: Distancia de ruta real y exacta
   - Tiempo: 2-3 horas de implementación

3. **Opción C**: Esperar/Investigar otra solución
   - Tiempo para decidir
   - Posible: OSRM, TravelTime API, etc.

---

## 🔗 Referencias

- [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/overview)
- [Pricing and Billing](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Fórmula Haversine vs Distancia de Ruta](https://en.wikipedia.org/wiki/Haversine_formula)
- [OSRM Alternative](http://project-osrm.org/)

---

## ✅ Conclusión

**El problema es real**: Haversine calcula línea recta, no ruta real.

**La solución existe**: Google Maps Distance Matrix API es la mejor opción.

**El costo es manejable**: $0.25 por búsqueda es razonable si lo optimizas.

**Recomendación**: Implementar distancia de ruta real con Google Maps API, mostrando top 50 farmacias para mantener costo bajo.

---

**Análisis realizado por**: Claude Code
**Fecha**: 28 Enero 2026
**Status**: ✅ ANÁLISIS COMPLETADO - ESPERANDO DECISIÓN DEL USUARIO
