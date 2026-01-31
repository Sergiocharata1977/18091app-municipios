# Capacitor APK - Resumen de Configuración

## ✅ Configuración Completada

### 1. Dependencias Instaladas

```json
{
  "@capacitor/core": "^8.0.0",
  "@capacitor/cli": "^8.0.0",
  "@capacitor/android": "^8.0.0",
  "@capacitor/geolocation": "^8.0.0",
  "@capacitor/camera": "^8.0.0",
  "@capacitor/network": "^8.0.0",
  "@capacitor/splash-screen": "^8.0.0"
}
```

### 2. Configuración Híbrida

**Archivo:** `capacitor.config.ts`

- **App ID:** `com.doncandido.vendedor`
- **App Name:** Don Cándido Vendedor
- **Modo:** Hybrid (carga URL de producción)
- **URL:** `https://doncandidoia.com`

### 3. Plataforma Android

- ✅ Proyecto Android generado en `/android/`
- ✅ 4 plugins nativos sincronizados
- ✅ Permisos configurados en `AndroidManifest.xml`:
  - Internet
  - GPS (fine + coarse location)
  - Cámara
  - Almacenamiento (read/write)
  - Network state

### 4. Archivos Creados

```
/
├── capacitor.config.ts (configuración principal)
├── CAPACITOR_APK_GUIDE.md (guía de generación)
├── public/
│   └── index.html (dummy, no usado en modo híbrido)
└── android/ (proyecto Android nativo)
```

---

## 📱 Próximos Pasos

### Para Generar APK de Prueba

**Opción 1: Android Studio (recomendado para primera vez)**

```bash
npx cap open android
```

Luego: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`

**Opción 2: Terminal (más rápido)**

```bash
cd android
./gradlew assembleDebug
```

APK resultante: `android/app/build/outputs/apk/debug/app-debug.apk`

### Para Probar en Dispositivos

1. **Transferir APK** al dispositivo (USB, WhatsApp, email)
2. **Habilitar** "Instalar apps de fuentes desconocidas"
3. **Instalar** el APK
4. **Probar:**
   - ✅ App abre y carga `https://doncandidoia.com`
   - ✅ Login funciona
   - ✅ Navegación funciona
   - ⚠️ **Offline:** Probar con modo avión (esto es lo que queremos validar)
   - ✅ GPS: Probar en `/app-vendedor/mapa`
   - ✅ Cámara: Probar subida de evidencias

---

## ⚠️ Importante: Pruebas Offline

**NO asumimos que offline funciona al 100%.**

El APK carga la URL de producción, por lo que offline depende de:

1. Service Worker de tu PWA
2. Cache del navegador interno (WebView)
3. Estrategia de cache de Next.js

**Plan de validación:**

1. Instalar APK en 2-3 dispositivos Android reales
2. Probar con conexión
3. **Activar modo avión**
4. Intentar usar la app
5. Si falla → iterar estrategia de cache

---

## 🔄 Iteraciones Posibles (si offline falla)

### Opción A: Mejorar Service Worker

- Cachear más rutas
- Implementar estrategia "offline-first"
- Usar Workbox avanzado

### Opción B: Capacitor Server Plugin

- Cachear respuestas de API localmente
- Sincronizar cuando vuelve conexión

### Opción C: Bundle local (último recurso)

- Cambiar a static export
- Refactorizar APIs a Firebase Functions
- Más complejo, solo si A y B fallan

---

## 📋 Checklist de Validación

- [ ] APK se genera sin errores
- [ ] APK se instala en dispositivo
- [ ] App carga correctamente
- [ ] Login funciona
- [ ] Navegación fluida
- [ ] **Offline funciona** (crítico para campo)
- [ ] GPS detecta ubicación
- [ ] Cámara toma fotos
- [ ] Datos se sincronizan al volver online

---

## 🚀 Para Distribución Final

1. Generar keystore (firma digital)
2. Compilar APK release firmado
3. Probar en múltiples dispositivos
4. Distribuir a vendedores
5. Monitorear feedback de campo
6. Iterar según necesidad

Ver `CAPACITOR_APK_GUIDE.md` para instrucciones detalladas.
