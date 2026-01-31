'use client';

import Logo from '@/components/ui/Logo';
import {
  MenuItem,
  navigation,
  superAdminNavigation,
} from '@/config/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

// Componente para renderizar iconos de manera segura
const SafeIcon = memo(
  ({
    Icon,
    className,
    isMounted,
  }: {
    Icon: React.ComponentType<{ className?: string }>;
    className?: string;
    isMounted: boolean;
  }) => {
    if (!isMounted) {
      return (
        <div
          className={className}
          style={{ width: '1.25rem', height: '1.25rem' }}
        />
      );
    }
    return <Icon className={className} />;
  }
);
SafeIcon.displayName = 'SafeIcon';

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(['RRHH', 'Procesos'])
  );
  const [isMounted, setIsMounted] = useState(false);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const pathname = usePathname();
  const { user } = useAuth();

  // Módulos habilitados del usuario (simple checklist)
  const modulosHabilitados = useMemo(() => {
    // Por defecto, mostrar todos los módulos
    // En el futuro esto vendrá de user.modulos_habilitados
    return (user as any)?.modulos_habilitados || null;
  }, [user]);

  // Filtrar navegación según módulos habilitados del usuario
  const filteredNavigation = useMemo(() => {
    // Si no hay usuario cargado o no tiene restricciones, mostrar todo
    if (!user || !modulosHabilitados) return navigation;

    return navigation.filter(item => {
      // Si no tiene feature definido, mostrar siempre
      if (!item.feature) return true;
      // Verificar si el módulo está habilitado
      return modulosHabilitados.includes(item.feature);
    });
  }, [user, modulosHabilitados]);
  // Evitar errores de hidratación renderizando solo en el cliente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Asegurar que los menús estén expandidos cuando se está en sus rutas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pathname.startsWith('/dashboard/rrhh')) {
        setExpandedMenus(prev => new Set([...prev, 'RRHH']));
      }
      if (
        pathname.startsWith('/dashboard/procesos') ||
        pathname.startsWith('/dashboard/quality') ||
        pathname.startsWith('/dashboard/calidad')
      ) {
        setExpandedMenus(prev => new Set([...prev, 'Procesos']));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // MULTI-TENANT: Obtener nombre de organización
  useEffect(() => {
    const fetchOrganization = async () => {
      // Primero intentar desde el usuario de AuthContext
      let orgId = (user as any)?.organization_id;

      // Si no está en el usuario, intentar desde sessionStorage
      if (!orgId) {
        orgId = sessionStorage.getItem('organization_id');
      }

      if (orgId) {
        try {
          const res = await fetch(`/api/super-admin/organizations/${orgId}`);
          if (res.ok) {
            const data = await res.json();
            setOrganizationName(data.organization?.name || orgId);
          } else {
            // Si falla el fetch, al menos mostrar el ID
            setOrganizationName(orgId);
          }
        } catch (error) {
          console.error('Error fetching organization:', error);
          setOrganizationName(orgId);
        }
      }
    };
    if (isMounted && user) {
      fetchOrganization();
    }
  }, [isMounted, user]);

  // Optimización: Memoizar función de toggle para evitar recreación
  const toggleMenu = useCallback((menuName: string) => {
    // Usar requestAnimationFrame para animación más suave
    requestAnimationFrame(() => {
      setExpandedMenus(prev => {
        const newSet = new Set(prev);
        if (newSet.has(menuName)) {
          newSet.delete(menuName);
        } else {
          newSet.add(menuName);
        }
        return newSet;
      });
    });
  }, []);

  // Optimización: Memoizar cálculo de menús activos
  const activeMenus = useMemo(() => {
    const active = new Set<string>();
    navigation.forEach(item => {
      if (
        pathname === item.href ||
        item.children?.some(child => pathname === child.href)
      ) {
        active.add(item.name);
      }
    });
    return active;
  }, [pathname]);

  // Optimización: Función de verificación usando el set memoizado
  const isMenuActive = useCallback(
    (item: MenuItem): boolean => {
      return activeMenus.has(item.name);
    },
    [activeMenus]
  );

  return (
    <div className="hidden md:flex w-64 flex-shrink-0">
      <div
        className={`sidebar-container bg-slate-800 text-white h-screen flex flex-col transition-[width] duration-200 ease-in-out overflow-hidden mx-4 my-4 rounded-lg ${collapsed ? 'w-16' : 'w-56'}`}
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#1e293b',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Logo Section */}
        <div className="p-3 border-b border-slate-700">
          <div className="flex items-center space-x-3 justify-center">
            {collapsed ? (
              <Logo variant="light" size="xs" showText={false} />
            ) : (
              <Logo variant="light" size="xs" showText={true} />
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <div className="flex justify-end p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-slate-700 transition-colors"
          >
            {collapsed ? (
              <SafeIcon
                Icon={ChevronRight}
                className="h-5 w-5"
                isMounted={isMounted}
              />
            ) : (
              <SafeIcon
                Icon={ChevronLeft}
                className="h-5 w-5"
                isMounted={isMounted}
              />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-hide">
          {/* Menú Super Admin o Menú Normal */}
          {user?.rol === 'super_admin' && !collapsed && (
            <div className="mb-4 px-3 py-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Super Admin
              </p>
            </div>
          )}

          <div className="space-y-1">
            {(user?.rol === 'super_admin'
              ? superAdminNavigation
              : filteredNavigation
            ).map(item => {
              const isActive = isMenuActive(item);
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.has(item.name);

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-white hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <SafeIcon
                        Icon={item.icon}
                        className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                        isMounted={isMounted}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          {isExpanded ? (
                            <SafeIcon
                              Icon={ChevronUp}
                              className="h-4 w-4"
                              isMounted={isMounted}
                            />
                          ) : (
                            <SafeIcon
                              Icon={ChevronDown}
                              className="h-4 w-4"
                              isMounted={isMounted}
                            />
                          )}
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-white hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <SafeIcon
                        Icon={item.icon}
                        className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                        isMounted={isMounted}
                      />
                      {!collapsed && item.name}
                    </Link>
                  )}

                  {/* Submenú */}
                  {hasChildren && isExpanded && !collapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children!.map(child => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`group flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                              isChildActive
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'text-white hover:bg-slate-600 hover:text-white'
                            }`}
                          >
                            <SafeIcon
                              Icon={child.icon}
                              className="mr-2 h-4 w-4 flex-shrink-0"
                              isMounted={isMounted}
                            />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
});
