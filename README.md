# 18091app - Sistema de Gestión para Municipios (ISO 18091)

Sistema integral de gestión de calidad para Gobiernos Locales basado en la norma ISO 18091, diseñado para monitorear y mejorar los servicios públicos y la gestión municipal.

## 🚀 Adaptación Municipal

Este proyecto es un fork de `9001app` adaptado específicamente para el dominio municipal:
- **Ciudadanos** en lugar de Clientes
- **Servicios Públicos** en lugar de Productos
- **Intendencia/Secretarías** en lugar de Dirección/Gerencias
- **ISO 18091** como marco de referencia (4 cuadrantes)

## 📋 Módulos Principales (Planificados)

### 🏛️ Dashboard ISO 18091
Monitoreo integral de los 4 cuadrantes del desarrollo:
1. Desarrollo Institucional para el Buen Gobierno
2. Desarrollo Económico Sostenible
3. Desarrollo Social Incluyente
4. Desarrollo Ambiental Sostenible

### 🏭 Procesos Municipales
Gestión de servicios clave:
- Obras Públicas
- Tránsito y Transporte
- Salud y Acción Social
- Habilitaciones Comerciales
- Recolección y Ambiente

### 📣 Participación Ciudadana
- Gestión de reclamos y solicitudes (Feedback)
- Encuestas de satisfacción ciudadana
- Transparencia y Datos Abiertos

### 🏗️ Gestión Interna
- Planificación y Revisión de Gestión
- Auditorías internas (ISO 19011)
- Hallazgos y Planes de Mejora

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Deployment**: Vercel (Frontend), Firebase (Backend)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# (Solicitar claves de proyecto 'doncandido-municipal')

# Ejecutar en desarrollo
npm run dev
```

## 📄 Licencia
Proyecto Privado. Todos los derechos reservados.
