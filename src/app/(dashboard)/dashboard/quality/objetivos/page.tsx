'use client';

import { ObjectiveFormDialog } from '@/components/quality/ObjectiveFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { QualityObjective } from '@/types/quality';
import {
  Edit,
  Eye,
  Grid,
  List,
  Minus,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ObjetivosListing() {
  const router = useRouter();
  const [objectives, setObjectives] = useState<QualityObjective[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const response = await fetch('/api/quality/objectives');
      if (response.ok) {
        const data = await response.json();
        setObjectives(data);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredObjectives = useMemo(() => {
    return objectives.filter(objective => {
      const matchesSearch =
        objective.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        objective.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        objective.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || objective.status === statusFilter;
      const matchesType = typeFilter === 'all' || objective.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [objectives, searchTerm, statusFilter, typeFilter]);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/dashboard/quality/objetivos/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/dashboard/quality/objetivos/${id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este objetivo?')) return;

    try {
      const response = await fetch(`/api/quality/objectives/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setObjectives(prev => prev.filter(obj => obj.id !== id));
      }
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'atrasado':
        return 'bg-red-100 text-red-800';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'completado':
        return 'Completado';
      case 'atrasado':
        return 'Atrasado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'estrategico':
        return 'Estratégico';
      case 'tactico':
        return 'Táctico';
      case 'operativo':
        return 'Operativo';
      default:
        return type;
    }
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 100)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (progress >= 50) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const renderContent = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredObjectives.length === 0) {
      return (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No se encontraron objetivos'
              : 'No hay objetivos registrados'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer objetivo de calidad'}
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <div className="mt-6">
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Objetivo
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredObjectives.map(objective => (
            <Card
              key={objective.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleView(objective.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {objective.code.substring(0, 2).toUpperCase()}
                  </div>
                  <Badge className={getStatusColor(objective.status)}>
                    {getStatusText(objective.status)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {objective.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {objective.code}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {getTypeText(objective.type)}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progreso</span>
                    <span className="font-medium flex items-center gap-1">
                      {getProgressIcon(objective.progress_percentage)}
                      {objective.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        objective.progress_percentage >= 100
                          ? 'bg-green-600'
                          : objective.progress_percentage >= 50
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                      }`}
                      style={{
                        width: `${Math.min(objective.progress_percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Meta info */}
                <div className="text-sm text-gray-500 space-y-1 mt-4">
                  <div>
                    Meta: {objective.target_value} {objective.unit}
                  </div>
                  <div>
                    Actual: {objective.current_value} {objective.unit}
                  </div>
                  <div>
                    Vence:{' '}
                    {new Date(objective.due_date).toLocaleDateString('es-ES')}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      handleView(objective.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(objective.id);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(objective.id);
                      }}
                      className="text-red-600 hover:text-red-700"
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
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredObjectives.map(objective => (
                  <tr
                    key={objective.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleView(objective.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {objective.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {objective.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {getTypeText(objective.type)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getProgressIcon(objective.progress_percentage)}
                        <span className="text-sm text-gray-900">
                          {objective.progress_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(objective.status)}>
                        {getStatusText(objective.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(objective.due_date).toLocaleDateString(
                          'es-ES'
                        )}
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
                          onClick={() => handleView(objective.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(objective.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(objective.id)}
                          className="text-red-600 hover:text-red-700"
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
    loading,
    filteredObjectives,
    viewMode,
    searchTerm,
    statusFilter,
    typeFilter,
    handleView,
    handleEdit,
    handleDelete,
    router,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Objetivos de Calidad"
        description="Gestión de objetivos SMART vinculados a procesos"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Objetivos' },
        ]}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Objetivo
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar objetivos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="completado">Completado</option>
          <option value="atrasado">Atrasado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">Todos los tipos</option>
          <option value="estrategico">Estratégico</option>
          <option value="tactico">Táctico</option>
          <option value="operativo">Operativo</option>
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

      {/* Dialog para crear objetivo */}
      <ObjectiveFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchObjectives}
      />
    </div>
  );
}
