'use client';

import { TrainingFormDialog } from '@/components/rrhh/TrainingFormDialog';
import { ModuleMaturityButton } from '@/components/shared/ModuleMaturityButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Training } from '@/types/rrhh';
import { Calendar, GraduationCap, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function CapacitacionesPage() {
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      const response = await fetch('/api/rrhh/trainings');
      if (response.ok) {
        const data = await response.json();
        setTrainings(data);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainings = useMemo(() => {
    return trainings.filter(training => {
      const matchesSearch =
        training.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (training.descripcion &&
          training.descripcion
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || training.estado === statusFilter;
      const matchesModality =
        modalityFilter === 'all' || training.modalidad === modalityFilter;

      return matchesSearch && matchesStatus && matchesModality;
    });
  }, [trainings, searchTerm, statusFilter, modalityFilter]);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/rrhh/capacitaciones/${id}`);
    },
    [router]
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta capacitación?')) return;

    try {
      const response = await fetch(`/api/rrhh/trainings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTrainings(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting training:', error);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planificada':
        return 'bg-blue-100 text-blue-800';
      case 'en_curso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planificada':
        return 'Planificada';
      case 'en_curso':
        return 'En Curso';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getModalidadText = (modalidad: string) => {
    switch (modalidad) {
      case 'presencial':
        return 'Presencial';
      case 'virtual':
        return 'Virtual';
      case 'mixta':
        return 'Mixta';
      default:
        return modalidad;
    }
  };

  const stats = useMemo(() => {
    return {
      total: trainings.length,
      en_curso: trainings.filter(t => t.estado === 'en_curso').length,
      planificadas: trainings.filter(t => t.estado === 'planificada').length,
      completadas: trainings.filter(t => t.estado === 'completada').length,
    };
  }, [trainings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Capacitaciones"
        description="Gestión de capacitaciones y formación del personal"
        breadcrumbs={[
          { label: 'RRHH', href: '/rrhh' },
          { label: 'Capacitaciones' },
        ]}
        actions={
          <div className="flex gap-2">
            <ModuleMaturityButton moduleKey="capacitaciones" />
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Capacitación
            </Button>
          </div>
        }
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">En Curso</p>
            <p className="text-2xl font-bold text-emerald-600">
              {stats.en_curso}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Planificadas</p>
            <p className="text-2xl font-bold text-amber-600">
              {stats.planificadas}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Completadas</p>
            <p className="text-2xl font-bold text-slate-600">
              {stats.completadas}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar capacitaciones..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="planificada">Planificada</option>
          <option value="en_curso">En Curso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <ViewToggle view={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Content */}
      {filteredTrainings.length === 0 ? (
        <div className="text-center py-12">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay capacitaciones
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primera capacitación
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainings.map(training => (
            <Card
              key={training.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleView(training.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <Badge className={getStatusColor(training.estado)}>
                    {getStatusText(training.estado)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {training.tema}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {training.descripcion || 'Sin descripción'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(training.fecha_inicio).toLocaleDateString(
                      'es-ES'
                    )}
                  </span>
                  <span>•</span>
                  <span>{getModalidadText(training.modalidad)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TrainingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchTrainings}
      />
    </div>
  );
}
