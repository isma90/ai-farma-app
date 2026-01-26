# Firebase Setup Guide

Guía paso a paso para configurar Firebase en el proyecto AI Farma.

## Requisitos Previos

- Cuenta de Google
- Firebase CLI instalado (`npm install -g firebase-tools`)
- Proyecto React Native inicializado

## 1. Crear Proyecto Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Click en "Crear proyecto" o "Agregar proyecto"
3. Ingresar nombre: `ai-farma-app`
4. Aceptar términos
5. Click "Crear proyecto"
6. Esperar a que se cree (2-3 minutos)

## 2. Configurar Autenticación

### 2.1 Habilitar Autenticación Anónima

1. En Firebase Console, ir a **Authentication** > **Sign-in method**
2. Habilitar **Anonymous** (Anonymous sign-in)
3. Click Save

### 2.2 Habilitar Email/Password

1. En **Sign-in method**, habilitar **Email/Password**
2. Activar ambas opciones:
   - ✅ Email/password
   - ✅ Email link (passwordless sign-in) [Optional]
3. Click Save

### 2.3 Habilitar Google OAuth (Recomendado)

1. En **Sign-in method**, habilitar **Google**
2. Ingresar email de soporte: `soporte@aifarma.cl`
3. Ingresar nombre del proyecto: `AI Farma`
4. Click Save
5. Ir a **Configuración del proyecto** > **Aplicaciones**
6. Registrar aplicación iOS:
   - Nombre: `AI Farma iOS`
   - iOS Bundle ID: `com.aifarma.app`
   - Descargar `GoogleService-Info.plist`
7. Registrar aplicación Android:
   - Nombre: `AI Farma Android`
   - Package name: `com.aifarma.app`
   - Descargar `google-services.json`

## 3. Crear Base de Datos Firestore

1. En Firebase Console, ir a **Firestore Database**
2. Click "Crear base de datos"
3. Seleccionar región: **South America (São Paulo)** (más cercano a Chile)
4. Seleccionar modo: **Modo de producción** (usaremos reglas de seguridad)
5. Click "Crear"
6. Esperar a que se initialice (~1 minuto)

### 3.1 Configurar Reglas de Seguridad

En **Firestore** > **Reglas**, reemplazar contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite solo acceso a propios datos
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }

    // Permite lectura pública de ratings
    match /pharmacy-ratings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Deniega todo lo demás
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click "Publicar"

## 4. Crear Cloud Storage (Opcional - Phase 2)

1. En Firebase Console, ir a **Storage**
2. Click "Comenzar"
3. Seleccionar ubicación: **South America (São Paulo)**
4. Seleccionar modo: **Producción**
5. Click "Crear"

## 5. Obtener Credenciales

### 5.1 Obtener Configuración de Proyecto

1. En **Configuración del proyecto** > **General**
2. Scroll down a "Tus aplicaciones"
3. Seleccionar aplicación Web (si no existe, crearla)
4. Copiar credenciales:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 6. Configurar Variables de Entorno

1. Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Rellenar con credenciales de Firebase:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
   ```

3. Agregar API keys:
   ```
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   EXPO_PUBLIC_SENTRY_DSN=YOUR_SENTRY_DSN (opcional)
   ```

## 7. Inicializar Firebase en Proyecto React Native

La configuración de Firebase ya está en `src/services/AuthService.ts` y otros servicios.
Solo asegúrate que `@react-native-firebase/app` esté instalado:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/analytics
```

## 8. Crear Estructura de Colecciones (Opcional)

La estructura se crea automáticamente cuando escribes datos. Para previsualizar:

```
users/
  {userId}/
    profile/
      data: {
        uid: string
        displayName: string
        email?: string
        createdAt: timestamp
      }
    medications/
      {medicationId}: {
        id: string
        medicationName: string
        dosage: string
        times: array
        ...
      }
    adherence/
      {adherenceId}: {
        medicationId: string
        date: date
        taken: boolean
      }
    favorites/
      {pharmacyId}: {
        pharmacyId: string
        addedAt: timestamp
      }

pharmacy-ratings/
  {ratingId}: {
    pharmacyId: string
    rating: number
    comment: string
    userId: string
    createdAt: timestamp
  }
```

## 9. Configurar Emulador Local (Desarrollo)

Para testing local sin usar servidor real:

```bash
firebase emulators:start --only firestore,auth
```

Luego en `.env`:
```
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=localhost:9099
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_URL=localhost:9099
```

## 10. Monitoreo y Backup

### 10.1 Habilitar Backups Automáticos

1. En **Firestore** > **Backups**
2. Crear política de backup
3. Seleccionar frecuencia: Diaria
4. Retención: 30 días

### 10.2 Configurar Alertas

1. En **Configuración del proyecto** > **Alertas**
2. Crear alertas para:
   - Exceso de cuota Firestore
   - Errores de autenticación
   - Errores de función Cloud

## 11. Manuales de Referencia

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Console](https://console.firebase.google.com)

## Troubleshooting

### Error: "Missing service account credentials"

Asegurar que `.env` contiene todas las credenciales de Firebase.

### Error: "Insufficient permissions"

Verificar reglas de Firestore en **Firestore** > **Reglas**.

### Error: "User not authenticated"

Asegurar que:
1. Autenticación está habilitada en Firebase Console
2. `AuthService.ts` está inicializando correctamente
3. Llamar a `signInAnonymously()` en app startup

### App muy lento con Firestore

- Verificar que no hay queries N+1 (usar batches)
- Habilitar indexación en Firestore para queries complejas
- Usar caché local (AsyncStorage) más agresivamente
