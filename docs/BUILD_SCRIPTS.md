# Build & Deployment Scripts

Este documento describe los scripts disponibles para compilar y desplegar la app AIFarma.

## Scripts Disponibles

### 1. `setup-ios.sh` - Configuración Inicial (Una sola vez)

**Uso:**
```bash
./setup-ios.sh
```

**Qué hace:**
- Verifica que Xcode esté instalado
- Verifica Node.js y npm
- Instala dependencias npm
- Ejecuta `pod install` para dependencias iOS
- Genera los artefactos de React Native codegen

**Cuándo usarlo:**
- Primera vez que clonas el repositorio
- Después de hacer `git clean -fd` o limpiar completamente
- Cuando actualizas dependencias en package.json

**Requisitos:**
- Xcode Command Line Tools (`xcode-select --install`)
- Node.js 16+ (`node -v`)
- npm 8+ (`npm -v`)

---

### 2. `deploy-ios.sh` - Build & Deploy Principal

**Uso:**
```bash
# Para simulator (más rápido, recomendado para desarrollo)
./deploy-ios.sh simulator

# Para iPhone físico (requiere configuración de code signing)
./deploy-ios.sh device

# Default (sin argumentos) = device
./deploy-ios.sh
```

**Qué hace:**
1. Genera artefactos React Native codegen
2. Compila la app con xcodebuild
3. Instala la app en simulator o device
4. Lanza la app automáticamente (en simulator)

**Opciones:**
- `simulator` - Compila para simulador iOS (Debug-iphonesimulator)
- `device` - Compila para iPhone físico (Debug-iphoneos)

**Salida típica:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AIFarma iOS Build & Deploy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/4] Generating React Native codegen...
✓ Codegen generated
[2/4] Building for physical iPhone...
✓ Build successful (124MB)
[3/4] Installing app...
✓ App installed in simulator
[4/4] Launching app...
✓ App launched in simulator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build & Deploy Complete!
```

---

## Flujo de Trabajo Típico

### Desarrollo Local (Simulator)

```bash
# Primera vez
./setup-ios.sh

# Después de cambios en código
./deploy-ios.sh simulator

# La app se relanza en el simulator automáticamente
```

### Testing en iPhone

```bash
# Primero: setup code signing en Xcode
open ios/AIFarma.xcworkspace

# Luego: deploy
./deploy-ios.sh device

# Nota: Requiere trust en Settings > General > Device Management
```

---

## Troubleshooting

### Script no ejecutable
```bash
chmod +x deploy-ios.sh setup-ios.sh
```

### "permission denied"
```bash
chmod +x *.sh
```

### No booted simulator
```bash
# Listar simuladores
xcrun simctl list devices

# Encender uno
xcrun simctl boot "D61535CD-1F95-4F2A-9583-C3876C86FF4F"

# Retry deploy
./deploy-ios.sh simulator
```

### Build lento
- Primera compilación toma 2-5 minutos (normal)
- Compilaciones posteriores son más rápidas
- Para limpiar: `rm -rf ios/build && ./deploy-ios.sh simulator`

### Codegen fail
```bash
# Regenerar manualmente
node node_modules/react-native/scripts/generate-codegen-artifacts.js \
    -p . -t ios -o ios/build/generated
```

### Pod install fail
```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
./deploy-ios.sh simulator
```

---

## Configuración de Code Signing (Para Device)

Requerido para desplegar en iPhone físico:

1. **Conecta iPhone** por USB
2. **Abre Xcode**:
   ```bash
   open ios/AIFarma.xcworkspace
   ```
3. **Configura signing**:
   - Selecciona `AIFarma` target
   - Ve a `Signing & Capabilities`
   - En `Team`, selecciona tu Apple Account
   - Xcode generará certificados automáticamente

4. **En iPhone**:
   - `Settings > General > Device Management`
   - Busca tu Apple ID
   - Toca `Trust`

---

## Variables de Entorno

Si necesitas customizar el build, edita los scripts:

### En `deploy-ios.sh`
```bash
# Cambiar SDK
SDK="iphonesimulator"  # o "iphoneos"

# Cambiar configuration
CONFIGURATION="Debug"  # o "Release"

# Cambiar deployment target
IPHONEOS_DEPLOYMENT_TARGET=13.4
```

---

## Build Manual (Sin Script)

Si prefieres compilar manualmente:

```bash
# Simulador
xcodebuild \
    -workspace ios/AIFarma.xcworkspace \
    -scheme AIFarma \
    -configuration Debug \
    -derivedDataPath ios/build \
    -sdk iphonesimulator \
    -arch arm64 \
    CODE_SIGNING_REQUIRED=NO \
    IPHONEOS_DEPLOYMENT_TARGET=13.4

# Device
xcodebuild \
    -workspace ios/AIFarma.xcworkspace \
    -scheme AIFarma \
    -configuration Debug \
    -derivedDataPath ios/build \
    -sdk iphoneos \
    -arch arm64 \
    IPHONEOS_DEPLOYMENT_TARGET=13.4
```

---

## Archivos Generados

El build crea estos archivos (ignorados por git):

```
ios/
├── build/                          # Directorio de build
│   ├── Build/
│   │   └── Products/
│   │       ├── Debug-iphonesimulator/
│   │       │   └── AIFarma.app    # App para simulator
│   │       └── Debug-iphoneos/
│   │           └── AIFarma.app    # App para device
│   └── generated/                  # Codegen artifacts
├── Pods/                          # CocoaPods dependencies
├── Podfile.lock                   # Version lock para pods
└── .xcode.env.local               # Xcode environment variables
```

---

## Performance Tips

1. **First build**: 2-5 minutos (normal)
2. **Incremental builds**: 30-60 segundos
3. **Para acelerar**:
   ```bash
   # Clean build (slowest)
   rm -rf ios/build
   ./deploy-ios.sh simulator

   # Incremental (faster)
   ./deploy-ios.sh simulator
   ```

4. **Caché de pods**:
   - Keep `ios/Pods/` para builds más rápidos
   - Only clean si hay issues de dependencias

---

## CI/CD Integration

Para usar estos scripts en CI/CD:

```bash
# GitHub Actions ejemplo
- name: Setup iOS
  run: ./setup-ios.sh

- name: Build & Deploy to Simulator
  run: ./deploy-ios.sh simulator

# GitLab CI
deploy_ios:
  script:
    - ./setup-ios.sh
    - ./deploy-ios.sh simulator
```

---

## Próximas Mejoras

Scripts futuros pueden incluir:
- Upload a TestFlight
- Automated code signing via certificates
- Crash reporting integration
- Automated testing post-deployment
- Build caching para CI/CD

---

## Referencias

- [React Native iOS Guide](https://reactnative.dev/docs/environment-setup)
- [Xcode Build System](https://developer.apple.com/documentation/xcode/build-system)
- [CocoaPods Documentation](https://guides.cocoapods.org/)
