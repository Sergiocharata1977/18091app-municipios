/**
 * MejorasSidebar - Módulo Mejora Continua
 *
 * Opciones:
 * 1. Dashboard Mejoras
 * 2. Auditorías
 * 3. Encuestas
 * 4. Declaraciones
 * 5. Hallazgos
 * 6. Acciones
 */

'use client';

import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  Home,
  MessageSquare,
  Zap,
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
      name: 'Dashboard Mejoras',
      href: '/mejoras',
      icon: BarChart3,
    },
    {
      name: 'Auditorías',
      href: '/auditorias',
      icon: ClipboardCheck,
    },
    {
      name: 'Hallazgos',
      href: '/hallazgos',
      icon: AlertTriangle,
      badge: 'NC/OBS',
    },
    {
      name: 'Acciones',
      href: '/acciones',
      icon: CheckCircle,
      badge: 'CAPA',
    },
    {
      name: 'Encuestas',
      href: '/encuestas',
      icon: MessageSquare,
    },
    {
      name: 'Declaraciones',
      href: '/declaraciones',
      icon: FileText,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/mejoras') {
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
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">MEJORA</p>
                <p className="text-[10px] text-slate-400">Mejora Continua</p>
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
          href="/noticias"
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
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded">
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
          <p className="text-xs text-slate-500">Mejora Continua</p>
          <p className="text-xs text-slate-400">ISO 9001:2015 - Cláusula 10</p>
        </div>
      )}
    </aside>
  );
}

export function MejorasSidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-slate-900" />}>
      <SidebarContent />
    </Suspense>
  );
}
