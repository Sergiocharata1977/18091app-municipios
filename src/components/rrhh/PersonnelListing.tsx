import { ModuleMaturityButton } from '@/components/shared/ModuleMaturityButton';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Personnel, PersonnelFormData } from '@/types/rrhh';
import {
  Building2,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PersonnelCard } from './PersonnelCard';
import { PersonnelForm } from './PersonnelForm';

interface PersonnelListingProps {
  onViewPersonnel?: (personnel: Personnel) => void;
  onEditPersonnel?: (personnel: Personnel) => void;
  onNewPersonnel?: () => void;
}

export function PersonnelListing({
  onEditPersonnel,
  onNewPersonnel,
}: PersonnelListingProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(
    null
  );
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [accessFilter, setAccessFilter] = useState<
    'all' | 'with_access' | 'without_access'
  >('all');
  const [processMap, setProcessMap] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get organization_id from sessionStorage
      const orgId = sessionStorage.getItem('organization_id');
      if (!orgId) {
        console.error('No organization_id found in sessionStorage');
        toast({
          title: 'Error',
          description:
            'No se encontró la organización. Intenta recargar la página.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Load personnel via API with organization_id
      const personnelResponse = await fetch(
        `/api/rrhh/personnel?organization_id=${orgId}&limit=100`
      );
      if (!personnelResponse.ok) throw new Error('Failed to load personnel');
      const responseData = await personnelResponse.json();
      const personnelData = responseData.data || responseData; // Handle paginated or direct response

      // Load positions and processes (optional - don't block if they fail)
      let posMap = new Map<string, string>();
      let procMap: Record<string, string> = {};

      try {
        const positionsResponse = await fetch('/api/positions');
        if (positionsResponse.ok) {
          const positionsData = await positionsResponse.json();
          if (Array.isArray(positionsData)) {
            positionsData.forEach((pos: { id: string; nombre: string }) => {
              posMap.set(pos.id, pos.nombre);
            });
          }
        }
      } catch (e) {
        console.warn('Could not load positions:', e);
      }

      try {
        const processesResponse = await fetch('/api/procesos');
        if (processesResponse.ok) {
          const processesData = await processesResponse.json();
          if (processesData.success && Array.isArray(processesData.processes)) {
            processesData.processes.forEach(
              (proc: { id: string; nombre: string }) => {
                procMap[proc.id] = proc.nombre;
              }
            );
          } else if (Array.isArray(processesData)) {
            processesData.forEach((proc: { id: string; nombre: string }) => {
              procMap[proc.id] = proc.nombre;
            });
          }
        }
      } catch (e) {
        console.warn('Could not load processes:', e);
      }

      setProcessMap(procMap);

      // Enrich personnel with position names
      const enrichedPersonnel = personnelData.map((person: Personnel) => ({
        ...person,
        puesto: person.puesto
          ? posMap.get(person.puesto) || person.puesto
          : undefined,
      }));

      setPersonnel(enrichedPersonnel);
    } catch (error) {
      console.error('Error fetching personnel:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los empleados.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPersonnel = useMemo(() => {
    return personnel.filter(person => {
      const matchesSearch =
        person.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.puesto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.telefono?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ||
        person.estado?.toLowerCase() === selectedStatus.toLowerCase();

      const matchesAccess =
        accessFilter === 'all' ||
        (accessFilter === 'with_access' && person.tiene_acceso_sistema) ||
        (accessFilter === 'without_access' && !person.tiene_acceso_sistema);

      return matchesSearch && matchesStatus && matchesAccess;
    });
  }, [personnel, searchTerm, selectedStatus, accessFilter]);

  const handleNewPersonnel = useCallback(() => {
    setSelectedPersonnel(null);
    setShowForm(true);
    onNewPersonnel?.();
  }, [onNewPersonnel]);

  const handleFormSuccess = useCallback(
    async (data: PersonnelFormData) => {
      try {
        if (selectedPersonnel) {
          await fetch(`/api/rrhh/personnel/${selectedPersonnel.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        } else {
          await fetch('/api/rrhh/personnel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
        }
        setShowForm(false);
        fetchData();
      } catch (error) {
        console.error('Error al guardar empleado:', error);
        toast({
          title: 'Error',
          description: `No se pudo guardar el empleado: ${error instanceof Error ? error.message : String(error)}`,
          variant: 'destructive',
        });
      }
    },
    [selectedPersonnel, fetchData, toast]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleEditPersonnel = useCallback(
    (personnel: Personnel) => {
      setSelectedPersonnel(personnel);
      setShowForm(true);
      onEditPersonnel?.(personnel);
    },
    [onEditPersonnel]
  );

  const handleDeleteClick = useCallback((personnel: Personnel) => {
    setPersonnelToDelete(personnel);
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (personnelToDelete) {
      try {
        await fetch(`/api/rrhh/personnel/${personnelToDelete.id}`, {
          method: 'DELETE',
        });
        toast({
          title: 'Éxito',
          description: `Empleado "${personnelToDelete.nombres} ${personnelToDelete.apellidos}" eliminado.`,
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting personnel:', error);
        toast({
          title: 'Error',
          description: `No se pudo eliminar el empleado: ${error instanceof Error ? error.message : String(error)}`,
          variant: 'destructive',
        });
      } finally {
        setShowDeleteAlert(false);
        setPersonnelToDelete(null);
      }
    }
  }, [personnelToDelete, fetchData, toast]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteAlert(false);
    setPersonnelToDelete(null);
  }, []);

  const handleViewDetails = useCallback(
    (personnel: Personnel) => {
      router.push(`/dashboard/rrhh/personnel/${personnel.id}`);
    },
    [router]
  );

  const handleCardClick = useCallback(
    (personnel: Personnel) => {
      router.push(`/dashboard/rrhh/personnel/${personnel.id}`);
    },
    [router]
  );

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedPersonnel(null);
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
        // Recargar datos después del seed
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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'bg-emerald-100 text-emerald-800';
      case 'licencia':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`;
  };

  const stats = useMemo(() => {
    const total = personnel.length;
    const activos = personnel.filter(p => p.estado === 'Activo').length;
    const licencia = personnel.filter(p => p.estado === 'Licencia').length;
    const departamentos = new Set(
      personnel.map(p => p.departamento).filter(Boolean)
    ).size;

    return { total, activos, licencia, departamentos };
  }, [personnel]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4 border-0 shadow-sm">
              <CardContent className="flex items-center space-x-4">
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

    if (filteredPersonnel.length === 0) {
      return (
        <div className="text-center p-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            No hay empleados registrados
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            Empieza creando un nuevo empleado o importa datos de prueba.
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={handleNewPersonnel}>
              <Plus className="mr-2 h-4 w-4" /> Crear Empleado
            </Button>
            <Button
              variant="outline"
              onClick={handleSeedData}
              className="bg-green-600 hover:bg-green-700 text-white"
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPersonnel.map(person => (
            <PersonnelCard
              key={person.id}
              personnel={person}
              processMap={processMap}
              onEdit={handleEditPersonnel}
              onDelete={handleDeleteClick}
              onView={handleViewDetails}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      );
    }

    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Empleado
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Puesto
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Departamento
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Estado
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Fecha de Ingreso
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 text-sm">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map(person => (
                  <tr
                    key={person.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCardClick(person)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(person);
                      }
                    }}
                    aria-label={`Ver detalles de ${person.nombres} ${person.apellidos}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={person.foto || '/placeholder.svg'}
                            alt={`${person.nombres} ${person.apellidos}`}
                          />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                            {getInitials(person.nombres, person.apellidos)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {person.nombres} {person.apellidos}
                          </p>
                          <p className="text-sm text-gray-600">
                            {person.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {person.puesto || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {person.departamento || 'N/A'}
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(person.estado)}>
                        {person.estado || 'N/A'}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">
                      {person.fecha_contratacion
                        ? new Date(
                            person.fecha_contratacion
                          ).toLocaleDateString('es-ES')
                        : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div
                        className="flex justify-end space-x-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(person)}
                          aria-label={`Ver detalles de ${person.nombres} ${person.apellidos}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditPersonnel(person)}
                          aria-label={`Editar ${person.nombres} ${person.apellidos}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(person)}
                          className="text-red-600 hover:text-red-700"
                          aria-label={`Eliminar ${person.nombres} ${person.apellidos}`}
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
    isLoading,
    filteredPersonnel,
    viewMode,
    handleNewPersonnel,
    handleSeedData,
    handleEditPersonnel,
    handleDeleteClick,
    handleViewDetails,
    handleCardClick,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Personal"
        description="Administra el personal de la organización según ISO 9001"
        breadcrumbs={[
          { label: 'RRHH', href: '/dashboard/rrhh' },
          { label: 'Personal' },
        ]}
        actions={
          <>
            <ModuleMaturityButton moduleKey="personal" />
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={handleNewPersonnel}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{stats.activos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En Licencia</p>
                <p className="text-2xl font-bold">{stats.licencia}</p>
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
                <p className="text-sm text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold">{stats.departamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar empleados por nombre, email, puesto, departamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
            className={
              selectedStatus === 'all'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : ''
            }
          >
            Todos
          </Button>
          <Button
            variant={selectedStatus === 'activo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('activo')}
            className={
              selectedStatus === 'activo'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : ''
            }
          >
            Activos
          </Button>
          <Button
            variant={selectedStatus === 'licencia' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('licencia')}
            className={
              selectedStatus === 'licencia'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : ''
            }
          >
            Licencia
          </Button>
        </div>

        {/* Filtros de Acceso al Sistema */}
        <div className="flex items-center gap-2 border-l pl-4">
          <Button
            variant={accessFilter === 'with_access' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAccessFilter('with_access')}
            className={
              accessFilter === 'with_access'
                ? 'bg-blue-600 hover:bg-blue-700'
                : ''
            }
          >
            🔐 Con acceso
          </Button>
          <Button
            variant={accessFilter === 'without_access' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAccessFilter('without_access')}
            className={
              accessFilter === 'without_access'
                ? 'bg-gray-600 hover:bg-gray-700'
                : ''
            }
          >
            ⚪ Sin acceso
          </Button>
        </div>

        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Más Filtros
        </Button>
        <Tabs
          value={viewMode}
          onValueChange={value => setViewMode(value as 'grid' | 'list')}
        >
          <TabsList>
            <TabsTrigger value="grid">Tarjetas</TabsTrigger>
            <TabsTrigger value="list">Tabla</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="min-h-96">{renderContent}</div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <PersonnelForm
              initialData={selectedPersonnel}
              onSubmit={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetails && selectedPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={selectedPersonnel.foto || '/placeholder.svg'}
                        alt={`${selectedPersonnel.nombres} ${selectedPersonnel.apellidos}`}
                      />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-xl">
                        {getInitials(
                          selectedPersonnel.nombres,
                          selectedPersonnel.apellidos
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedPersonnel.nombres}{' '}
                        {selectedPersonnel.apellidos}
                      </h2>
                      <Badge
                        className={getStatusColor(selectedPersonnel.estado)}
                      >
                        {selectedPersonnel.estado || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleCloseDetails}>
                    Cerrar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Información Personal
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Email
                        </dt>
                        <dd className="text-base mt-1">
                          {selectedPersonnel.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Teléfono
                        </dt>
                        <dd className="text-base mt-1">
                          {selectedPersonnel.telefono || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Dirección
                        </dt>
                        <dd className="text-base mt-1">
                          {selectedPersonnel.direccion || 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Información Laboral
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Puesto
                        </dt>
                        <dd className="text-base mt-1">
                          {selectedPersonnel.puesto || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Departamento
                        </dt>
                        <dd className="text-base mt-1">
                          {selectedPersonnel.departamento || 'N/A'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Fecha de Ingreso
                        </dt>
                        <dd className="text-base mt-1">
                          {selectedPersonnel.fecha_ingreso
                            ? new Date(
                                selectedPersonnel.fecha_ingreso instanceof Date
                                  ? selectedPersonnel.fecha_ingreso
                                  : selectedPersonnel.fecha_ingreso.seconds *
                                    1000
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
              al empleado{' '}
              <span className="font-semibold">
                {personnelToDelete?.nombres} {personnelToDelete?.apellidos}
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
