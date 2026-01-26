# Changelog - AI Farma App

Historial de cambios y mejoras en el proyecto AI Farma, ordenado de más reciente a más antiguo.

## 2026-01-26

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
