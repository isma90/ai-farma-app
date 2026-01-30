# iOS Deployment Guide

Este documento explica cómo compilar y desplegar la app AIFarma en iOS.

## Quick Start

### Para Simulator (Más Fácil - Recomendado para Testing)

```bash
./deploy-ios.sh simulator
```

Esto:
1. Genera los artefactos de codegen
2. Compila la app para el simulador
3. Instala en el simulador activo
4. Lanza la app automáticamente

### Para iPhone Físico

```bash
./deploy-ios.sh device
```

Esto genera la compilación para device, pero requiere configuración manual de code signing.

## Requisitos

- Xcode 15+ instalado
- Node.js instalado
- Git instalado
- Para device: Apple Developer Account (puede ser gratuita)

## Setup Inicial (Una sola vez)

### 1. Instalar dependencias

```bash
npm install
cd ios
pod install
cd ..
```

### 2. Para iPhone físico - Configurar Code Signing

1. **Conecta tu iPhone** por USB y desbloquéalo
2. **Abre Xcode**:
   ```bash
   open ios/AIFarma.xcworkspace
   ```
3. **En Xcode**:
   - Ve a `Signing & Capabilities`
   - En `Team`, selecciona tu Apple Account
   - Xcode generará automáticamente los certificados necesarios

4. **En tu iPhone**:
   - Ve a `Settings > General > Device Management`
   - Busca tu Apple Developer Account
   - Toca `Trust` para confiar en el certificado

## Comandos Disponibles

### Build para Simulator
```bash
./deploy-ios.sh simulator
```

### Build para Device
```bash
./deploy-ios.sh device
```

### Build Manual (sin deploy)
```bash
cd ios
xcodebuild \
    -workspace AIFarma.xcworkspace \
    -scheme AIFarma \
    -configuration Debug \
    -sdk iphoneos \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    IPHONEOS_DEPLOYMENT_TARGET=13.4
cd ..
```

## Troubleshooting

### "No booted simulator found"
**Solución:**
```bash
# Listar simuladores disponibles
xcrun simctl list devices

# Iniciar un simulador (ejemplo: iPhone 17 Pro)
xcrun simctl boot "D61535CD-1F95-4F2A-9583-C3876C86FF4F"

# Luego ejecuta el deploy
./deploy-ios.sh simulator
```

### "Code signing required"
**Solución:** Para device, necesitas Apple Developer Account y los pasos del Setup Inicial.

### Build falla con "constexpr variable"
**Causa:** Issue en react-native-screens (ya parcheado en el repo)

**Solución:** El repo incluye el parche. Si recurs el error:
```bash
# Editar manualmente
nano node_modules/react-native-screens/ios/RNSScreenStackHeaderConfig.mm
# Línea 40-41: Cambiar "constexpr" a "const"
```

### "App launch failed"
**Posibles causas:**
1. El simulador no está corriendo → Inicia uno manualmente
2. App anterior corrupta → `xcrun simctl uninstall booted com.aifarma.app`
3. Insufficient storage → Resetea el simulador

## Arquitectura del Build

```
deploy-ios.sh
├── [1] Generate codegen artifacts
│   └── node_modules/react-native/scripts/generate-codegen-artifacts.js
├── [2] Xcode compile & link
│   └── xcodebuild (ios/AIFarma.xcworkspace)
├── [3] Install app
│   └── xcrun simctl install (simulator) o deployment manual (device)
└── [4] Launch app
    └── xcrun simctl launch (simulator)
```

## Variables de Build (en deploy-ios.sh)

- `SDK`: iphoneos (device) o iphonesimulator
- `IPHONEOS_DEPLOYMENT_TARGET`: 13.4 (mínimo soportado)
- `CODE_SIGNING_REQUIRED`: NO (development build sin firma)
- `CONFIGURATION`: Debug (development) o Release (production)

## Para Production

Para una build production lista para TestFlight/AppStore:

```bash
xcodebuild \
    -workspace ios/AIFarma.xcworkspace \
    -scheme AIFarma \
    -configuration Release \
    -derivedDataPath ios/build \
    -sdk iphoneos \
    -archivePath ios/AIFarma.xcarchive \
    archive
```

Luego usar Xcode Organizer para distribución.

## Archivos de Compilación

- **Source**: `src/` y `index.js`
- **Xcode Project**: `ios/AIFarma.xcodeproj`
- **Xcode Workspace**: `ios/AIFarma.xcworkspace` (incluye Pods)
- **Build Output**: `ios/build/` (generado)
- **Codegen Artifacts**: `ios/build/generated/` (generado)

## Referencias

- [React Native iOS Documentation](https://reactnative.dev/docs/environment-setup)
- [Expo Development Build Docs](https://docs.expo.dev/development/build/)
- [Xcode Build Settings](https://developer.apple.com/documentation/xcode/build-settings-reference)

## Notas de Desarrollo

### Cambios Realizados para Build Nativa

1. **Deshabilitadas features de Expo Go**:
   - AsyncStorage (reemplazado con SimpleStorage in-memory)
   - Location Services (mock con Santiago default)
   - Notifications (mock console logging)
   - NetInfo (asume siempre online)

2. **Parcheados módulos nativos**:
   - `expo-modules-core/EXJavaScriptRuntime.mm` - añadido `noexcept`
   - `react-native-screens/RNSScreenStackHeaderConfig.mm` - `constexpr` → `const`

3. **Configuración**:
   - Deployment target: iOS 13.4
   - Architecture: arm64 (ARM 64-bit)
   - JS Engine: Hermes

### Próximos Pasos

Para production-ready features:

1. **Phase 2 - Implementar servicios reales**:
   - AsyncStorage nativa para persistencia
   - Geolocalización real
   - Push Notifications
   - Offline sync queue

2. **Phase 3 - Distribución**:
   - Code signing con certificate válido
   - Build para device físico
   - TestFlight distribution
   - App Store submission

## Soporte

Si encontras problemas:

1. **Revisa los logs**: `xcodebuild` output suele tener el error
2. **Limpia el build**: `rm -rf ios/build ios/Pods ios/Podfile.lock`
3. **Reinstala dependencias**: `pod install --repo-update`
4. **Check Xcode version**: `xcode-select --print-path`
