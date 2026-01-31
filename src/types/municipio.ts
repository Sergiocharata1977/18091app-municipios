/**
 * Tipos de datos para la configuración del Municipio (ISO 18091)
 */

export interface Secretaria {
  id: string;
  nombre: string;
  responsable: string;
  descripcion?: string;
  areas?: string[];
}

export interface MunicipioConfig {
  id: string;
  nombre_municipio: string;
  escudo_url?: string;
  intendente: {
    nombre: string;
    periodo_desde: string;
    periodo_hasta: string;
  };
  secretarias: Secretaria[];
  prioridades_gestion: string[];
  mision?: string;
  vision?: string;
  valores?: string[];
  objectives?: string[];
  created_at: Date;
  updated_at: Date;
}
