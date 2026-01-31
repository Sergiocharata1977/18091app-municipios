'use client';

import { EvaluationFormDialog } from '@/components/rrhh/EvaluationFormDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PerformanceEvaluation } from '@/types/rrhh';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { EvaluationCard } from './EvaluationCard';

export function EvaluationListing() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<
    PerformanceEvaluation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const filterEvaluations = useCallback(() => {
    let filtered = [...evaluations];

    // Filtro por búsqueda (título o período)
    if (searchTerm) {
      filtered = filtered.filter(
        e =>
          e.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.periodo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.personnel_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.estado === statusFilter);
    }

    // Filtro por resultado
    if (resultFilter !== 'all') {
      filtered = filtered.filter(e => e.resultado_global === resultFilter);
    }

    setFilteredEvaluations(filtered);
  }, [evaluations, searchTerm, statusFilter, resultFilter]);

  useEffect(() => {
    filterEvaluations();
  }, [filterEvaluations]);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/rrhh/evaluations');
      if (!response.ok) {
        throw new Error('Error al cargar evaluaciones');
      }
      const data = await response.json();
      setEvaluations(data);
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleView = useCallback(
    (id: string) => {
      router.push(`/dashboard/rrhh/evaluations/${id}`);
    },
    [router]
  );

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación?')) return;

    try {
      const response = await fetch(`/api/rrhh/evaluations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar');
      loadEvaluations();
    } catch (err) {
      console.error('Error al eliminar evaluación:', err);
      setError('Error al eliminar la evaluación');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evaluaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluaciones de Desempeño"
        description="Gestión de evaluaciones de competencias"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'RRHH', href: '/dashboard/rrhh' },
          { label: 'Evaluaciones' },
        ]}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Evaluación
          </Button>
        }
      />

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border-0 shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por título o período..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Resultado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los resultados</SelectItem>
            <SelectItem value="Apto">Apto</SelectItem>
            <SelectItem value="No Apto">No Apto</SelectItem>
            <SelectItem value="Requiere Capacitación">
              Requiere Capacitación
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-900">
              {evaluations.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Aptos</p>
            <p className="text-2xl font-bold text-emerald-600">
              {evaluations.filter(e => e.resultado_global === 'Apto').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">
              Requieren Capacitación
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {
                evaluations.filter(
                  e => e.resultado_global === 'Requiere Capacitación'
                ).length
              }
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">No Aptos</p>
            <p className="text-2xl font-bold text-red-600">
              {evaluations.filter(e => e.resultado_global === 'No Apto').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Evaluaciones */}
      {filteredEvaluations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron evaluaciones</p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4">
            Crear Primera Evaluación
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvaluations.map(evaluation => (
            <EvaluationCard
              key={evaluation.id}
              evaluation={evaluation}
              onEdit={() => handleView(evaluation.id)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Dialog simplificado para crear */}
      <EvaluationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadEvaluations}
      />
    </div>
  );
}
