'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProcessService } from '@/services/procesos/ProcessService';
import { ProcessDefinition } from '@/types/procesos';
import {
  Edit,
  Eye,
  FileText,
  Grid,
  List,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface ProcessListingProps {
  onViewProcess?: (process: ProcessDefinition) => void;
  onEditProcess?: (process: ProcessDefinition) => void;
  onNewProcess?: () => void;
}

export const ProcessListing: React.FC<ProcessListingProps> = ({
  onViewProcess,
  onEditProcess,
  onNewProcess,
}) => {
  const router = useRouter();
  const [processes, setProcesses] = useState<ProcessDefinition[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'activo' | 'inactivo' | ''>(
    ''
  );
  const [loadingData, setLoadingData] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] =
    useState<ProcessDefinition | null>(null);

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setLocalError(null);

    try {
      console.log('Cargando datos de procesos...');
      const data = await ProcessService.getFiltered(
        searchTerm,
        estadoFilter || undefined
      );
      console.log('Datos de procesos cargados:', data);
      setProcesses(data || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setLocalError(
        'Error al cargar los datos. Por favor, intenta de nuevo más tarde.'
      );
      setProcesses([]);
    } finally {
      setLoadingData(false);
    }
  }, [searchTerm, estadoFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar procesos
  const filteredProcesses = useMemo(() => {
    if (!searchTerm.trim() && !estadoFilter) return processes;

    let filtered = processes;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        proc =>
          proc.nombre?.toLowerCase().includes(searchLower) ||
          proc.codigo?.toLowerCase().includes(searchLower) ||
          proc.responsable?.toLowerCase().includes(searchLower)
      );
    }

    if (estadoFilter) {
      filtered = filtered.filter(proc => proc.estado === estadoFilter);
    }

    return filtered;
  }, [processes, searchTerm, estadoFilter]);

  // Handlers
  const handleView = useCallback(
    (proc: ProcessDefinition) => {
      router.push(`/dashboard/procesos/definiciones/${proc.id}`);
    },
    [router]
  );

  const handleCardClick = useCallback(
    (proc: ProcessDefinition) => {
      router.push(`/dashboard/procesos/definiciones/${proc.id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (proc: ProcessDefinition) => {
      router.push(`/dashboard/procesos/${proc.id}?edit=true`);
    },
    [router]
  );

  const handleDelete = useCallback((proc: ProcessDefinition) => {
    setProcessToDelete(proc);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!processToDelete) return;

    try {
      await ProcessService.delete(processToDelete.id);
      setProcesses(prev => prev.filter(p => p.id !== processToDelete.id));
    } catch (err) {
      console.error('Error al eliminar proceso:', err);
    } finally {
      setDeleteDialogOpen(false);
      setProcessToDelete(null);
    }
  }, [processToDelete]);

  const handleNewProcess = useCallback(() => {
    router.push('/dashboard/procesos/new');
  }, [router]);

  const handleToggleEstado = useCallback(
    async (proc: ProcessDefinition) => {
      try {
        await ProcessService.toggleEstado(proc.id);
        fetchData(); // Recargar datos
      } catch (error) {
        console.error('Error al cambiar estado del proceso:', error);
      }
    },
    [fetchData]
  );

  // Función para obtener color del estado
  const getEstadoColor = (estado: string) => {
    return estado === 'activo'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  // Renderizar contenido
  const renderContent = useMemo(() => {
    if (loadingData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredProcesses.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || estadoFilter
              ? 'No se encontraron procesos'
              : 'No hay procesos registrados'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || estadoFilter
              ? 'No se encontraron resultados que coincidan con tu búsqueda.'
              : 'Comienza agregando la primera definición de proceso.'}
          </p>
          {!searchTerm && !estadoFilter && (
            <div className="mt-6">
              <Button
                onClick={handleNewProcess}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proceso
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProcesses.map(proc => (
            <Card
              key={proc.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCardClick(proc)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {proc.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  <Badge className={getEstadoColor(proc.estado)}>
                    {proc.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {proc.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    Código: {proc.codigo}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    Responsable: {proc.responsable}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      handleView(proc);
                    }}
                    aria-label={`Ver detalles de ${proc.nombre}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation();
                        handleToggleEstado(proc);
                      }}
                      aria-label={`Cambiar estado de ${proc.nombre}`}
                    >
                      {proc.estado === 'activo' ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(proc);
                      }}
                      aria-label={`Editar ${proc.nombre}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(proc);
                      }}
                      className="text-red-600 hover:text-red-700"
                      aria-label={`Eliminar ${proc.nombre}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Vista de tabla (lista)
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredProcesses.map(proc => (
                  <tr
                    key={proc.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCardClick(proc)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(proc);
                      }
                    }}
                    aria-label={`Ver detalles de ${proc.nombre}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {proc.codigo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {proc.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {proc.responsable}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getEstadoColor(proc.estado)}>
                        {proc.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(proc.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div
                        className="flex justify-end space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(proc)}
                          aria-label={`Ver detalles de ${proc.nombre}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleEstado(proc)}
                          aria-label={`Cambiar estado de ${proc.nombre}`}
                        >
                          {proc.estado === 'activo' ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(proc)}
                          aria-label={`Editar ${proc.nombre}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(proc)}
                          className="text-red-600 hover:text-red-700"
                          aria-label={`Eliminar ${proc.nombre}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }, [
    loadingData,
    filteredProcesses,
    viewMode,
    searchTerm,
    estadoFilter,
    handleNewProcess,
    handleView,
    handleEdit,
    handleDelete,
    handleCardClick,
    handleToggleEstado,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Procesos"
        description="Administra las definiciones de procesos ISO 9001"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Procesos' },
        ]}
        actions={
          <Button
            onClick={handleNewProcess}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proceso
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar procesos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={e =>
            setEstadoFilter(e.target.value as 'activo' | 'inactivo' | '')
          }
          className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>

        <div className="flex gap-1 border border-slate-200 rounded-md p-1 bg-slate-50">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={
              viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">{renderContent}</div>

      {/* Dialog de confirmación para eliminar */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              ¿Estás completamente seguro?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              definición de proceso{' '}
              <span className="font-semibold">{processToDelete?.nombre}</span>.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
