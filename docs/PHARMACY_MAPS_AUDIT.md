# Auditoría: Integración de Google Maps para Búsqueda de Farmacias

**Fecha**: 28 de Enero 2026
**Auditor**: Claude Code
**Estado**: CRÍTICO - Requiere mejora urgente

---

## 📋 RESUMEN EJECUTIVO

### Hallazgo Principal: ⚠️ IMPLEMENTACIÓN INCOMPLETA

Tu proyecto tiene una **arquitectura mixta e incompleta**:
1. **API Google Places**: ✅ Implementada (MapService.ts)
2. **API MINSAL (Chile)**: ✅ Implementada (PharmacyService.ts)
3. **Componente visual del mapa**: ❌ **FALTA** - No hay mapa renderizado

**Impacto**: La app busca farmacias pero **NO las muestra en un mapa visual**, solo en lista.

---

## 🔍 SITUACIÓN ACTUAL

### Servicios Implementados

#### 1. **MapService.ts** (Google Places API)
```typescript
// Usa Google Places Nearby Search API
https://maps.googleapis.com/maps/api/place/nearbysearch/json
```

**Estado**: ✅ Implementado pero **NO UTILIZADO EN PRODUCCIÓN**

**Problema**: Solo llamadas a API, sin componente visual de mapa.

**Costos**:
- Nearby Search: $7 por 1,000 solicitudes
- Place Details: $7 por 1,000 solicitudes
- Cada búsqueda = 2 llamadas (búsqueda + detalles)

#### 2. **PharmacyService.ts** (API MINSAL)
```typescript
// Usa API oficial de farmacias de Chile (MINSAL)
https://midas.minsal.cl/farmacia_v2/WS/getLocales.php
```

**Estado**: ✅ Implementado y **EN USO**

**Ventajas**:
- ✅ **COMPLETAMENTE GRATIS**
- ✅ Datos oficiales de farmacias de Chile
- ✅ Horarios de turno (24/7)
- ✅ Datos fiables y actualizados

**Desventajas**:
- Solo para Chile
- Menos detalles que Google Places

#### 3. **PharmacyMapScreen.tsx**
```typescript
// Pantalla que LISTA farmacias pero NO las muestra en mapa
Muestra: FlatList de farmacias
Falta: MapView visual
```

**Estado**: ⚠️ Incompleto

---

## 💰 ANÁLISIS DE COSTOS

### Google Maps JavaScript Maps API

| Operación | Costo | Frecuencia | Costo/Mes |
|-----------|-------|-----------|-----------|
| Nearby Search | $7/1000 | 100/día | $21 |
| Place Details | $7/1000 | 100/día | $21 |
| **TOTAL** | - | - | **~$42/mes** |

**Condiciones Free Tier**:
- ✅ $200 crédito gratis al mes
- ✅ Mapas web GRATIS
- ❌ SDK nativa de React Native NO está incluido

### MINSAL API (Chile)

| Operación | Costo | Frecuencia | Costo/Mes |
|-----------|-------|-----------|-----------|
| Todas | **GRATIS** | Ilimitado | **$0** |

**Condiciones**:
- ✅ Completamente gratis
- ✅ Sin límite de llamadas
- ✅ Datos oficiales de Chile

---

## 🎯 ANÁLISIS: ¿QUÉ ESTÁ BIEN Y QUÉ ESTÁ MAL?

### ✅ LO QUE ESTÁ BIEN

1. **Doble integración inteligente**
   - Google Places: Datos internacionales (si expandes)
   - MINSAL: Datos locales (Chile)

2. **Caching implementado**
   - Farmacias: Cache 7 días
   - Turnos: Cache 1 hora
   - Fallback: Usa cache incluso si API falla

3. **Cálculo de distancias**
   - Fórmula Haversine implementada correctamente
   - Ordena por distancia automáticamente

4. **API MINSAL gratuita**
   - Excelente decisión usar datos oficiales
   - No incurre costos

### ❌ LO QUE ESTÁ MAL

1. **Falta componente visual del mapa**
   - PharmacyMapScreen muestra LISTA, no MAPA
   - Usuario no ve puntos en el mapa
   - Experiencia UX pobre

2. **Google Maps API sin uso práctico**
   - MapService.ts está implementado pero NO se usa
   - Código muerto que genera confusión
   - Si se habilita, incurriría costos innecesarios

3. **Ninguna librería de mapas instalada**
   - react-native-maps: NO instalado
   - expo-maps: NO instalado
   - No hay forma de renderizar MapView

4. **Generación de URL maps sin usar**
   - `generateMapUrl()` crea URL de Google Maps
   - Usuario nunca lo ve (solo en console.log)

---

## 🏗️ ARQUITECTURA ACTUAL

```
PharmacyScreen (Usuario)
    ↓
PharmacyMapScreen.tsx (Pantalla)
    ├─ Intenta mostrar mapa
    └─ En realidad muestra: FlatList (lista)
        ↓
PharmacyService.ts (Lógica)
    ├─ fetchPharmacies()
    │  └─ MINSAL API ✅ GRATIS
    ├─ fetchOnDutyPharmacies()
    │  └─ MINSAL API ✅ GRATIS
    └─ getPharmaciesNearby()
        └─ Calcula distancia + ordena

MapService.ts (No usado)
    ├─ searchPharmaciesNearby()
    │  └─ Google Places API (pagado)
    └─ getPharmacyDetails()
        └─ Google Places API (pagado)
```

---

## ✅ RECOMENDACIONES

### Opción 1: RECOMENDADA - Usar MINSAL + Mapa Nativo (Mejor)

**Mantener**: MINSAL API (gratis)
**Agregar**: MapView con react-native-maps
**Eliminar**: MapService.ts (código muerto)
**Costo**: $0

```
Ventajas:
✅ Sin costo adicional
✅ Datos oficiales de Chile
✅ Mapa visual para usuario
✅ Mejor UX
✅ Caching inteligente
```

**Pasos**:
1. Instalar: `expo install react-native-maps`
2. Crear: MapComponent que renderice farmacias
3. Eliminar: MapService.ts (no usado)
4. Integrar: PharmacyService + MapView

---

### Opción 2: Google Places + Mapa Web (Más costoso)

**Mantener**: MapService.ts
**Agregar**: @react-native-google-maps/maps
**Eliminar**: No eliminar nada
**Costo**: ~$42/mes + costo SDK

```
Ventajas:
✅ Funciona en cualquier país
✅ Detalles más ricos

Desventajas:
❌ Costo mensual
❌ Requiere configuración API key
❌ Duplica datos con MINSAL
```

---

### Opción 3: MINSAL + MapBox (Balanceado)

**Mantener**: MINSAL API
**Agregar**: @react-native-mapbox-gl
**Eliminar**: MapService.ts
**Costo**: ~$5/mes (tier gratuito existe)

```
Ventajas:
✅ Bajo costo
✅ Mapas visualmente atractivos
✅ Datos MINSAL gratuitos
✅ Buena UX

Desventajas:
❌ Pequeño costo mensual
❌ Otra dependencia
```

---

## 🚀 PLAN DE ACCIÓN INMEDIATO

### FASE 1: Eliminar código muerto (1-2 horas)

```bash
# Opción A: Si vas a usar MINSAL + Mapa React Native
rm src/services/MapService.ts
rm src/components/PharmacyMapComponent.tsx (si existe)
```

### FASE 2: Instalar librería de mapas (1 hora)

```bash
# Opción recomendada
expo install react-native-maps

# O si prefieres MapBox
expo install @react-native-mapbox-gl/maps
```

### FASE 3: Crear componente MapView (3-4 horas)

```typescript
// src/components/PharmacyMapView.tsx
Renderizar:
- MapView con coordenadas
- Markers para cada farmacia
- InfoWindow en tap
- Círculo de radio búsqueda
```

### FASE 4: Integrar en PharmacyMapScreen (1 hora)

```typescript
// Reemplazar FlatList con MapView
// Mantener PharmacyService.ts sin cambios
// Mantener MINSAL API (gratis)
```

---

## 📊 COMPARACIÓN: ESTADO ACTUAL vs PROPUESTO

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| **Datos de Farmacias** | MINSAL (gratis) | MINSAL (gratis) ✅ |
| **Mapa Visual** | ❌ No | ✅ Sí (react-native-maps) |
| **Costo** | $0/mes | $0/mes ✅ |
| **UX** | Lista | Mapa interactivo ✅ |
| **Código Muerto** | MapService.ts | Eliminado ✅ |
| **Complejidad** | Bajo | Medio |

---

## 🎓 CONCLUSIÓN

### Veredicto: ARQUITECTURA CORRECTA, IMPLEMENTACIÓN INCOMPLETA

**Bien hecho**:
- ✅ Uso de MINSAL API (gratis y oficial)
- ✅ Caching inteligente
- ✅ Cálculos de distancia correctos

**Falta**:
- ❌ Componente visual del mapa
- ❌ MapService.ts no debería estar ahí
- ❌ Usuario no ve mapa, solo lista

**Recomendación urgente**:
Agregar componente MapView con react-native-maps + eliminar MapService.ts innecesario.

**Costo de implementar**: $0 (MINSAL sigue siendo gratis)

---

## 📎 ARCHIVOS RELEVANTES

| Archivo | Estado | Acción |
|---------|--------|--------|
| `src/services/MapService.ts` | No usado | ❌ ELIMINAR |
| `src/services/PharmacyService.ts` | Correcto | ✅ MANTENER |
| `src/screens/app/PharmacyMapScreen.tsx` | Incompleto | 🔧 MEJORAR (agregar MapView) |
| `src/components/PharmacyCard.tsx` | OK | ✅ MANTENER |
| `package.json` | Sin maps | 📦 AGREGAR react-native-maps |

---

## 🔗 REFERENCIAS

- **Google Maps Pricing**: https://developers.google.com/maps/billing-and-pricing
- **MINSAL Farmacias API**: https://midas.minsal.cl/farmacia_v2/WS/
- **react-native-maps**: https://github.com/react-native-maps/react-native-maps
- **Expo Maps**: https://docs.expo.dev/modules/expo-maps/

---

**Generado por**: Claude Code Audit
**Prioridad**: ALTA - Mejora UX user-facing
**Urgencia**: Implementar en próxima iteración
