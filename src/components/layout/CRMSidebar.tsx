/**
 * CRMSidebar - Módulo CRM (Gestión de Clientes)
 *
 * Opciones:
 * 1. Dashboard Gestión Ciudadano
 * 2. Ciudadanos
 * 3. Contactos
 * 4. Oportunidades (Kanban)
 * 5. Evaluaciones
 * 6. Métricas
 * 7. Configuración
 */

'use client';

import { cn } from '@/lib/utils';
import {
    Activity,
    Briefcase,
    Building2,
    ChevronLeft,
    Home,
    Map,
    MessageSquare,
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
      name: 'Pipeline Oportunidades',
      href: '/crm',
      icon: Target,
      badge: 'Kanban',
    },
    {
      name: 'Ciudadanos',
      href: '/crm/clientes',
      icon: Building2,
    },
    {
      name: 'Contactos',
      href: '/crm/contactos',
      icon: Users,
    },
    {
      name: 'WhatsApp',
      href: '/crm/whatsapp',
      icon: MessageSquare,
      badge: 'Chat',
    },
    {
      name: 'Mapa Agentes',
      href: '/crm/mapa',
      icon: Map,
    },
    {
      name: 'Lista Agentes',
      href: '/crm/vendedores',
      icon: Users,
    },
    {
      name: 'Acciones',
      href: '/crm/acciones',
      icon: Activity,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/crm') {
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
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Gestión del Ciudadano</p>
                <p className="text-[10px] text-slate-400">
                  Atención al Vecino
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
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-blue-500 text-white rounded">
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
          <p className="text-xs text-slate-500">Gestión Municipal</p>
          <p className="text-xs text-slate-400">ISO 18091:2019</p>
        </div>
      )}
    </aside>
  );
}

export function CRMSidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-slate-900" />}>
      <SidebarContent />
    </Suspense>
  );
}
