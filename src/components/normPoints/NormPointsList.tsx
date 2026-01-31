'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NormPoint } from '@/types/normPoints';
import { Edit, Grid, List, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NormPointFormDialog } from './NormPointFormDialog';

export function NormPointsList() {
  const [normPoints, setNormPoints] = useState<NormPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNormPoint, setEditingNormPoint] = useState<NormPoint | null>(
    null
  );
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchNormPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterFilter, priorityFilter]);

  const fetchNormPoints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (chapterFilter !== 'all') params.append('chapter', chapterFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      // Ordenar por código para que aparezcan en orden numérico
      params.append('sort', 'code');
      params.append('order', 'asc');
      params.append('limit', '1000'); // Traer todos los puntos

      const response = await fetch(`/api/norm-points?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Ordenar manualmente por código para asegurar orden correcto
        const sortedPoints = (data.data || []).sort(
          (a: NormPoint, b: NormPoint) => {
            const aNum = parseFloat(a.code.replace(/[^\d.]/g, ''));
            const bNum = parseFloat(b.code.replace(/[^\d.]/g, ''));
            return aNum - bNum;
          }
        );
        setNormPoints(sortedPoints);
      }
    } catch (error) {
      console.error('Error fetching norm points:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este punto de norma?')) return;

    try {
      const response = await fetch(`/api/norm-points/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNormPoints();
      }
    } catch (error) {
      console.error('Error deleting norm point:', error);
    }
  };

  const filteredNormPoints = normPoints.filter(
    np =>
      np.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      np.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      np.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredNormPoints.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNormPoints = filteredNormPoints.slice(startIndex, endIndex);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, chapterFilter, priorityFilter]);

  const getPriorityBadge = (priority: 'alta' | 'media' | 'baja') => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      alta: 'destructive',
      media: 'default',
      baja: 'secondary',
    };

    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Puntos Normativos"
        description="Gestión de requisitos normativos ISO 9001 y otros estándares"
        breadcrumbs={[
          { label: 'Inicio', href: '/dashboard' },
          { label: 'Puntos Normativos' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (
                  confirm(
                    '¿Cargar todos los puntos de ISO 9001:2015? (Solo se crearán los que no existan)'
                  )
                ) {
                  try {
                    const response = await fetch('/api/seed/iso-9001', {
                      method: 'POST',
                    });
                    const data = await response.json();
                    alert(
                      `${data.message}\nCreados: ${data.created}\nOmitidos: ${data.skipped}`
                    );
                    fetchNormPoints();
                  } catch {
                    alert('Error al cargar puntos ISO 9001');
                  }
                }
              }}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              📘 Cargar ISO 9001
            </Button>
            <Button
              onClick={() => {
                setEditingNormPoint(null);
                setIsFormOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Punto
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por código, título o descripción..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <Select value={chapterFilter} onValueChange={setChapterFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Capítulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los capítulos</SelectItem>
            <SelectItem value="4">Capítulo 4</SelectItem>
            <SelectItem value="5">Capítulo 5</SelectItem>
            <SelectItem value="6">Capítulo 6</SelectItem>
            <SelectItem value="7">Capítulo 7</SelectItem>
            <SelectItem value="8">Capítulo 8</SelectItem>
            <SelectItem value="9">Capítulo 9</SelectItem>
            <SelectItem value="10">Capítulo 10</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-50 border-slate-200">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>

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
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contador de resultados */}
      {!loading && (
        <div className="text-sm text-slate-600">
          Mostrando {startIndex + 1}-
          {Math.min(endIndex, filteredNormPoints.length)} de{' '}
          {filteredNormPoints.length} puntos
        </div>
      )}

      {/* Vista Lista o Tarjetas */}
      {loading ? (
        <div className="text-center py-8 text-slate-600">
          Cargando puntos de norma...
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedNormPoints.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-600">
              No se encontraron puntos de norma
            </div>
          ) : (
            paginatedNormPoints.map(np => (
              <div
                key={np.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all duration-200 p-4"
                onClick={() => {
                  window.location.href = `/puntos-norma/${np.id}`;
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-600">
                        {np.code}
                      </span>
                      {np.is_mandatory && (
                        <Badge variant="destructive" className="text-xs">
                          Obligatorio
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-slate-900">
                      {np.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="capitalize">
                      {np.tipo_norma.replace('_', ' ')}
                    </span>
                    {np.chapter && (
                      <Badge variant="outline" className="text-xs">
                        Cap. {np.chapter}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Prioridad:</span>
                    {getPriorityBadge(np.priority)}
                  </div>
                </div>

                <div
                  className="flex gap-2 mt-3 pt-3 border-t border-slate-100"
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingNormPoint(np);
                      setIsFormOpen(true);
                    }}
                    title="Editar"
                    className="flex-1 hover:bg-slate-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(np.id)}
                    title="Eliminar"
                    className="flex-1 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">
                  Código
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Título
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Tipo
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Capítulo
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Prioridad
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Obligatorio
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNormPoints.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-600"
                  >
                    No se encontraron puntos de norma
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNormPoints.map(np => (
                  <TableRow
                    key={np.id}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                    onClick={() => {
                      window.location.href = `/puntos-norma/${np.id}`;
                    }}
                  >
                    <TableCell className="font-medium text-emerald-600">
                      {np.code}
                    </TableCell>
                    <TableCell className="text-slate-900">{np.title}</TableCell>
                    <TableCell className="capitalize text-slate-600">
                      {np.tipo_norma.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {np.chapter || '-'}
                    </TableCell>
                    <TableCell>{getPriorityBadge(np.priority)}</TableCell>
                    <TableCell>
                      {np.is_mandatory ? (
                        <Badge variant="destructive">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNormPoint(np);
                            setIsFormOpen(true);
                          }}
                          title="Editar"
                          className="hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(np.id)}
                          title="Eliminar"
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>

            {/* Números de página */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de formulario */}
      <NormPointFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        normPoint={editingNormPoint}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingNormPoint(null);
          fetchNormPoints();
        }}
      />
    </div>
  );
}
