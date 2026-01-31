# Lógica de IA y Contexto del Proyecto - Don Cándido IA

Este documento describe la arquitectura y lógica del sistema de Inteligencia Artificial integrado en la plataforma Don Cándido IA (Sistema ISO 9001).

## 📋 Índice

1. [Visión General](#visión-general)
2. [Módulos con Integración IA](#módulos-con-integración-ia)
3. [Sistema de Sugerencias para Procesos](#sistema-de-sugerencias-para-procesos)
4. [Diccionario de Procesos Clásicos ISO 9001](#diccionario-de-procesos-clásicos-iso-9001)
5. [Endpoints de IA](#endpoints-de-ia)
6. [Flujo de Detección y Sugerencia](#flujo-de-detección-y-sugerencia)
7. [Trazabilidad y Auditoría](#trazabilidad-y-auditoría)

---

## Visión General

Don Cándido es el asistente de IA del sistema ISO 9001. Su rol es ayudar a los usuarios a:

- Redactar documentos y procedimientos
- Definir procesos siguiendo las mejores prácticas ISO 9001
- Analizar causas raíz de problemas
- Sugerir competencias para puestos
- Generar contenido estructurado

### Enfoque de IA

- **No invasivo**: La IA sugiere, el usuario decide
- **Contextual**: Usa información de la organización
- **Auditable**: Todas las sugerencias pueden trazarse
- **ISO 9001 nativo**: Prompts diseñados para cumplimiento normativo

---

## Módulos con Integración IA

| Módulo         | Componente           | Funcionalidad IA                                         |
| -------------- | -------------------- | -------------------------------------------------------- |
| **Procesos**   | Vista de detalle     | Sugerir descripción, objetivo, alcance                   |
| **Procesos**   | Modal de creación    | Detectar proceso clásico ISO, sugerir plantilla completa |
| **Mejoras**    | Formulario de acción | Análisis de causa raíz (5 Por Qués)                      |
| **Documentos** | Formulario           | Redactar descripción de procedimientos                   |
| **RRHH**       | Formulario de puesto | Sugerir competencias y responsabilidades                 |

---

## Sistema de Sugerencias para Procesos

### Detección de Procesos Clásicos

Cuando el usuario ingresa el nombre de un proceso, el sistema detecta automáticamente si corresponde a un "proceso clásico" ISO 9001.

```typescript
// Archivo: src/types/isoClassicProcesses.ts
const detection = detectClassicProcess('auditoría interna');
// Resultado: { process: auditorias_internas, score: 95 }
```

### Modos de Sugerencia

1. **Modo "name"**: Sugiere 3 nombres de proceso con justificación
2. **Modo "full"**: Genera definición completa (objetivo, alcance, actividades, etc.)
3. **Modo "section"**: Genera contenido solo para una sección específica

### Flujo UX

```
Usuario ingresa nombre → Detección automática → Banner "¿Usar plantilla ISO?"
           ↓
    Click en banner → Diálogo con opciones
           ↓
    "Generar completo" → API genera plantilla
           ↓
    "Aplicar todo" o "Aplicar por sección" → Campos se completan
           ↓
    Usuario revisa y guarda
```

---

## Diccionario de Procesos Clásicos ISO 9001

El sistema incluye plantillas predefinidas para los procesos más comunes:

### Nivel 1 - Estrategia

- `revision_direccion` - Planificación y Revisión por la Dirección (5.1, 5.2, 9.3)
- `gestion_riesgos` - Gestión de Riesgos y Oportunidades (4.1, 4.2, 6.1)

### Nivel 2 - Soporte

- `gestion_documental` - Gestión Documental (7.5)
- `recursos_humanos` - Gestión de RRHH y Competencias (7.1.2, 7.2, 7.3)
- `infraestructura` - Gestión de Infraestructura (7.1.3, 7.1.4)

### Nivel 3 - Operativo (Core)

- `comercializacion` - Gestión Comercial y Ventas (8.2)
- `produccion` - Producción y Operaciones (8.5)
- `compras` - Gestión de Compras y Proveedores (8.4)
- `diseno_desarrollo` - Diseño y Desarrollo (8.3)

### Nivel 4 - Evaluación

- `auditorias` - Auditorías Internas (9.2)
- `mejoras` - Gestión de Mejoras y NC (10.1, 10.2, 10.3)
- `partes_interesadas` - Evaluación de Partes Interesadas (4.2)

### Estructura de cada Plantilla

```typescript
interface ISOProcessTemplate {
  objective: string; // Objetivo claro y medible
  scope: string; // Alcance del proceso
  ownerRole: string; // Rol responsable sugerido
  involvedRoles: string[]; // Roles involucrados
  inputs: string[]; // Entradas del proceso
  outputs: string[]; // Salidas del proceso
  activities: Array<{
    // Actividades paso a paso
    step: number;
    name: string;
    description: string;
    record?: string; // Registro asociado
  }>;
  records: Array<{
    // Registros requeridos
    name: string;
    codeSuggestion: string;
    retention?: string;
  }>;
  indicators: Array<{
    // KPIs sugeridos
    name: string;
    formula?: string;
    frequency: string;
    target?: string;
  }>;
  risks: Array<{
    // Riesgos identificados
    risk: string;
    cause?: string;
    control?: string;
  }>;
  interactions: string[]; // Procesos relacionados
}
```

---

## Endpoints de IA

### 1. Sugerencias Generales

```
POST /api/ai/assist
```

Endpoint genérico para asistencia IA en cualquier módulo.

| Campo            | Tipo   | Descripción                                               |
| ---------------- | ------ | --------------------------------------------------------- |
| `context.modulo` | string | Módulo solicitante (procesos, documentos, rrhh)           |
| `context.tipo`   | string | Tipo de sugerencia (proceso, procedimiento, competencias) |
| `context.datos`  | object | Datos de contexto (nombre, descripción actual, etc.)      |

### 2. Sugerencias para Procesos

```
POST /api/ai/process-suggestions
```

Modos: `name`, `full`, `section`

### 3. Plantillas ISO 9001

```
POST /api/ai/process-template
GET  /api/ai/process-template?name=auditoría
```

- **POST**: Genera plantilla completa personalizada
- **GET**: Detecta proceso clásico por nombre (para UI en tiempo real)

---

## Flujo de Detección y Sugerencia

### Algoritmo de Detección

```typescript
function detectClassicProcess(inputName: string) {
  // 1. Normalizar texto (minúsculas, sin tildes)
  const normalized = normalizeText(inputName);

  // 2. Buscar coincidencia exacta con nombre
  // 3. Buscar coincidencia exacta con aliases
  // 4. Buscar coincidencia parcial
  // 5. Calcular score de confianza (0-100)

  return { process, score, matchedAlias };
}
```

### Umbral de Detección

- **Score ≥ 95**: Coincidencia exacta → Sugerir automáticamente
- **Score 80-94**: Coincidencia alta → Mostrar banner
- **Score 50-79**: Coincidencia parcial → Mostrar sugerencia discreta
- **Score < 50**: No detectado → No mostrar nada

---

## Trazabilidad y Auditoría

### Estructura de Log (Opcional)

```typescript
// Colección: organizations/{orgId}/process_ai_suggestions/{suggestionId}
interface ProcessAISuggestionLog {
  id: string;
  processId?: string;
  organizationId: string;
  userId: string;
  mode: 'name' | 'full' | 'section';
  inputContext: {
    processName?: string;
    rubro?: string;
    // ...
  };
  outputHash: string; // Hash para auditoría
  camposAplicados: string[]; // ['descripcion', 'objetivo']
  timestamp: Date;
}
```

### Beneficios para ISO 9001

1. **Evidencia de uso de herramientas**: Demuestra uso de tecnología
2. **Trazabilidad**: Saber quién aplicó qué sugerencia
3. **Mejora continua**: Analizar qué sugerencias se aceptan/rechazan

---

## Archivos Clave

| Archivo                                       | Descripción                                  |
| --------------------------------------------- | -------------------------------------------- |
| `src/types/isoClassicProcesses.ts`            | Diccionario de procesos clásicos ISO 9001    |
| `src/types/processAI.ts`                      | Tipos TypeScript para sistema de sugerencias |
| `src/app/api/ai/assist/route.ts`              | Endpoint genérico de asistencia IA           |
| `src/app/api/ai/process-suggestions/route.ts` | Sugerencias para procesos                    |
| `src/app/api/ai/process-template/route.ts`    | Plantillas ISO 9001 completas                |
| `src/components/ui/AIAssistButton.tsx`        | Componente botón de IA reutilizable          |

---

## Próximos Pasos

- [ ] Integrar detección en tiempo real en modal de creación
- [ ] Agregar diálogo de plantilla completa
- [ ] Implementar logging de sugerencias
- [ ] Expandir diccionario según feedback de usuarios
