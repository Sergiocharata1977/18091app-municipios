'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Shield,
  Activity,
  FileText,
  BookOpen,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Brain,
  Target,
  BarChart3,
  Users,
  Folder,
} from 'lucide-react';

interface UserContextData {
  user: {
    displayName?: string;
    email?: string;
    role?: string;
  };
  personnel: {
    nombre?: string;
    apellido?: string;
    legajo?: string;
    email?: string;
    telefono?: string;
  };
  position: {
    nombre?: string;
    descripcion?: string;
  };
  department: {
    nombre?: string;
    descripcion?: string;
  };
  procesos: Array<{
    id: string;
    nombre: string;
    codigo?: string;
    tipo?: string;
  }>;
  objetivos: Array<{
    id: string;
    descripcion: string;
    meta?: string;
    estado?: string;
  }>;
  indicadores: Array<{
    id: string;
    nombre: string;
    formula?: string;
    frecuencia?: string;
  }>;
  supervisor?: {
    nombre: string;
    apellido: string;
  };
  processRecords?: Array<{
    id: string;
    name: string;
  }>;
}

export default function UserProfilePage() {
  const [context, setContext] = useState<UserContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState<
    Array<{
      id: string;
      title: string;
      code: string;
    }>
  >([]);

  useEffect(() => {
    fetchUserContext();
    fetchRecentDocuments();
  }, []);

  const fetchUserContext = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ia/context?userId=current-user');
      if (response.ok) {
        const data = await response.json();
        setContext(data.contexto);
        console.log('Contexto del usuario:', data.contexto);
      }
    } catch (error) {
      console.error('Error fetching context:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshContext = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/ia/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' }),
      });

      if (response.ok) {
        const data = await response.json();
        setContext(data.contexto);
      }
    } catch (error) {
      console.error('Error refreshing context:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchRecentDocuments = async () => {
    try {
      const response = await fetch(
        '/api/documents?limit=5&sort=updated_at&order=desc'
      );
      if (response.ok) {
        const data = await response.json();
        setRecentDocuments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando contexto del usuario...</p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No se pudo cargar el contexto</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            Mi Contexto de IA
          </h1>
          <p className="text-gray-600 mt-1">
            Información que Don Cándido usa para personalizar tus respuestas
          </p>
        </div>
        <Button
          onClick={handleRefreshContext}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Actualizando...' : 'Actualizar Contexto'}
        </Button>
      </div>

      {/* User Info Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {context.user?.displayName || context.user?.email || 'Usuario'}
              </h2>
              <p className="text-purple-100 flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {context.user?.email || 'No disponible'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {context.user?.role || 'Usuario'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <Folder className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-600">
            {context.procesos?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Procesos Asignados</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">
            {context.objetivos?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Objetivos de Calidad</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-600">
            {context.indicadores?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Indicadores</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">
            {context.processRecords?.length || 0}
          </p>
          <p className="text-sm text-gray-600">Registros de Proceso</p>
        </div>
      </div>

      {/* Main Context Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personnel Info */}
        {context.personnel && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información de Personal
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre Completo
                </label>
                <p className="text-gray-900">
                  {context.personnel.nombre} {context.personnel.apellido}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Legajo
                </label>
                <p className="text-gray-900">{context.personnel.legajo}</p>
              </div>
              {context.personnel.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{context.personnel.email}</p>
                </div>
              )}
              {context.personnel.telefono && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Teléfono
                  </label>
                  <p className="text-gray-900">{context.personnel.telefono}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Position & Department */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            Puesto y Departamento
          </h3>
          <div className="space-y-4">
            {context.position && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  Puesto
                </label>
                <p className="text-gray-900 font-medium">
                  {context.position.nombre}
                </p>
                {context.position.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">
                    {context.position.descripcion}
                  </p>
                )}
              </div>
            )}
            {context.department && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Departamento
                </label>
                <p className="text-gray-900 font-medium">
                  {context.department.nombre}
                </p>
                {context.department.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">
                    {context.department.descripcion}
                  </p>
                )}
              </div>
            )}
            {context.supervisor && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Supervisor
                </label>
                <p className="text-gray-900">
                  {context.supervisor.nombre} {context.supervisor.apellido}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Procesos Asignados */}
      {context.procesos && context.procesos.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            Procesos Asignados
            <Badge variant="outline">{context.procesos.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {context.procesos.map(proceso => (
              <div
                key={proceso.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <p className="font-medium text-gray-900">{proceso.nombre}</p>
                <p className="text-sm text-gray-500 mt-1">{proceso.codigo}</p>
                {proceso.tipo && (
                  <Badge variant="outline" className="mt-2">
                    {proceso.tipo}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objetivos de Calidad */}
      {context.objetivos && context.objetivos.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Objetivos de Calidad
            <Badge variant="outline">{context.objetivos.length}</Badge>
          </h3>
          <div className="space-y-3">
            {context.objetivos.map(objetivo => (
              <div
                key={objetivo.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {objetivo.descripcion}
                    </p>
                    {objetivo.meta && (
                      <p className="text-sm text-gray-600 mt-1">
                        Meta: {objetivo.meta}
                      </p>
                    )}
                  </div>
                  {objetivo.estado && (
                    <Badge
                      variant={
                        objetivo.estado === 'cumplido' ? 'default' : 'secondary'
                      }
                    >
                      {objetivo.estado}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicadores */}
      {context.indicadores && context.indicadores.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Indicadores de Desempeño
            <Badge variant="outline">{context.indicadores.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {context.indicadores.map(indicador => (
              <div
                key={indicador.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <p className="font-medium text-gray-900">{indicador.nombre}</p>
                {indicador.formula && (
                  <p className="text-sm text-gray-600 mt-1">
                    Fórmula: {indicador.formula}
                  </p>
                )}
                {indicador.frecuencia && (
                  <Badge variant="outline" className="mt-2">
                    {indicador.frecuencia}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos Recientes */}
      {recentDocuments.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Documentos Recientes
          </h3>
          <div className="space-y-2">
            {recentDocuments.map(doc => (
              <div
                key={doc.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => (window.location.href = `/documentos/${doc.id}`)}
              >
                <p className="font-medium text-gray-900">{doc.title}</p>
                <p className="text-sm text-gray-500">{doc.code}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Brain className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">
              ¿Cómo usa Don Cándido este contexto?
            </h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>
                • Personaliza las respuestas según tu puesto y departamento
              </li>
              <li>• Conoce los procesos que gestionas</li>
              <li>• Entiende tus objetivos e indicadores de calidad</li>
              <li>
                • Puede sugerir acciones basadas en tu contexto específico
              </li>
              <li>• Filtra información relevante para tu rol</li>
            </ul>
            <p className="text-sm text-purple-700 mt-3">
              💡 Este contexto se actualiza automáticamente cada 5 minutos o
              puedes actualizarlo manualmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
