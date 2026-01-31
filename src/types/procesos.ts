// Tipos de datos para el módulo de Procesos ISO 9001

import { ImpactoCiudadano, TipologiaServicio } from './servicios';

export interface ProcessDefinition {
  id: string;
  codigo: string;
  nombre: string;
  objetivo: string;
  alcance: string;
  responsable: string;
  dependencia_administrativa: string;
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

export interface ProcessRecord {
  id: string;
  processId: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en-progreso' | 'completado';
  responsable: string;
  fecha_vencimiento: Date;
  prioridad: 'baja' | 'media' | 'alta';
  createdAt: Date;
  updatedAt: Date;
}
