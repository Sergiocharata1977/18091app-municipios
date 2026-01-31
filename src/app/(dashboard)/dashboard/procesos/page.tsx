'use client';

import { ProcessDefinitionFormDialog } from '@/components/processRecords/ProcessDefinitionFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessDefinition } from '@/types/processRecords';
import { Edit, FileText, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProcessDefinitionsPage() {
  const router = useRouter();
  const [processDefinitions, setProcessDefinitions] = useState<
    ProcessDefinition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingDefinition, setEditingDefinition] =
    useState<ProcessDefinition | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    | 'all'
    | 'calidad'
    | 'auditoria'
    | 'mejora'
    | 'rrhh'
    | 'produccion'
    | 'ventas'
    | 'logistica'
    | 'compras'
  >('all');

  // Funciones para manejar datos de prueba
  const handleSeedData = async () => {
    try {
      const response = await fetch('/api/processes/seed-massive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Datos de procesos sembrados exitosamente:', result);
        // Recargar datos después del seed
        await fetchDefinitions();
        alert(
          `Datos de procesos agregados exitosamente:\n\n- ${result.data.definitionsCreated} definiciones\n- ${result.data.recordsCreated} registros\n- ${result.data.kanbanBoardsCreated} tableros Kanban`
        );
      } else {
        const error = await response.json();
        console.error('Error al sembrar datos:', error);
        alert('Error al agregar datos de prueba');
      }
    } catch (error) {
      console.error('Error al sembrar datos:', error);
      alert('Error al agregar datos de prueba');
    }
  };

  const handleCheckData = async () => {
    try {
      const response = await fetch('/api/processes/check', {
        method: 'GET',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Datos en Firebase:', result);
        alert(
          `Datos encontrados:\n- Definiciones: ${result.data.processDefinitions.count}\n- Registros: ${result.data.processRecords.count}\n- Listas Kanban: ${result.data.kanbanLists.count}\n- Tarjetas: ${result.data.kanbanCards.count}`
        );
      } else {
        const error = await response.json();
        console.error('Error al verificar datos:', error);
        alert('Error al verificar datos');
      }
    } catch (error) {
      console.error('Error al verificar datos:', error);
      alert('Error al verificar datos');
    }
  };

  const handleClearData = async () => {
    if (
      confirm(
        '¿Estás seguro de que quieres eliminar todos los datos de procesos?'
      )
    ) {
      try {
        const response = await fetch('/api/processes/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'clear' }),
        });

        if (response.ok) {
          console.log('Datos eliminados exitosamente');
          setProcessDefinitions([]);
          alert('Datos eliminados exitosamente');
        } else {
          const error = await response.json();
          console.error('Error al eliminar datos:', error);
          alert('Error al eliminar datos');
        }
      } catch (error) {
        console.error('Error al eliminar datos:', error);
        alert('Error al eliminar datos');
      }
    }
  };

  // Cargar definiciones desde la API
  const fetchDefinitions = async () => {
    try {
      const response = await fetch('/api/process-definitions');
      if (response.ok) {
        const definitions = await response.json();
        setProcessDefinitions(definitions || []);
      }
    } catch (error) {
      console.error('Error al cargar definiciones:', error);
    }
  };

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDefinitions();
      setLoading(false);
    };

    loadData();
  }, []);

  // Filtrar definiciones
  const filteredDefinitions = processDefinitions.filter(definition => {
    const matchesSearch =
      (definition.nombre?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      ) ||
      (definition.descripcion?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      ) ||
      (definition.codigo?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      );
    const matchesCategory =
      filterCategory === 'all' || definition.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'calidad':
        return 'bg-blue-100 text-blue-800';
      case 'auditoria':
        return 'bg-green-100 text-green-800';
      case 'mejora':
        return 'bg-orange-100 text-orange-800';
      case 'rrhh':
        return 'bg-purple-100 text-purple-800';
      case 'produccion':
        return 'bg-red-100 text-red-800';
      case 'ventas':
        return 'bg-indigo-100 text-indigo-800';
      case 'logistica':
        return 'bg-yellow-100 text-yellow-800';
      case 'compras':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (categoria: string) => {
    switch (categoria) {
      case 'calidad':
        return 'Calidad';
      case 'auditoria':
        return 'Auditoría';
      case 'mejora':
        return 'Mejora';
      case 'rrhh':
        return 'RRHH';
      case 'produccion':
        return 'Producción';
      case 'ventas':
        return 'Ventas';
      case 'logistica':
        return 'Logística';
      case 'compras':
        return 'Compras';
      default:
        return 'General';
    }
  };

  const handleEditDefinition = (definition: ProcessDefinition) => {
    setEditingDefinition(definition);
    setShowFormDialog(true);
  };

  const handleFormSuccess = () => {
    fetchDefinitions();
    setEditingDefinition(null);
    setShowFormDialog(false);
  };

  const handleFormClose = () => {
    setShowFormDialog(false);
    setEditingDefinition(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Definiciones de Procesos
              </h1>
              <p className="text-slate-500 mt-2">
                Gestiona las definiciones de procesos del sistema ISO 9001
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Definiciones de Procesos
            </h1>
            <p className="text-slate-500 mt-2">
              Gestiona las definiciones de procesos del sistema ISO 9001
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/procesos/registros">
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver Registros
              </Button>
            </Link>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              onClick={() => setShowFormDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Definición
            </Button>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar definiciones..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={e =>
                    setFilterCategory(e.target.value as typeof filterCategory)
                  }
                  className="px-3 py-2 bg-white border-0 shadow-sm ring-1 ring-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="calidad">Calidad</option>
                  <option value="auditoria">Auditoría</option>
                  <option value="mejora">Mejora</option>
                  <option value="rrhh">RRHH</option>
                  <option value="produccion">Producción</option>
                  <option value="ventas">Ventas</option>
                  <option value="logistica">Logística</option>
                  <option value="compras">Compras</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista de Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={value => setViewMode(value as 'cards' | 'list')}
          className="space-y-6"
        >
          <TabsList className="bg-white/50 border border-slate-200 p-1 rounded-lg">
            <TabsTrigger
              value="cards"
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              Vista de Tarjetas
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
            >
              Vista de Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-0">
            {filteredDefinitions.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-12 w-12 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No hay definiciones de procesos
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Crea tu primera definición de proceso para comenzar
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Definición
                    </Button>
                    <Button
                      onClick={handleSeedData}
                      variant="outline"
                      className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Datos de Prueba
                    </Button>
                    <Button
                      onClick={handleCheckData}
                      variant="outline"
                      className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Verificar Datos
                    </Button>
                    <Button
                      onClick={handleClearData}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpiar Datos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDefinitions.map(definition => (
                  <Card
                    key={definition.id}
                    className="border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 bg-white group"
                    onClick={() =>
                      router.push(
                        `/dashboard/procesos/definiciones/${definition.id}`
                      )
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                            {definition.nombre}
                          </CardTitle>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {definition.descripcion}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-slate-500 bg-slate-50 p-2 rounded-md">
                          <span className="font-medium">Código:</span>
                          <span className="ml-2 font-mono">
                            {definition.codigo}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs mt-2">
                          <Badge
                            className={`${getCategoryColor(
                              definition.categoria || ''
                            )} border-0 px-2 py-1`}
                          >
                            {getCategoryText(definition.categoria || '')}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              definition.activo
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }
                          >
                            {definition.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>

                        <div className="pt-2 flex items-center justify-end">
                          <span className="text-sm font-medium text-emerald-600 group-hover:underline">
                            Ver detalles →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Definición
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Creado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {filteredDefinitions.map(definition => (
                        <tr
                          key={definition.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div
                                className="text-sm font-medium text-slate-900 cursor-pointer hover:text-emerald-600"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/procesos/definiciones/${definition.id}`
                                  )
                                }
                              >
                                {definition.nombre}
                              </div>
                              <div className="text-sm text-slate-500 mt-0.5">
                                {definition.descripcion}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={`${getCategoryColor(
                                definition.categoria || ''
                              )} border-0`}
                            >
                              {getCategoryText(definition.categoria || '')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                definition.activo
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }
                            >
                              {definition.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {definition.created_at
                              ? definition.created_at instanceof Date
                                ? definition.created_at.toLocaleDateString()
                                : new Date(
                                    (
                                      definition.created_at as {
                                        seconds: number;
                                        nanoseconds: number;
                                      }
                                    ).seconds * 1000
                                  ).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditDefinition(definition)}
                              className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para crear/editar definición */}
      <ProcessDefinitionFormDialog
        open={showFormDialog}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editData={editingDefinition}
      />
    </div>
  );
}
