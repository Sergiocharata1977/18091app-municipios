import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PositionService } from '@/services/rrhh/PositionService';
import { Position, PositionFormData } from '@/types/rrhh';
import {
  Briefcase,
  Building2,
  Download,
  Edit,
  Eye,
  Grid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PositionCard } from './PositionCard';
import { PositionForm } from './PositionForm';

interface PositionListingProps {
  onViewPosition?: (position: Position) => void;
  onEditPosition?: (position: Position) => void;
  onNewPosition?: () => void;
}

export function PositionListing({
  onViewPosition,
  onEditPosition,
  onNewPosition,
}: PositionListingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user?.organization_id) return;
    setIsLoading(true);
    try {
      const data = await PositionService.getAll(user.organization_id);
      setPositions(data);
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los puestos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.organization_id) {
      fetchData();
    }
  }, [fetchData, user?.organization_id]);

  const filteredPositions = useMemo(() => {
    return positions.filter(position => {
      const matchesSearch =
        position.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.descripcion_responsabilidades
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        position.requisitos_experiencia
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        position.requisitos_formacion
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [positions, searchTerm]);

  const handleNewPosition = useCallback(() => {
    setSelectedPosition(null);
    setShowForm(true);
    onNewPosition?.();
  }, [onNewPosition]);

  const handleFormSuccess = useCallback(
    async (data: PositionFormData) => {
      try {
        if (selectedPosition) {
          await PositionService.update(selectedPosition.id, data);
        } else {
          if (!user?.organization_id) throw new Error('No organization ID');
          await PositionService.create(data, user.organization_id);
        }
        setShowForm(false);
        fetchData();
      } catch (error) {
        console.error('Error al guardar puesto:', error);
        toast({
          title: 'Error',
          description: `No se pudo guardar el puesto: ${error instanceof Error ? error.message : String(error)}`,
          variant: 'destructive',
        });
      }
    },
    [selectedPosition, fetchData, toast]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleEditPosition = useCallback(
    (position: Position) => {
      setSelectedPosition(position);
      setShowForm(true);
      onEditPosition?.(position);
    },
    [onEditPosition]
  );

  const handleDeleteClick = useCallback((position: Position) => {
    setPositionToDelete(position);
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (positionToDelete) {
      try {
        await PositionService.delete(positionToDelete.id);
        toast({
          title: 'Éxito',
          description: `Puesto "${positionToDelete.nombre}" eliminado.`,
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting position:', error);
        toast({
          title: 'Error',
          description: `No se pudo eliminar el puesto: ${error instanceof Error ? error.message : String(error)}`,
          variant: 'destructive',
        });
      } finally {
        setShowDeleteAlert(false);
        setPositionToDelete(null);
      }
    }
  }, [positionToDelete, fetchData, toast]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteAlert(false);
    setPositionToDelete(null);
  }, []);

  const handleViewDetails = useCallback(
    (position: Position) => {
      setSelectedPosition(position);
      setShowDetails(true);
      onViewPosition?.(position);
    },
    [onViewPosition]
  );

  const handleCardClick = useCallback(
    (position: Position) => {
      router.push(`/dashboard/rrhh/positions/${position.id}`);
    },
    [router]
  );

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedPosition(null);
  }, []);

  const handleSeedData = useCallback(async () => {
    try {
      const response = await fetch('/api/seed/rrhh/fresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Datos sembrados exitosamente:', result);
        await fetchData();
        toast({
          title: 'Éxito',
          description: 'Datos de prueba agregados exitosamente',
        });
      } else {
        const error = await response.json();
        console.error('Error al sembrar datos:', error);
        toast({
          title: 'Error',
          description: 'Error al agregar datos de prueba',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al sembrar datos:', error);
      toast({
        title: 'Error',
        description: 'Error al agregar datos de prueba',
        variant: 'destructive',
      });
    }
  }, [fetchData, toast]);

  const stats = useMemo(() => {
    const total = positions.length;
    const activos = positions.length;
    const departamentos = new Set(
      positions.map(p => p.departamento_id).filter(Boolean)
    ).size;

    return { total, activos, departamentos };
  }, [positions]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border-0 shadow-sm">
              <CardContent className="flex items-center space-x-4 p-0">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredPositions.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
          <Briefcase className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No hay puestos registrados
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Empieza creando un nuevo puesto o importa datos de prueba.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button
              onClick={handleNewPosition}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Crear Puesto
            </Button>
            <Button
              variant="outline"
              onClick={handleSeedData}
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Datos de Prueba
            </Button>
          </div>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPositions.map(position => (
            <PositionCard
              key={position.id}
              position={position}
              onEdit={handleEditPosition}
              onDelete={handleDeleteClick}
              onView={handleViewDetails}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border-0 shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
              <TableHead className="font-semibold text-slate-700">
                Puesto
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Departamento
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Responsable
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Estado
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Fecha Creación
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-700">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.map(position => (
              <TableRow
                key={position.id}
                className="hover:bg-slate-50/50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                onClick={() => handleCardClick(position)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {position.nombre}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {position.descripcion_responsabilidades ||
                          'Sin descripción'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-600">
                  {position.departamento_id || 'N/A'}
                </TableCell>
                <TableCell className="text-slate-600">
                  {position.reporta_a_id || 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">
                    Activo
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600">
                  {position.created_at
                    ? new Date(position.created_at).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(position)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditPosition(position)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleDeleteClick(position)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [
    filteredPositions,
    isLoading,
    viewMode,
    handleNewPosition,
    handleEditPosition,
    handleDeleteClick,
    handleViewDetails,
    handleCardClick,
    handleSeedData,
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Puestos"
        description="Administra los puestos de trabajo de la organización"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'RRHH', href: '/dashboard/rrhh' },
          { label: 'Puestos' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={handleNewPosition}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Puesto
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Total Puestos
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Activos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.activos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Departamentos
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.departamentos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border-0 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar puestos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

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
      <div className="min-h-[400px]">{renderContent}</div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <PositionForm
              initialData={selectedPosition}
              onSubmit={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetails && selectedPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <Card className="border-0 shadow-none">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedPosition.nombre}
                      </h2>
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 mt-1">
                        Activo
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleCloseDetails}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-x h-4 w-4"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                      Información del Puesto
                    </h3>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Descripción
                        </dt>
                        <dd className="text-base mt-1 text-slate-900">
                          {selectedPosition.descripcion_responsabilidades ||
                            'Sin descripción'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Departamento
                        </dt>
                        <dd className="text-base mt-1 text-slate-900">
                          {selectedPosition.departamento_id || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Reporta a
                        </dt>
                        <dd className="text-base mt-1 text-slate-900">
                          {selectedPosition.reporta_a_id || 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                      Requisitos
                    </h3>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Experiencia
                        </dt>
                        <dd className="text-base mt-1 text-slate-900">
                          {selectedPosition.requisitos_experiencia || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Formación
                        </dt>
                        <dd className="text-base mt-1 text-slate-900">
                          {selectedPosition.requisitos_formacion || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-slate-500">
                          Fecha de Creación
                        </dt>
                        <dd className="text-base mt-1 text-slate-900">
                          {selectedPosition.created_at
                            ? new Date(
                                selectedPosition.created_at
                              ).toLocaleDateString()
                            : 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Alerta de confirmación de eliminación */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el puesto{' '}
              <span className="font-semibold text-slate-900">
                {positionToDelete?.nombre}
              </span>{' '}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
