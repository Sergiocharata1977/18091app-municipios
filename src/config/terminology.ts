export const TERMINOLOGY = {
  // General Entities
  organization: {
    singular: 'Municipio',
    plural: 'Municipios',
    short: 'Muni',
  },
  client: {
    singular: 'Ciudadano',
    plural: 'Ciudadanos',
    short: 'Vecino',
  },
  product: {
    singular: 'Servicio Público',
    plural: 'Servicios Públicos',
    short: 'Servicio',
  },
  provider: {
    singular: 'Proveedor',
    plural: 'Proveedores',
    short: 'Prov.'
  },

  // Roles & Hierarchy
  director: {
    singular: 'Intendente',
    plural: 'Intendentes',
    term: 'Intendencia',
  },
  manager: {
    singular: 'Secretario',
    plural: 'Secretarios',
    term: 'Secretaría',
  },
  supervisor: {
    singular: 'Director',
    plural: 'Directores',
    term: 'Dirección',
  },

  // Quality / ISO specific
  management_review: {
    singular: 'Revisión de Gestión Municipal',
    short: 'Rev. Gestión',
  },
  quality_objectives: {
    singular: 'Objetivo de Gestión',
    plural: 'Objetivos de Gestión',
  },
  customer_satisfaction: {
    singular: 'Satisfacción Ciudadana',
    term: 'Percepción del Vecino',
  },
  non_conformity: {
    singular: 'Desvío',
    plural: 'Desvíos',
  },
} as const;

export type TerminologyKey = keyof typeof TERMINOLOGY;
