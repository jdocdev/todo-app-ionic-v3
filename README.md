# Estructura Base para Aplicación Híbrida (Ionic + Cordova)

## 1. Objetivo
Configurar una aplicación híbrida lista para compilar y ejecutar en **Android** desde Ubuntu, y con estructura preparada para **iOS** (aunque no se compila).

---

## 2. Pasos Ejecutados

### 2.1. Deshabilitar Capacitor y habilitar Cordova
```bash
ionic integrations disable capacitor
ionic integrations enable cordova
```

### 2.2. Agregar plataformas
```bash
ionic cordova platform add android
ionic cordova platform add ios
```

Resultado esperado:
```
Installed platforms:
  android 14.0.1
  ios 7.1.1
```

---

## 3. Compilación y Ejecución en Android

### 3.1. Construir proyecto
```bash
ionic build
cordova prepare android
```

### 3.2. Emular aplicación
```bash
cordova emulate android
```

Resultado:
```
BUILD SUCCESSFUL
Built the following apk(s):
platforms/android/app/build/outputs/apk/debug/app-debug.apk
INSTALL SUCCESS
LAUNCH SUCCESS
```

También se puede usar:
```bash
cordova run android
```

---

## 4. Preparación de estructura iOS (sin compilar)
Aunque no se puede construir en Ubuntu, se genera la base con:
```bash
ionic cordova prepare ios
```

Esto crea `platforms/ios/` lista para abrir en Xcode.

---

## 5. Archivo README.md

```markdown
# Proyecto Ionic + Cordova

## Compilar en Android
```bash
ionic build
cordova prepare android
cordova run android
```

## Generar estructura iOS
```bash
ionic cordova prepare ios
```

El APK final se encuentra en:
`platforms/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 6. Resultado Final
```
La aplicación quedó configurada con Cordova, compilada y ejecutada correctamente en Android, y con estructura completa para iOS.  
Ejecución confirmada: `LAUNCH SUCCESS`
```
