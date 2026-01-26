# Changelog - AI Farma App

Historial de cambios y mejoras en el proyecto AI Farma, ordenado de más reciente a más antiguo.

## 2026-01-26

### feat(complete-mvp): implement all missing phases (Pharmacy, Medications, Offline, AI Chat)

**Commits**: `e596bc9`, `bcb0819`, `bb82756`

Implementación completa de todas las funcionalidades faltantes del MVP (Fases 3-6):

#### Phase 3: Localizador de Farmacias
- Búsqueda y filtrado por radio, estado de turno
- Vista de lista con distancia en tiempo real
- Vista detallada con información de contacto
- Navegación a Maps/Waze, compartir, agregar favoritos

#### Phase 4: Gestión de Medicamentos
- Formulario completo para crear/editar medicamentos
- Vista detallada con calendario de adherencia
- Estadísticas de adherencia (%, tomadas, omitidas)
- Calendario interactivo para marcar medicamentos
- Recordatorios automáticos y gestión de notificaciones

#### Phase 5: Soporte Offline
- Indicador de sincronización con estado de la cola
- Botón de sincronización manual en Configuración
- Información de último sync y progreso

#### Phase 6: Chat de IA
- Interfaz completa de chat con burbujas de mensaje
- Detección de conexión offline
- Cargando estados durante respuestas
- Listo para integración con Claude/OpenAI en Phase 2

→ [Ver detalles completos](./changelog-2026-01-26-impl-completion.md)

**Impacto**: La aplicación ahora es completamente funcional para MVP. Todas las características principales están implementadas y listas para pruebas de usuario.

---

### docs(setup): add Firebase and development guides

**Commit**: `db50801`

Documentación completa para onboarding de desarrolladores:
- FIREBASE_SETUP.md: Setup paso a paso de Firebase desde consola
- DEVELOPMENT.md: Guía de desarrollo con ejemplos de servicios y hooks

→ [Ver detalles completos](./changelog-2026-01-26-1030-db50801.md)

---

### feat(services): add core services for offline, notifications, and sync

**Commit**: `250de18`

Implementación de servicios críticos para Phase 4 (Medication) y Phase 5 (Offline):
- NotificationService: Recordatorios locales con reintentos
- MedicationService: CRUD de medicamentos con sincronización
- SyncService: Cola de sincronización con exponential backoff
- FavoritesService: Gestión de farmacias favoritas
- Custom hooks: usePharmacies, useSyncQueue
- Utilitarios: distanceUtils, dateUtils, constants

→ [Ver detalles](./changelog-2026-01-26-1020-250de18.md)

---

### feat(project-setup): initialize React Native MVP foundation

**Commit**: `80fff84`

Inicialización completa de la estructura base del proyecto React Native con:
- Configuración de React Native + Expo + TypeScript
- Servicios para autenticación, geolocalización y farmacias
- Estado global con Redux Toolkit
- Navegación completa (auth y app)
- 6 pantallas funcionales (auth + 5 tabs principales)
- Integración con Firebase y MINSAL APIs
- Sistema de caché offline con AsyncStorage

→ [Ver detalles completos](./changelog-2026-01-26-1000-80fff84.md)

**Impacto**: Establece arquitectura fundamental para todas las fases posteriores del MVP.

---

## Guía de Lectura

Cada entrada de changelog contiene:
- **Commit**: Hash del commit (click para ver en git)
- **Fecha**: Cuando se realizó el cambio
- **Cambios**: Nuevas features, fixes, cambios de comportamiento
- **Detalles**: Link a documentación detallada por commit

Para cambios específicos por archivo o módulo, ver los archivos individuales en `docs/changelog-YYYY-MM-DD-*.md`.

## Convenciones de Commits

El proyecto sigue Conventional Commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios de documentación
- `refactor:` Cambios internos sin alterar comportamiento
- `test:` Tests nuevos o mejorados
- `chore:` Tareas de mantenimiento

Formato: `tipo(scope): descripción`

Ejemplo: `feat(auth): agrega login con OAuth de Google`
