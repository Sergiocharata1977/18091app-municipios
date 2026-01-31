'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import UnifiedKanban from '@/components/ui/unified-kanban';
import { ProcessRecord } from '@/types/procesos';
import { ProcessRecordService } from '@/services/procesos/ProcessRecordService';
import type { KanbanItem, KanbanColumn } from '@/types/rrhh';

interface ProcessKanbanProps {
  processId: string;
  processName: string;
  onNewRecord?: () => void;
  onEditRecord?: (record: ProcessRecord) => void;
  onViewRecord?: (record: ProcessRecord) => void;
}

// Columnas del Kanban para registros de proceso
const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'pendiente',
    title: 'Pendiente',
    color: '#F59E0B', // amber
    allowDrop: true,
    order: 1,
  },
  {
    id: 'en-progreso',
    title: 'En Progreso',
    color: '#3B82F6', // blue
    allowDrop: true,
    order: 2,
  },
  {
    id: 'completado',
    title: 'Completado',
    color: '#10B981', // green
    allowDrop: true,
    order: 3,
  },
];

export const ProcessKanban: React.FC<ProcessKanbanProps> = ({
  processId,
  processName,
  onNewRecord,
  onEditRecord,
  onViewRecord,
}) => {
  const router = useRouter();
  const [records, setRecords] = useState<ProcessRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<
    'pendiente' | 'en-progreso' | 'completado' | ''
  >('');
  const [prioridadFilter, setPrioridadFilter] = useState<
    'baja' | 'media' | 'alta' | ''
  >('');
  const [loadingData, setLoadingData] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoadingData(true);
    setLocalError(null);

    try {
      console.log('Cargando registros del proceso...');
      const data = await ProcessRecordService.getFiltered(
        processId,
        searchTerm,
        estadoFilter || undefined,
        prioridadFilter || undefined
      );
      console.log('Registros del proceso cargados:', data);
      setRecords(data || []);
    } catch (err) {
      console.error('Error al cargar registros:', err);
      setLocalError(
        'Error al cargar los registros. Por favor, intenta de nuevo más tarde.'
      );
      setRecords([]);
    } finally {
      setLoadingData(false);
    }
  }, [processId, searchTerm, estadoFilter, prioridadFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Convertir ProcessRecord a KanbanItem
  const kanbanItems: KanbanItem[] = records.map(record => ({
    id: record.id,
    title: record.titulo,
    description: record.descripcion,
    columnId: record.estado,
    priority:
      record.prioridad === 'alta'
        ? 'high'
        : record.prioridad === 'media'
          ? 'medium'
          : 'low',
    assignee: record.responsable,
    dueDate: record.fecha_vencimiento.toISOString().split('T')[0], // Convertir a formato YYYY-MM-DD
    tags: [record.prioridad],
  }));

  // Handlers
  const handleItemMove = useCallback(
    async (
      itemId: string,
      sourceColumnId: string,
      targetColumnId: string,
      newIndex: number
    ) => {
      try {
        // Mover el registro a la nueva columna (estado)
        await ProcessRecordService.moveToState(
          itemId,
          targetColumnId as 'pendiente' | 'en-progreso' | 'completado'
        );

        // Actualizar el estado local
        setRecords(prev =>
          prev.map(record =>
            record.id === itemId
              ? {
                  ...record,
                  estado: targetColumnId as
                    | 'pendiente'
                    | 'en-progreso'
                    | 'completado',
                }
              : record
          )
        );
      } catch (error) {
        console.error('Error al mover registro:', error);
        // Recargar datos en caso de error
        fetchData();
      }
    },
    [fetchData]
  );

  const handleItemClick = useCallback(
    (item: KanbanItem) => {
      const record = records.find(r => r.id === item.id);
      if (record) {
        router.push(`/dashboard/procesos/${processId}/registros/${record.id}`);
      }
    },
    [records, router, processId]
  );

  const handleItemEdit = useCallback(
    (item: KanbanItem) => {
      const record = records.find(r => r.id === item.id);
      if (record) {
        onEditRecord?.(record);
      }
    },
    [records, onEditRecord]
  );

  const handleItemDelete = useCallback(async (item: KanbanItem) => {
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      try {
        await ProcessRecordService.delete(item.id);
        setRecords(prev => prev.filter(r => r.id !== item.id));
      } catch (error) {
        console.error('Error al eliminar registro:', error);
      }
    }
  }, []);

  const handleNewRecord = useCallback(() => {
    onNewRecord?.();
  }, [onNewRecord]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Registros del Proceso
          </h2>
          <p className="text-gray-600">{processName} - Gestión de registros</p>
        </div>
        <Button
          onClick={handleNewRecord}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Registro
        </Button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar registros..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={estadoFilter}
              onChange={e =>
                setEstadoFilter(
                  e.target.value as
                    | 'pendiente'
                    | 'en-progreso'
                    | 'completado'
                    | ''
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en-progreso">En Progreso</option>
              <option value="completado">Completado</option>
            </select>
            <select
              value={prioridadFilter}
              onChange={e =>
                setPrioridadFilter(
                  e.target.value as 'baja' | 'media' | 'alta' | ''
                )
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Más Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="min-h-96">
        <UnifiedKanban
          columns={KANBAN_COLUMNS}
          items={kanbanItems}
          onItemMove={handleItemMove}
          onItemClick={handleItemClick}
          onItemEdit={handleItemEdit}
          onItemDelete={handleItemDelete}
          loading={loadingData}
          error={localError || undefined}
          showActions={true}
        />
      </div>

      {/* Estadísticas */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Estadísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {records.filter(r => r.estado === 'pendiente').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {records.filter(r => r.estado === 'en-progreso').length}
              </div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => r.estado === 'completado').length}
              </div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {records.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
