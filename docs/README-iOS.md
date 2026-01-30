# AIFarma iOS Build & Deployment

Guía rápida para compilar y desplegar la aplicación AIFarma en iOS.

## 🚀 Quick Start

### Para Simulator (Desarrollo)
```bash
./deploy-ios.sh simulator
```

### Para iPhone Físico
```bash
./deploy-ios.sh device
```

## 📋 Scripts Disponibles

| Script | Uso | Propósito |
|--------|-----|----------|
| `setup-ios.sh` | Una sola vez | Instala dependencias y prepara el ambiente |
| `deploy-ios.sh` | Cada build | Compila y despliega en simulator o device |
| `clean-ios.sh` | Según sea necesario | Limpia artefactos de build y caché |

## 🛠️ Setup Inicial (Primera Vez)

```bash
# 1. Instala dependencias y prepara iOS
./setup-ios.sh

# 2. Después, despliega en simulator para testing
./deploy-ios.sh simulator
```

**Requisitos:**
- Xcode 15+ (`xcode-select --install`)
- Node.js 16+ (`node -v`)
- npm 8+ (`npm -v`)

## 💻 Flujo de Trabajo

### Desarrollo (Simulator)
```bash
# Cambias código...

# Compila y despliega
./deploy-ios.sh simulator

# La app se relanza automáticamente en el simulator
# Abre el simulador si no está abierto:
# xcrun simctl boot "D61535CD-1F95-4F2A-9583-C3876C86FF4F"
```

### Testing en iPhone
```bash
# 1. Configura code signing en Xcode
open ios/AIFarma.xcworkspace

# 2. En Xcode: Signing & Capabilities > Team > Select your Apple Account

# 3. En iPhone: Settings > General > Device Management > Trust

# 4. Despliega
./deploy-ios.sh device
```

## 📱 Comandos Comunes

### Compilar y desplegar automáticamente
```bash
./deploy-ios.sh simulator
```

### Ver simuladores disponibles
```bash
xcrun simctl list devices
```

### Iniciar simulador específico
```bash
xcrun simctl boot "D61535CD-1F95-4F2A-9583-C3876C86FF4F"
```

### Limpiar todo y empezar de nuevo
```bash
./clean-ios.sh
./setup-ios.sh
./deploy-ios.sh simulator
```

### Abrir proyecto en Xcode
```bash
open ios/AIFarma.xcworkspace
```

## 📚 Documentación Detallada

- **[iOS-DEPLOYMENT.md](./iOS-DEPLOYMENT.md)** - Guía completa de deployment
- **[BUILD_SCRIPTS.md](./BUILD_SCRIPTS.md)** - Documentación de scripts

## ⚠️ Troubleshooting

### "No booted simulator found"
```bash
# Ver simuladores disponibles
xcrun simctl list devices

# Encender uno (ej: iPhone 17 Pro)
xcrun simctl boot "D61535CD-1F95-4F2A-9583-C3876C86FF4F"
```

### Build falla con errores de Pods
```bash
./clean-ios.sh
./setup-ios.sh
./deploy-ios.sh simulator
```

### App no se lanza
```bash
# Eliminar app de simulador
xcrun simctl uninstall booted com.aifarma.app

# Reintentar
./deploy-ios.sh simulator
```

### Xcode no encuentra código signing
1. `open ios/AIFarma.xcworkspace`
2. Ir a `Signing & Capabilities`
3. En `Team`, seleccionar tu Apple Account
4. Dejar que Xcode genere certificados automáticamente

## 🔧 Configuración

### Cambiar deployment target
Editar en `app.json`:
```json
{
  "ios": {
    "deploymentTarget": "13.4"
  }
}
```

### Cambiar configuración de build
Editar en `deploy-ios.sh`:
```bash
CONFIGURATION="Debug"  # o "Release"
SDK="iphonesimulator"  # o "iphoneos"
```

## 📊 Build Times

| Tipo | Tiempo |
|------|--------|
| Primera compilación | 2-5 minutos |
| Compilación incremental | 30-60 segundos |
| Cambio pequeño | 10-20 segundos |

## 🚢 Para Production

Cuando estés listo para producción:

1. Cambiar a `Configuration=Release`
2. Configurar proper code signing con Apple Developer Account
3. Crear archive en Xcode
4. Subir a TestFlight o App Store

Ver [iOS-DEPLOYMENT.md](./iOS-DEPLOYMENT.md#para-production) para detalles.

## 📝 Cambios Realizados

La app fue adaptada para compilación nativa iOS:

- ✅ Generación automática de React Native codegen
- ✅ Parcheados módulos nativos para compatibilidad
- ✅ Configuración optimizada de CocoaPods
- ✅ Servicios mock para desarrollo (sin dependencias externas)
- ✅ Build scripts automatizados

## 🔗 Referencias

- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [Xcode Build System](https://developer.apple.com/documentation/xcode/build-system)
- [CocoaPods](https://guides.cocoapods.org/)

## 💡 Tips

- Mantén `ios/Pods/` para builds más rápidos
- Solo limpia cuando tengas issues de dependencias
- Primeros builds toman más tiempo (normal)
- El simulador se abre automáticamente si está cerrado

## 🆘 Soporte

Si encuentras problemas:

1. Lee [BUILD_SCRIPTS.md](./BUILD_SCRIPTS.md#troubleshooting)
2. Ejecuta `./clean-ios.sh && ./setup-ios.sh`
3. Revisa los logs de xcodebuild
4. Consulta la documentación oficial de React Native

---

**¡Listo!** Tu app AIFarma está lista para iOS. 🎉

Próximo paso: `./deploy-ios.sh simulator`
