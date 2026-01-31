/**
 * Tipos de datos para Servicios Públicos (Adaptación de Procesos ISO 9001)
 */

export type TipologiaServicio =
  | 'Salud'
  | 'Educación'
  | 'Obras Públicas'
  | 'Seguridad'
  | 'Acción Social'
  | 'Hacienda'
  | 'Medio Ambiente'
  | 'Cultura y Deporte'
  | 'Administración Central'
  | 'Otro';

export type ImpactoCiudadano = 'Bajo' | 'Medio' | 'Alto';

export interface PublicServiceDefinition {
  id: string;
  codigo: string;
  nombre: string;
  objetivo: string;
  alcance: string;
  responsable: string;
  dependencia_administrativa: string; // Secretaría de la que depende
  tipologia: TipologiaServicio;
  impacto_ciudadano: ImpactoCiudadano;
  entradas?: string[];
  salidas?: string[];
  controles?: string[];
  indicadores?: string[];
  documentos?: string[];
  estado: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
}
