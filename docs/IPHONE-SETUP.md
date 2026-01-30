# Configuración para Desplegar en iPhone Físico

Este documento guía paso a paso para desplegar AIFarma en tu iPhone.

## ✅ Requisitos

- iPhone con iOS 13.4 o superior
- Cable USB para conectar iPhone a Mac
- Apple Developer Account (puede ser gratuita)
- Xcode 15+ instalado

## 📱 Pasos de Configuración

### Paso 1: Habilitar Developer Mode en iPhone

1. **Conecta tu iPhone** al Mac con cable USB
2. **En tu iPhone**:
   - Abre `Settings` (Ajustes)
   - Ve a `Privacy & Security` (Privacidad y Seguridad)
   - Desplázate hasta el final
   - Activa `Developer Mode` (te pedirá reiniciar)
   - El iPhone se reiniciará

### Paso 2: Configurar Code Signing en Xcode

1. **Abre el proyecto en Xcode**:
   ```bash
   open ios/AIFarma.xcworkspace
   ```

2. **En Xcode**:
   - En el sidebar, selecciona `AIFarma` target
   - Ve a la pestaña `Signing & Capabilities`
   - En `Team`, selecciona tu Apple Account
   - **Si no ves tu cuenta**:
     - Click en `Add an Account...`
     - Login con tu Apple ID
   - Xcode generará automáticamente los certificados necesarios

3. **Verifica**:
   - Deberías ver tu nombre en `Team`
   - No deberías ver errores rojos
   - El `Bundle ID` debe ser `com.aifarma.app`

### Paso 3: Confiar en el Certificado en iPhone

Después que Xcode genera los certificados:

1. **En tu iPhone**:
   - Abre `Settings` (Ajustes)
   - Ve a `General` (General)
   - Busca `Device Management` (Gestión de Dispositivos)
   - Busca tu Apple ID/Developer Account
   - Toca `Trust` (Confiar)
   - Confirma cuando se pida

### Paso 4: Desplegar con Script

Una vez configurado, simplemente:

```bash
./deploy-ios.sh device
```

El script:
1. Genera codegen artifacts
2. Compila para device
3. Busca tu iPhone conectado
4. Instala la app automáticamente

**Nota**: Si tienes múltiples iPhones conectados, instala en el primero que encuentra.

---

## 🚀 Alternativa: Deploy Manual vía Xcode

Si el script no funciona:

1. **En Xcode**:
   - Selecciona tu iPhone en el selector de dispositivos (parte superior)
   - Botón `Play` para compilar y ejecutar
   - O `Cmd + R` para compilar y correr

2. **Si pide certificado**:
   - Va a `Signing & Capabilities`
   - Asegúrate de que `Team` esté configurado
   - Xcode solicitará crear un certificado automático

---

## 🔧 Solucionar Problemas

### iPhone no aparece en Xcode

**Síntomas**: No ves tu iPhone en la lista de dispositivos en Xcode

**Soluciones**:
1. Desconecta y reconecta el cable USB
2. Desbloquea el iPhone
3. En iPhone: `Settings > Privacy & Security > Developer Mode` = ON
4. En iPhone: Cuando preguntes "Trust This Computer?", selecciona `Trust`
5. Reinicia Xcode: `Cmd + Q` y reabre

### "Code signing required"

**Síntomas**: Error al compilar "Code signing required"

**Soluciones**:
1. En Xcode: `Signing & Capabilities`
2. Asegúrate que `Team` tiene tu Apple ID
3. Si no aparece: `Add an Account...` y login

### "App installation failed"

**Síntomas**: Error al instalar app en iPhone

**Soluciones**:
1. En iPhone: `Settings > General > Device Management > Trust` el certificado
2. En iPhone: `Settings > General > iPhone Storage` - elimina app anterior
3. Reintenta el deploy

### "No code signing identity found"

**Síntomas**: Error "No code signing identity"

**Soluciones**:
1. Abre Xcode: `Xcode > Preferences > Accounts`
2. Agrega tu Apple ID si no está
3. Selecciona `AIFarma` target
4. `Signing & Capabilities` > `Team` > selecciona tu cuenta

---

## 📝 Proceso Completo Paso a Paso

```bash
# 1. Setup inicial (si no lo hiciste)
./setup-ios.sh

# 2. Conectar iPhone
# - Conecta con cable USB
# - Desbloquea y selecciona "Trust"

# 3. Configurar en Xcode
open ios/AIFarma.xcworkspace
# - En Xcode: Signing & Capabilities > Team > select your Apple Account
# - Espera a que Xcode cree los certificados

# 4. Confiar en iPhone
# - Settings > General > Device Management > Trust

# 5. Desplegar
./deploy-ios.sh device

# 6. Ver resultado
# - La app debería aparecer en el home screen del iPhone
# - Toca para abrir
```

---

## 🎯 Estado de Certificados

Para verificar el estado de tus certificados:

```bash
# Ver certificados en Mac
security find-identity -v -p codesigning

# Ver provision profiles
ls ~/Library/MobileDevice/Provisioning\ Profiles/
```

---

## 🔐 Apple Developer Program

### Free Account (Recomendado para desarrollo)

- ✅ Deploy a hasta 3 dispositivos físicos
- ✅ Testing en iPhone/iPad personal
- ✅ Development certificates automáticos
- ❌ No puede submeter a App Store
- ❌ Certificados expiran cada 7 días

Para más dispositivos o App Store, necesitas **Apple Developer Program** ($99/año).

---

## 🐛 Debug en iPhone

Una vez desplegada, puedes debuggear con Xcode:

1. En Xcode, selecciona tu iPhone en el device picker
2. `Xcode > Open Developer Tools > Console`
3. Verás logs y errores de la app en tiempo real

O via línea de comandos:
```bash
xcrun devicectl device info paired
```

---

## 📦 Versión de App

Cada vez que despliegas, considera:

- **Bundle ID**: `com.aifarma.app` (no cambiar)
- **Version**: En `app.json` bajo `version`
- **Build Number**: Auto-incrementado por Xcode

```json
{
  "version": "1.0.0",
  "name": "AIFarma",
  "ios": {
    "bundleIdentifier": "com.aifarma.app"
  }
}
```

---

## 🚢 Próximo: App Store (Futuro)

Para submeter a App Store necesitarás:

1. Apple Developer Program ($99/año)
2. Code signing certificado real
3. Privacy Policy
4. App Store Screenshots
5. App description

Ver [iOS-DEPLOYMENT.md#para-production](iOS-DEPLOYMENT.md#para-production) para detalles.

---

## 💡 Tips Útiles

- **Mantén iPhone conectado** durante toda la compilación
- **Desbloquea antes de instalar** app
- **Los primeros certificados toman más tiempo** que los siguientes
- **Puedes tener múltiples iPhones** para testing (cambia el device en Xcode)

---

## ✅ Checklist Final

Antes de desplegar:

- [ ] iPhone conectado con cable USB
- [ ] iPhone desbloqueado
- [ ] Developer Mode habilitado en iPhone
- [ ] Xcode configurado con Apple Account
- [ ] Certificate generado en Xcode
- [ ] iPhone confía en el certificado

Listo para:

```bash
./deploy-ios.sh device
```

---

## 📞 Soporte

Si tienes problemas:

1. Lee [BUILD_SCRIPTS.md](./BUILD_SCRIPTS.md#troubleshooting)
2. Consulta [iOS-DEPLOYMENT.md](iOS-DEPLOYMENT.md)
3. Revisa los logs en Xcode Console
4. Intenta `./clean-ios.sh && ./setup-ios.sh`

¡Buena suerte! 🎉
