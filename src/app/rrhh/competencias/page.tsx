'use client';

import { CompetenceFormDialog } from '@/components/rrhh/CompetenceFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/PageHeader';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Competence } from '@/types/rrhh';
import {
  BookOpen,
  Briefcase,
  Eye,
  FileText,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function CompetenciasPage() {
  const router = useRouter();
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchCompetences();
  }, []);

  const fetchCompetences = async () => {
    try {
      const response = await fetch('/api/rrhh/competencias');
      if (response.ok) {
        const data = await response.json();
        setCompetences(data);
      }
    } catch (error) {
      console.error('Error fetching competences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetences = useMemo(() => {
    return competences.filter(competence => {
      const matchesSearch =
        competence.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (competence.descripcion &&
          competence.descripcion
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'all' || competence.categoria === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [competences, searchTerm, categoryFilter]);

  const handleView = useCallback(
    (id: string) => {
      router.push(`/rrhh/competencias/${id}`);
    },
    [router]
  );

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta competencia?')) return;

    try {
      const response = await fetch(`/api/rrhh/competencias/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCompetences(prev => prev.filter(comp => comp.id !== id));
      }
    } catch (error) {
      console.error('Error deleting competence:', error);
    }
  }, []);

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'tecnica':
        return <Briefcase className="h-5 w-5" />;
      case 'blanda':
        return <Users className="h-5 w-5" />;
      case 'seguridad':
        return <Shield className="h-5 w-5" />;
      case 'iso_9001':
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryText = (categoria: string) => {
    switch (categoria) {
      case 'tecnica':
        return 'Técnica';
      case 'blanda':
        return 'Blanda';
      case 'seguridad':
        return 'Seguridad';
      case 'iso_9001':
        return 'ISO 9001';
      default:
        return 'Otra';
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'tecnica':
        return 'bg-blue-100 text-blue-800';
      case 'blanda':
        return 'bg-purple-100 text-purple-800';
      case 'seguridad':
        return 'bg-red-100 text-red-800';
      case 'iso_9001':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        title="Competencias"
        description="Gestión del catálogo maestro de competencias"
        breadcrumbs={[
          { label: 'RRHH', href: '/rrhh' },
          { label: 'Competencias' },
        ]}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Competencia
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar competencias..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm"
        >
          <option value="all">Todas las categorías</option>
          <option value="tecnica">Técnica</option>
          <option value="blanda">Blanda</option>
          <option value="seguridad">Seguridad</option>
          <option value="iso_9001">ISO 9001</option>
          <option value="otra">Otra</option>
        </select>
        <ViewToggle view={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Content */}
      {filteredCompetences.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay competencias
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primera competencia
          </p>
          <div className="mt-6">
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Competencia
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCompetences.map(competence => (
            <Card
              key={competence.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleView(competence.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                    {getCategoryIcon(competence.categoria)}
                  </div>
                  <Badge className={getCategoryColor(competence.categoria)}>
                    {getCategoryText(competence.categoria)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {competence.nombre}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {competence.descripcion || 'Sin descripción'}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                  <span className="capitalize">
                    {competence.fuente?.replace('_', ' ')}
                  </span>
                  {competence.activo ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Activa
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800 text-xs">
                      Inactiva
                    </Badge>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      handleView(competence.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(competence.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CompetenceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchCompetences}
      />
    </div>
  );
}
