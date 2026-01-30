# AI Farma App

Una aplicación móvil multiplataforma (iOS/Android) que ayuda a usuarios chilenos a localizar farmacias de turno y gestionar sus medicamentos con inteligencia artificial.

## Características

### MVP (Phase 1)
- ✅ Localizador inteligente de farmacias con geolocalización en tiempo real
- ✅ Visualización en mapa y lista de farmacias cercanas
- ✅ Filtrado por estado de turno y distancia
- ✅ Gestión básica de medicinas con recordatorios locales
- ✅ Autenticación anónima y con email/Google
- ✅ Soporte offline para datos críticos
- ✅ Interfaz placeholder para asistente IA (Phase 2)

### Phase 2 (Próximamente)
- 🚀 Asistente farmacéutico IA conversacional
- 🚀 Detección de interacciones medicamentosas
- 🚀 Base de datos de medicamentos bioequivalentes
- 🚀 Análisis avanzado de adherencia
- 🚀 Compartir medicamentos con familia/cuidadores

## Tech Stack

### Frontend/Mobile
- **React Native** + **Expo** - Framework multiplataforma
- **TypeScript** - Type safety
- **React Navigation** - Navegación
- **Redux Toolkit** - State management
- **React Query** - API data fetching

### Backend & Services
- **Firebase** - Auth, Firestore, Analytics
- **Google Maps API** - Geolocalización y mapas
- **MINSAL APIs** - Datos de farmacias y turnos

### DevOps & Monitoring
- **EAS Build** - CI/CD para iOS/Android
- **Sentry** - Error tracking
- **GitHub Actions** - Automations

## Requisitos

- Node.js >= 16
- npm o yarn
- Xcode >= 13 (para iOS)
- Android Studio >= 2020.3 (para Android)
- Cuenta Firebase
- API key de Google Maps

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ai-farma/ai-farma-app.git
cd ai-farma-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 4. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar autenticación: Email/Password, Google, Anonymous
3. Crear base de datos Firestore
4. Copiar las credenciales en `.env`

### 5. Obtener API Keys

- **Google Maps**: https://developers.google.com/maps
- **Sentry**: https://sentry.io

## Desarrollo

### Ejecutar en iOS (Expo)

```bash
npm run ios
```

### Ejecutar en Android (Expo)

```bash
npm run android
```

### Ejecutar en desarrollo

```bash
npm start
```

### Linting y Formatting

```bash
npm run lint           # Verificar código
npm run lint:fix       # Arreglar errores
npm run format         # Formatear código
npm run type-check     # Verificar tipos TypeScript
```

### Testing

```bash
npm test              # Ejecutar pruebas
npm run test:watch    # Modo watch
npm run test:coverage # Cobertura
```

## Estructura del Proyecto

```
src/
├── App.tsx                    # Entrada principal
├── components/               # Componentes reutilizables
├── screens/                  # Pantallas de la app
│   ├── auth/                # Pantallas de autenticación
│   └── app/                 # Pantallas de la app
├── navigation/              # Configuración de navegación
├── services/                # Servicios (Auth, Location, Pharmacy)
├── redux/                   # Estado global
│   └── slices/
├── hooks/                   # Custom hooks
├── utils/                   # Utilidades
└── types/                   # Tipos TypeScript
```

## Proceso de Desarrollo

### 1. Feature Branch

```bash
git checkout -b feature/descripcion-feature
```

### 2. Implementar y Testear

- Seguir convenciones en `openspec/project.md`
- Escribir tests para la funcionalidad
- Asegurar no hay errores de linting

### 3. Commit (Conventional Commits)

```bash
git add .
git commit -m "feat: descripción breve del cambio"
```

Tipos de commits:
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios de documentación
- `refactor:` Cambios sin alterar comportamiento
- `test:` Adición de tests
- `chore:` Tareas de mantenimiento

### 4. Push y Pull Request

```bash
git push origin feature/descripcion-feature
```

## Documentación

- [Especificaciones OpenSpec](./openspec/) - Requisitos detallados
- [Diseño de Arquitectura](./openspec/changes/implement-mvp-foundation/design.md)
- [Checklist de Implementación](./openspec/changes/implement-mvp-foundation/tasks.md)
- [Convenciones del Proyecto](./openspec/project.md)

## Construir para Producción

### iOS

```bash
eas build --platform ios --auto-submit
```

### Android

```bash
eas build --platform android
```

## Solución de Problemas

### Error: "Firebase initialization failed"
- Verificar que `.env` tiene las credenciales correctas
- Asegurar que Firebase está habilitado en la consola

### Error: "Location permission denied"
- iOS: Verificar Info.plist tiene claves de ubicación
- Android: Verificar AndroidManifest.xml tiene permisos

### Error: "API rate limit exceeded"
- MINSAL APIs tienen límite de 100 req/min
- El app cachea datos localmente para evitar esto

## Contacto & Soporte

- Issues: [GitHub Issues](https://github.com/ai-farma/ai-farma-app/issues)
- Email: soporte@aifarma.cl

## Licencia

MIT License - Ver `LICENSE` para más detalles

## Contribución

Contribuciones bienvenidas. Por favor:

1. Fork el proyecto
2. Crea un feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
