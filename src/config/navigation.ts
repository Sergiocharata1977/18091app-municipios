'use client';

import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Plus,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';

export interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  feature?: string;
  children?: MenuItem[];
}

// Navegación principal del sistema - ÚNICO FUENTE DE VERDAD
export const navigation: MenuItem[] = [
  {
    name: 'Noticias',
    href: '/noticias',
    icon: MessageSquare,
    feature: 'noticias',
  },
  { name: 'Calendario', href: '/calendario', icon: Calendar },
  {
    name: 'Governance & Strategy',
    href: '/mi-sgc',
    icon: ShieldCheck,
    feature: 'mi-sgc',
  },
  {
    name: 'Planificación y Revisión',
    href: '/planificacion-revision-direccion',
    icon: Award,
  },
  {
    name: 'Mejora',
    href: '/mejoras',
    icon: Zap,
  },
  {
    name: 'Documentos',
    href: '/documentos',
    icon: FileText,
    feature: 'documentos',
  },
  { name: 'Puntos de Norma', href: '/puntos-norma', icon: BookOpen },
  {
    name: 'Gestión del Ciudadano',
    href: '/crm',
    icon: Briefcase,
    feature: 'crm',
  },
  {
    name: 'RRHH',
    href: '/rrhh',
    icon: Users,
  },
  {
    name: 'Procesos',
    href: '/procesos',
    icon: FileSpreadsheet,
  },
  { name: 'Usuarios', href: '/admin/usuarios', icon: Users },
];

// Menú específico para Super Admin
export const superAdminNavigation: MenuItem[] = [
  { name: 'Dashboard Super Admin', href: '/super-admin', icon: BarChart3 },
  {
    name: 'Organizaciones',
    href: '/super-admin/organizaciones',
    icon: Building2,
    children: [
      {
        name: 'Todas las Organizaciones',
        href: '/super-admin/organizaciones',
        icon: Building2,
      },
      {
        name: 'Crear Organización',
        href: '/super-admin/organizaciones/nueva',
        icon: Plus,
      },
    ],
  },
  {
    name: 'Solicitudes de Demo',
    href: '/super-admin/demo-requests',
    icon: MessageSquare,
  },
  {
    name: 'Gestión Global',
    href: '/super-admin/gestion',
    icon: Settings,
    children: [
      { name: 'Usuarios Globales', href: '/super-admin/usuarios', icon: Users },
      {
        name: 'Configuración Sistema',
        href: '/super-admin/configuracion',
        icon: Settings,
      },
      { name: 'Logs y Auditoría', href: '/super-admin/logs', icon: FileText },
    ],
  },
  {
    name: 'Estadísticas',
    href: '/super-admin/stats',
    icon: BarChart3,
    children: [
      {
        name: 'Métricas Globales',
        href: '/super-admin/stats',
        icon: BarChart3,
      },
      {
        name: 'Uso por Organización',
        href: '/super-admin/stats/organizaciones',
        icon: Building2,
      },
    ],
  },
];
