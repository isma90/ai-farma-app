# 🧪 Testing: GPS Real + Cálculo de Distancias

**Fecha**: 28 Enero 2026
**Status**: ✅ LISTO PARA TESTING
**Objetivo**: Verificar que el cálculo de distancias funciona correctamente con ubicación real del simulador

---

## 🎯 Objetivo del Test

Verificar que la app:
1. ✅ Obtiene ubicación simulada del iOS Simulator o Android Emulator
2. ✅ Calcula distancia correctamente entre ubicación del usuario y cada farmacia
3. ✅ Ordena farmacias de cercana a lejana
4. ✅ Muestra TOP 10 CLOSEST PHARMACIES en console

---

## 📱 Test 1: iOS Simulator (10 minutos)

### Paso 1: Preparación
```bash
# Terminal 1: Inicia expo
npm start

# Selecciona: i (para iOS)
# Espera a que abra Simulator
```

### Paso 2: Configura Ubicación Simulada
```
Simulator (arriba) → Features → Location
→ Selecciona "Custom Location"
→ Ingresa:
   Latitude:  -36.6021
   Longitude: -71.9451
→ Click Send
```

### Paso 3: Abre Dev Menu
```
Simulator abierto con app cargando
Presiona: Cmd + D (Apple Command + D)
Deberías ver popup de Dev Menu
```

### Paso 4: Abre Console
```
Dev Menu aparece
→ Selecciona "Show Dev Menu"
→ Toca "Debug JavaScript" (puede llevar 30 segundos)
→ Se abrirá Chrome o Safari con DevTools
→ Abre la Console
```

### Paso 5: Navega a Farmacias y Observa Console

```
En la app:
1. Presiona "r" en terminal si es necesario para recargar
2. Ve a tab "Farmacias"
3. Popup: "Permitir acceso a ubicación?" → Toca "Permitir" / "Allow"
4. Mira la console

Deberías ver:
────────────────────────────────────────
[LocationService] Location permission: GRANTED
[LocationService] Got real location from GPS: {
  latitude: -36.6021,
  longitude: -71.9451,
  accuracy: 65.5
}

[PharmacyService] Getting pharmacies near location: -36.6021, -71.9451
[PharmacyService] Total pharmacies loaded: 2220
[PharmacyService] On-duty pharmacies count: 1200
[PharmacyService] ========== TOP 10 CLOSEST PHARMACIES ==========
1. FARMACIA XXXX - 0.85km (-36.6010, -71.9445) [TURNO 24h]
2. FARMACIA YYYY - 1.23km (-36.5950, -71.9500)
3. FARMACIA ZZZZ - 2.45km (-36.6100, -71.9400)
4. FARMACIA AAAA - 3.12km (-36.5890, -71.9450)
5. FARMACIA BBBB - 4.56km (-36.6200, -71.9350)
6. FARMACIA CCCC - 5.67km (-36.5800, -71.9400)
7. FARMACIA DDDD - 6.78km (-36.6300, -71.9500)
8. FARMACIA EEEE - 7.89km (-36.5700, -71.9300)
9. FARMACIA FFFF - 8.90km (-36.6400, -71.9200)
10. FARMACIA GGGG - 9.99km (-36.5600, -71.9600)
[PharmacyService] ===========================================
[PharmacyService] Total pharmacies with valid coordinates: 1950
────────────────────────────────────────
```

### Paso 6: Verificación Visual en UI
```
En la app (tab Farmacias):
✅ Lista de farmacias aparece
✅ Primera farmacia es la más cercana (~0.85km)
✅ Distancias aumentan hacia abajo
✅ Puedes scroll para ver más farmacias
✅ Cada farmacia muestra:
   - Nombre
   - Dirección
   - Distancia (0.85 km, 1.23 km, etc.)
   - Color diferenciado (azul si turno, rojo si regular)
✅ Botón "Cargar más" aparece abajo
```

### Paso 7: Test Cambio de Ubicación en Vivo

```
Mientras la app está abierta en Farmacias:

1. Ve a Simulator → Features → Location → Custom Location
2. Cambia coordenadas a Santiago:
   Latitude:  -33.8688
   Longitude: -71.5437
3. Click Send
4. Presiona 'r' en terminal expo (o cierra y abre Farmacias nuevamente)
5. Verifica que la consola muestre:
   [LocationService] Got real location from GPS: {
     latitude: -33.8688,
     longitude: -71.5437
   }
6. Verifica que TOP 10 CLOSEST PHARMACIES cambió
7. Ahora deberían ser farmacias de Santiago
```

---

## 🤖 Test 2: Android Emulator (10 minutos)

### Paso 1: Preparación
```bash
# Terminal 1: Inicia expo
npm start

# Selecciona: a (para Android)
# Espera a que abra Emulator
```

### Paso 2: Configura Ubicación Simulada
```
En Emulator:
1. Busca ⋯ (More options) en barra de herramientas
2. Haz click en ⋯
3. Selecciona "Location" tab
4. Ingresa:
   Latitude:  -36.6021
   Longitude: -71.9451
5. Haz click "Send" o "Add"
```

### Paso 3: Verificación Importante (Android 12+)
```
Si usas Android 12 o superior:
1. Settings > Location
2. Location Services > Google Location Accuracy
3. Desactiva "Improve Location Accuracy"

Esto desactiva Wi-Fi location para usar solo GPS simulado.
```

### Paso 4: Abre Dev Menu
```
Emulator abierto con app cargando
Presiona: Ctrl + M (Control + M)
Deberías ver popup de Dev Menu
```

### Paso 5: Abre Console
```
Dev Menu aparece
→ Toca "Debug JavaScript"
→ Se abrirá Chrome con DevTools
→ Abre la Console
```

### Paso 6: Navega a Farmacias
```
En la app:
1. Presiona 'r' en terminal si es necesario
2. Ve a tab "Farmacias"
3. Popup de permiso → Toca "Allow" / "Permitir"
4. Observa console

Deberías ver los mismos logs que en iOS:
[LocationService] Got real location from GPS: {latitude: -36.6021, ...}
[PharmacyService] TOP 10 CLOSEST PHARMACIES
...
```

### Paso 7: Test Cambio de Ubicación
```
Similar a iOS:
1. ⋯ > Location
2. Cambia a Santiago: -33.8688, -71.5437
3. Send
4. Recarga la app
5. Verifica console
```

---

## ✅ Checklist de Verificación

### Console Output

- [ ] `[LocationService] Location permission: GRANTED` aparece
- [ ] `[LocationService] Got real location from GPS:` muestra coordenadas correctas
- [ ] Las coordenadas mostradas coinciden con lo que simulaste
- [ ] `[PharmacyService] Getting pharmacies near location:` muestra mismas coords
- [ ] `Total pharmacies loaded: 2220` o similar número
- [ ] `[PharmacyService] TOP 10 CLOSEST PHARMACIES` aparece
- [ ] Las primeras distancias son pequeñas (< 2km)
- [ ] Las distancias aumentan hacia abajo (0.85 < 1.23 < 2.45 < ...)
- [ ] Cada farmacia muestra `km` con 2 decimales
- [ ] Algunas farmacias muestran `[TURNO 24h]`
- [ ] `Total pharmacies with valid coordinates: ~1950` aparece

### UI Visual

- [ ] Lista de farmacias carga correctamente
- [ ] Primera farmacia es la más cercana
- [ ] Cada farmacia muestra nombre, dirección, distancia
- [ ] Las distancias aumentan conforme bajas en la lista
- [ ] Distancias tienen 2 decimales (0.85, 1.23, etc.)
- [ ] Colores diferenciados (azul para turno, rojo para regular)
- [ ] Puedes scroll en la lista
- [ ] Botón "Cargar más" aparece al final
- [ ] Puedes tocar una farmacia para ver detalles

### Cambios Dinámicos

- [ ] Cambias ubicación en Simulator → TOP 10 cambió
- [ ] Farmacias mostradas corresponden a nueva ubicación
- [ ] Distancias se recalcularon correctamente
- [ ] Ningún error en console

---

## 🎯 Prueba Específica: Múltiples Ciudades

### Test A: Chillán
```
Simula: -36.6021, -71.9451
Espera: Farmacias cercanas a Chillán
Verifica: Primera farmacia < 2km
```

### Test B: Santiago
```
Simula: -33.8688, -71.5437
Espera: Farmacias cercanas a Santiago
Verifica: Primera farmacia < 1km (Santiago tiene más farmacias)
```

### Test C: Valparaíso
```
Simula: -33.0472, -71.6127
Espera: Farmacias cercanas a Valparaíso
Verifica: Primera farmacia < 3km
```

### Test D: Concepción
```
Simula: -36.8201, -73.0544
Espera: Farmacias cercanas a Concepción
Verifica: Primera farmacia < 2km
```

---

## 🧪 Test Edge Cases

### Test 1: Permiso Rechazado
```
1. Abre app
2. Popup de permiso → Toca "Deny" / "No Permitir"
3. Verifica que console muestra:
   [LocationService] Location permission: DENIED
   [LocationService] Using default location
4. Farmacias mostradas = Chillán (DEFAULT_LOCATION)
```

### Test 2: Recarga Rápida
```
1. Abierto en Farmacias
2. Presiona 'r' en terminal (reload rápido)
3. Verifica que mantiene ubicación anterior (caché)
4. Console muestra ubicación sin pedir permiso nuevamente
```

### Test 3: Cambio de Permiso
```
1. Abre app, niega permiso
2. Settings > App > Farmacias > Permissions > Location > Allow
3. Recarga app (presiona 'r')
4. Ahora debe obtener ubicación real
```

---

## 📊 Tabla de Distancias Esperadas

### Desde Chillán (-36.6021, -71.9451)

| Ubicación | Distancia Esperada | Notas |
|-----------|-------|-------|
| Centro Chillán | 0.5 - 2 km | Muy cercanas |
| Hualpén | 5 - 8 km | Cercano |
| Los Ángeles | 80 - 100 km | Lejano |
| Santiago | 350 km | Muy lejano (ciudad diferente) |

### Desde Santiago (-33.8688, -71.5437)

| Ubicación | Distancia Esperada |
|-----------|-------|
| Centro Santiago | 0 - 2 km |
| Puente Alto | 20 - 30 km |
| Valparaíso | 120 km |
| Chillán | 350 km |

---

## 🚨 Troubleshooting

### "Location permission: DENIED"
```
Solución:
1. Toca "Allow" en popup
2. Si ya pasó, ve a:
   - iOS: Settings > [App] > Location > Allow
   - Android: Settings > Apps > [App] > Permissions > Location > Allow
3. Recarga app
```

### "Using default location"
```
Solución:
1. Verifica que Simulator tiene ubicación simulada
2. Verifica que diste permiso
3. Recarga app (presiona 'r')
```

### TOP 10 no se ve en console
```
Solución:
1. Abre Dev Menu (Cmd+D iOS, Ctrl+M Android)
2. Selecciona "Show Dev Menu"
3. Toca "Debug JavaScript"
4. Abre Console en DevTools
5. Busca: [PharmacyService]
```

### Ubicación no cambió después de cambiar en Simulator
```
Solución:
1. Presiona 'r' en terminal para recargar app
2. O cierra app completamente y vuelve a abrir
3. El caché de 5 minutos puede estar activo
```

### "Cannot find module 'expo-location'"
```
Solución:
expo-location ya está instalado en el proyecto
Si error persiste:
npm install expo-location
```

---

## ✨ Resultado Esperado Final

Después de completar todos los tests, deberías tener:

✅ **Console Logs Correctos**:
- Ubicación real del simulator
- TOP 10 farmacias más cercanas
- Distancias en orden ascendente (cercana a lejana)
- Status de permisos

✅ **UI Funcionando**:
- Lista de farmacias cargada
- Distancias visibles
- Colores diferenciados
- Ordenamiento correcto

✅ **Dinámico**:
- Cambias ubicación → Farmacias cambian
- Farmacias corresponden a nueva ubicación
- Distancias se recalculan

✅ **Fallback**:
- Si rechazas permiso → Usa DEFAULT_LOCATION
- Si simulador no tiene ubicación → Usa DEFAULT_LOCATION
- Nunca hay crash

---

## 📝 Reporte de Testing

Usa este formato para documentar resultados:

```
TESTING REPORT
==============
Fecha: [hoy]
Tester: [tu nombre]
Device: [iOS Simulator / Android Emulator]
OS Version: [iOS 17.2 / Android 13, etc.]

Test Results:
─────────────
✅ Console output correcto
✅ Ubicación obtenida del simulator
✅ TOP 10 CLOSEST PHARMACIES visible
✅ Distancias en orden correcto
✅ UI muestra farmacias ordenadas
✅ Cambio de ubicación funciona
✅ Fallback a DEFAULT_LOCATION funciona

Issues Found:
─────────────
[Ninguno / Describe si hay problemas]

Conclusion:
───────────
✅ TESTING COMPLETADO EXITOSAMENTE
```

---

## 🎓 Lo Que Estamos Testeando

### 1. Integración GPS
- ¿Expo location obtiene ubicación simulada?
- ¿Se muestran coordenadas correctas en console?

### 2. Cálculo de Distancia
- ¿La fórmula Haversine calcula correctamente?
- ¿Las distancias tienen sentido geográfico?

### 3. Ordenamiento
- ¿Las farmacias están ordenadas de cercana a lejana?
- ¿La primera es realmente la más cercana?

### 4. Dinámico
- ¿La app responde a cambios de ubicación?
- ¿Recalcula distancias correctamente?

### 5. Robustez
- ¿Hay fallback si algo falla?
- ¿La app no crashea en casos de error?

---

## 🚀 Próximo Paso

Una vez completado el testing:

1. ✅ Testing completado exitosamente
2. ✅ Todos los checklist marcados
3. ✅ Console output correcto
4. ✅ UI funciona como esperado

**La implementación GPS está lista para producción.**

---

**Creado por**: Claude Code
**Fecha**: 28 Enero 2026
**Objetivo**: Verificar correctitud de GPS + cálculo de distancias
**Status**: ✅ LISTO PARA TESTING
