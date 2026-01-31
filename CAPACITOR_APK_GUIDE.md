# Capacitor APK - Guía de Generación

## Requisitos Previos

1. **Android Studio** instalado
2. **Java JDK 17** o superior
3. **Gradle** (incluido con Android Studio)

---

## Pasos para Generar APK

### 1. Abrir proyecto en Android Studio

```bash
npx cap open android
```

Esto abre el proyecto Android en Android Studio.

### 2. Generar APK de Debug (para pruebas)

**Opción A: Desde Android Studio**

1. `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. Esperar compilación
3. Click en "locate" para ver el APK

**Opción B: Desde terminal**

```bash
cd android
./gradlew assembleDebug
```

**Ubicación del APK:**
`android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Generar APK de Release (para distribución)

**Primero: Crear keystore (solo una vez)**

```bash
keytool -genkey -v -keystore doncandido-vendedor.keystore -alias doncandido -keyalg RSA -keysize 2048 -validity 10000
```

Guardar el archivo `.keystore` en lugar seguro.

**Configurar firma en `android/app/build.gradle`:**

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../doncandido-vendedor.keystore")
            storePassword "TU_PASSWORD"
            keyAlias "doncandido"
            keyPassword "TU_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Generar APK firmado:**

```bash
cd android
./gradlew assembleRelease
```

**Ubicación del APK:**
`android/app/build/outputs/apk/release/app-release.apk`

---

## Distribución

### Enviar por WhatsApp/Email

1. Copiar el APK a una ubicación accesible
2. Enviar el archivo `app-release.apk`
3. El usuario debe:
   - Habilitar "Instalar apps de fuentes desconocidas"
   - Abrir el APK
   - Confirmar instalación

### Link de descarga directa

1. Subir APK a servidor/Firebase Storage
2. Compartir link: `https://tudominio.com/descargas/vendedor.apk`
3. Usuario descarga e instala

---

## Actualizar APK

Cuando hagas cambios en el código web:

```bash
# 1. Sync cambios
npx cap sync android

# 2. Generar nuevo APK
cd android
./gradlew assembleRelease

# 3. Distribuir nueva versión
```

**IMPORTANTE:** Como usamos modo híbrido (URL de producción), la mayoría de cambios NO requieren reinstalar el APK. Solo reinstalar si:

- Cambios en plugins nativos
- Cambios en permisos
- Cambios en configuración de Capacitor

---

## Pruebas en Dispositivos Reales

### Checklist de pruebas:

- [ ] APK se instala correctamente
- [ ] App carga `https://doncandidoia.com`
- [ ] Login funciona
- [ ] Navegación funciona
- [ ] **Offline:** ¿Funciona sin internet? (probar con modo avión)
- [ ] GPS: ¿Detecta ubicación?
- [ ] Cámara: ¿Toma fotos?
- [ ] Sincronización: ¿Sube datos cuando vuelve conexión?

### Dispositivos sugeridos para probar:

1. Android 10+ (moderno)
2. Android 7-9 (medio)
3. Android 6 o inferior (legacy, si aplica)

---

## Troubleshooting

### APK no instala

- Verificar que "Fuentes desconocidas" esté habilitado
- Verificar que no haya versión anterior instalada

### App no carga

- Verificar conexión a internet
- Verificar que `https://doncandidoia.com` esté accesible
- Revisar logs: `adb logcat`

### Permisos no funcionan

- Verificar que estén en `AndroidManifest.xml`
- Verificar que el usuario los haya aceptado en runtime

---

## Próximos Pasos

1. **Generar APK de debug** y probar en 2-3 dispositivos
2. **Evaluar offline:** Si falla, iterar Service Worker
3. **Generar APK de release** firmado
4. **Distribuir** a vendedores para pruebas de campo
