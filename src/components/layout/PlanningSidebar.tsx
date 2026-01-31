/**
 * PlanningSidebar - Módulo Planificación y Revisión por la Dirección
 *
 * Opciones:
 * 1. Definiciones Organizacionales (con tabs internos)
 * 2. AMFE (Riesgos y Oportunidades)
 * 3. Reuniones de Trabajo
 * 4. Historial
 */

'use client';

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronLeft,
  FileText,
  Globe,
  History,
  Home,
  Settings,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

function SidebarContent() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      name: 'Identidad Org.',
      href: '/planificacion-revision-direccion/identidad',
      icon: BookOpen,
    },
    {
      name: 'Alcance SGC',
      href: '/planificacion-revision-direccion/alcance',
      icon: Target,
    },
    {
      name: 'Contexto',
      href: '/planificacion-revision-direccion/contexto',
      icon: Globe,
    },
    {
      name: 'Estructura',
      href: '/planificacion-revision-direccion/estructura',
      icon: Users,
    },
    {
      name: 'Políticas',
      href: '/planificacion-revision-direccion/politicas',
      icon: FileText,
    },
    {
      name: 'AMFE',
      href: '/planificacion-revision-direccion/amfe',
      icon: AlertTriangle,
      badge: 'Riesgos',
    },
    {
      name: 'Reuniones',
      href: '/planificacion-revision-direccion/reuniones',
      icon: Calendar,
    },
    {
      name: 'Historial',
      href: '/planificacion-revision-direccion/historial',
      icon: History,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/planificacion-revision-direccion') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'bg-slate-900 text-white transition-all duration-300 flex flex-col h-full',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">PLANIFICACIÓN</p>
                <p className="text-[10px] text-slate-400">
                  Revisión por la Dirección
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-800 rounded"
          >
            <ChevronLeft
              className={cn(
                'w-5 h-5 transition-transform',
                collapsed && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {/* Volver al dashboard */}
      <div className="p-2 border-b border-slate-700">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          {!collapsed && <span>← Menú Principal</span>}
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                active
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-orange-600 text-white rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">ISO 9001:2015</p>
          <p className="text-xs text-slate-400">Cláusula 9.3</p>
        </div>
      )}
    </aside>
  );
}

export function PlanningSidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-slate-900" />}>
      <SidebarContent />
    </Suspense>
  );
}
