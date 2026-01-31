'use client';

import { ProcessQualityObjectives } from '@/components/procesos/ProcessQualityObjectives';
import { AIAssistButton } from '@/components/ui/AIAssistButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  PROCESS_CATEGORIES,
  ProcessCategoryId,
  ProcessDefinition,
} from '@/types/processRecords';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Edit,
  FileText,
  Layers,
  Maximize2,
  Plus,
  Target,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

// Tipos para el estado de edición
type EditingSection =
  | 'info'
  | 'clasificacion_iso'
  | 'objetivo'
  | 'alcance'
  | 'funciones'
  | 'descripcion_detallada'
  | 'jefe_proceso'
  | null;

interface PersonnelOption {
  id: string;
  nombre_completo: string;
  puesto?: string;
}

export default function ProcessDefinitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const definitionId = params.id as string;

  const [definition, setDefinition] = useState<ProcessDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Estados de edición temporal
  const [editValues, setEditValues] = useState<Partial<ProcessDefinition>>({});
  const [personnel, setPersonnel] = useState<PersonnelOption[]>([]);
  const [newFuncion, setNewFuncion] = useState('');

  // Validación de código duplicado
  const [codeValidation, setCodeValidation] = useState<{
    checking: boolean;
    available: boolean | null;
    existingName?: string;
  }>({ checking: false, available: null });
  const codeCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const loadDefinition = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/process-definitions/${definitionId}`);
      if (response.ok) {
        const data = await response.json();
        setDefinition(data);
      }
    } catch (error) {
      console.error('Error loading definition:', error);
    } finally {
      setLoading(false);
    }
  }, [definitionId]);

  const loadPersonnel = async () => {
    try {
      // Using Admin SDK endpoint
      const response = await fetch(
        `/api/personnel-list?organization_id=${user?.organization_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setPersonnel(data || []);
      }
    } catch (error) {
      console.error('Error loading personnel:', error);
    }
  };

  useEffect(() => {
    loadDefinition();
  }, [loadDefinition]);

  const handleStartEdit = (section: EditingSection) => {
    if (!definition) return;
    setEditingSection(section);

    // Cargar personal si es necesario
    if (section === 'jefe_proceso' && personnel.length === 0) {
      loadPersonnel();
    }

    // Inicializar valores de edición
    switch (section) {
      case 'info':
        setEditValues({
          codigo: definition.codigo,
          nombre: definition.nombre,
          descripcion: definition.descripcion,
          categoria: definition.categoria,
        });
        break;
      case 'clasificacion_iso':
        setEditValues({
          category_id: definition.category_id,
          process_code: definition.process_code,
        });
        break;
      case 'objetivo':
        setEditValues({ objetivo: definition.objetivo });
        break;
      case 'alcance':
        setEditValues({ alcance: definition.alcance });
        break;
      case 'funciones':
        setEditValues({
          funciones_involucradas: [
            ...(definition.funciones_involucradas || []),
          ],
        });
        break;
      case 'descripcion_detallada':
        setEditValues({
          etapas_default: [...(definition.etapas_default || [])],
        });
        break;
      case 'jefe_proceso':
        setEditValues({
          jefe_proceso_id: definition.jefe_proceso_id,
          jefe_proceso_nombre: definition.jefe_proceso_nombre,
        });
        break;
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditValues({});
    setNewFuncion('');
  };

  const handleSaveSection = async () => {
    if (!definition || !editingSection) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/process-definitions/${definitionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      if (response.ok) {
        // Actualizar estado local
        setDefinition({ ...definition, ...editValues });
        setEditingSection(null);
        setEditValues({});
      } else {
        alert('Error al guardar los cambios');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFuncion = () => {
    if (!newFuncion.trim()) return;
    const current = editValues.funciones_involucradas || [];
    if (!current.includes(newFuncion.trim())) {
      setEditValues({
        ...editValues,
        funciones_involucradas: [...current, newFuncion.trim()],
      });
    }
    setNewFuncion('');
  };

  const handleRemoveFuncion = (func: string) => {
    const current = editValues.funciones_involucradas || [];
    setEditValues({
      ...editValues,
      funciones_involucradas: current.filter(f => f !== func),
    });
  };

  const handleJefeProcesoChange = (personnelId: string) => {
    const selectedPerson = personnel.find(p => p.id === personnelId);
    setEditValues({
      ...editValues,
      jefe_proceso_id: personnelId,
      jefe_proceso_nombre: selectedPerson?.nombre_completo || '',
    });
  };

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      calidad: 'bg-blue-100 text-blue-800',
      auditoria: 'bg-purple-100 text-purple-800',
      mejora: 'bg-green-100 text-green-800',
      rrhh: 'bg-yellow-100 text-yellow-800',
      produccion: 'bg-orange-100 text-orange-800',
      ventas: 'bg-pink-100 text-pink-800',
      logistica: 'bg-indigo-100 text-indigo-800',
      compras: 'bg-teal-100 text-teal-800',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  // Componente para botón de editar sección
  const EditButton = ({
    section,
    className = '',
  }: {
    section: EditingSection;
    className?: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleStartEdit(section)}
      className={`h-10 w-10 p-0 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 ${className}`}
    >
      <Edit className="h-5 w-5" />
    </Button>
  );

  // Componente para botones de guardar/cancelar
  const SaveCancelButtons = () => (
    <div className="flex gap-2 mt-4">
      <Button
        onClick={handleSaveSection}
        disabled={saving}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Check className="h-4 w-4 mr-1" />
        {saving ? 'Guardando...' : 'Guardar'}
      </Button>
      <Button onClick={handleCancelEdit} variant="outline" size="sm">
        <X className="h-4 w-4 mr-1" />
        Cancelar
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Definición no encontrada
          </h3>
          <p className="text-gray-500 mb-4">
            La definición de proceso que buscas no existe
          </p>
          <Button onClick={() => router.push('/dashboard/procesos')}>
            Volver a Procesos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {definition.nombre}
              </h1>
              {definition.category_id && (
                <Badge
                  className={
                    PROCESS_CATEGORIES[definition.category_id]?.color ||
                    'bg-gray-100'
                  }
                >
                  {PROCESS_CATEGORIES[definition.category_id]?.label}
                </Badge>
              )}
              <Badge className="bg-purple-100 text-purple-800">
                v{definition.version || 1}
              </Badge>
              {definition.vigente !== false ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Vigente
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  Histórico
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1 font-mono">
              Código:{' '}
              {definition.category_id && definition.process_code
                ? `${definition.category_id}-${definition.process_code}`
                : definition.codigo || 'Sin asignar'}
            </p>
          </div>
        </div>
        {/* Botón Publicar Nueva Versión */}
        {definition.vigente !== false && (
          <Button
            variant="outline"
            className="border-purple-500 text-purple-700 hover:bg-purple-50"
            onClick={() => {
              // TODO: Implementar publicación de nueva versión
              alert(
                'Próximamente: Publicar nueva versión con los cambios actuales'
              );
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Publicar Nueva Versión
          </Button>
        )}
      </div>

      {/* Layout 70/30 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 70% - Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
              {editingSection !== 'info' && <EditButton section="info" />}
            </CardHeader>
            <CardContent>
              {editingSection === 'info' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nombre
                    </label>
                    <Input
                      value={editValues.nombre || ''}
                      onChange={e =>
                        setEditValues({ ...editValues, nombre: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-medium text-gray-600">
                        Descripción
                      </label>
                      <AIAssistButton
                        context={{
                          modulo: 'procesos',
                          tipo: 'proceso',
                          datos: {
                            nombre: editValues.nombre || definition.nombre,
                          },
                        }}
                        onGenerate={texto =>
                          setEditValues({ ...editValues, descripcion: texto })
                        }
                        label="✨ Sugerir con IA"
                        className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                      />
                    </div>
                    <Textarea
                      value={editValues.descripcion || ''}
                      onChange={e =>
                        setEditValues({
                          ...editValues,
                          descripcion: e.target.value,
                        })
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Categoría
                    </label>
                    <select
                      value={editValues.categoria || 'calidad'}
                      onChange={e =>
                        setEditValues({
                          ...editValues,
                          categoria: e.target.value,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
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
                  <SaveCancelButtons />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600">
                      Nombre
                    </div>
                    <div className="text-gray-900 mt-1">
                      {definition.nombre}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">
                      Descripción
                    </div>
                    <div className="text-gray-900 mt-1">
                      {definition.descripcion || '—'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clasificación ISO 9001 */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                Clasificación ISO 9001
              </CardTitle>
              {editingSection !== 'clasificacion_iso' && (
                <EditButton section="clasificacion_iso" />
              )}
            </CardHeader>
            <CardContent>
              {editingSection === 'clasificacion_iso' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nivel / Categoría
                    </label>
                    <select
                      value={editValues.category_id || ''}
                      onChange={e =>
                        setEditValues({
                          ...editValues,
                          category_id: parseInt(
                            e.target.value
                          ) as ProcessCategoryId,
                        })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seleccionar nivel...</option>
                      <option value="1">1 - Estrategia</option>
                      <option value="2">2 - Soporte</option>
                      <option value="3">3 - Operativo (Core)</option>
                      <option value="4">4 - Evaluación</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Código del Proceso (2-4 letras)
                    </label>
                    <Input
                      value={editValues.process_code || ''}
                      onChange={e =>
                        setEditValues({
                          ...editValues,
                          process_code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="Ej: CO, COM, DES, PLAN"
                      maxLength={4}
                      className={`mt-1 uppercase ${
                        codeValidation.available === false
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : codeValidation.available === true
                            ? 'border-green-500 focus:border-green-500'
                            : ''
                      }`}
                    />
                    {/* Indicador de validación */}
                    {codeValidation.checking && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full"></span>
                        Verificando disponibilidad...
                      </p>
                    )}
                    {!codeValidation.checking &&
                      codeValidation.available === false && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Este código ya está en uso por:{' '}
                          <strong>{codeValidation.existingName}</strong>
                        </p>
                      )}
                    {!codeValidation.checking &&
                      codeValidation.available === true && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Código disponible
                        </p>
                      )}
                    <p className="text-xs text-gray-500 mt-1">
                      Este código será el prefijo para documentos (ej:
                      PRO-CO-001)
                    </p>
                  </div>
                  <SaveCancelButtons />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-600">
                      Nivel
                    </div>
                    <div className="mt-1">
                      {definition.category_id ? (
                        <Badge
                          className={
                            PROCESS_CATEGORIES[definition.category_id]?.color ||
                            'bg-gray-100'
                          }
                        >
                          {definition.category_id} -{' '}
                          {PROCESS_CATEGORIES[definition.category_id]?.label}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 italic">
                          Sin clasificar
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">
                      Código
                    </div>
                    <div className="text-gray-900 mt-1 font-mono text-lg">
                      {definition.process_code || (
                        <span className="text-gray-400 italic text-base">
                          Sin código
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objetivo */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objetivo del Proceso
              </CardTitle>
              {editingSection !== 'objetivo' && (
                <EditButton section="objetivo" />
              )}
            </CardHeader>
            <CardContent>
              {editingSection === 'objetivo' ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Redacta el objetivo del proceso
                    </span>
                    <AIAssistButton
                      context={{
                        modulo: 'procesos',
                        tipo: 'proceso',
                        campo: 'objetivo',
                        datos: { nombre: definition.nombre },
                      }}
                      onGenerate={texto =>
                        setEditValues({ ...editValues, objetivo: texto })
                      }
                      label="✨ Sugerir objetivo"
                      className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                    />
                  </div>
                  <Textarea
                    value={editValues.objetivo || ''}
                    onChange={e =>
                      setEditValues({ ...editValues, objetivo: e.target.value })
                    }
                    rows={4}
                    placeholder="Describe el objetivo del proceso..."
                  />
                  <SaveCancelButtons />
                </div>
              ) : (
                <div className="text-gray-900 whitespace-pre-wrap">
                  {definition.objetivo || (
                    <span className="text-gray-400 italic">
                      Sin objetivo definido
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alcance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                Alcance
              </CardTitle>
              {editingSection !== 'alcance' && <EditButton section="alcance" />}
            </CardHeader>
            <CardContent>
              {editingSection === 'alcance' ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      Define el alcance del proceso
                    </span>
                    <AIAssistButton
                      context={{
                        modulo: 'procesos',
                        tipo: 'proceso',
                        campo: 'alcance',
                        datos: { nombre: definition.nombre },
                      }}
                      onGenerate={texto =>
                        setEditValues({ ...editValues, alcance: texto })
                      }
                      label="✨ Sugerir alcance"
                      className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                    />
                  </div>
                  <Textarea
                    value={editValues.alcance || ''}
                    onChange={e =>
                      setEditValues({ ...editValues, alcance: e.target.value })
                    }
                    rows={4}
                    placeholder="Describe el alcance del proceso..."
                  />
                  <SaveCancelButtons />
                </div>
              ) : (
                <div className="text-gray-900 whitespace-pre-wrap">
                  {definition.alcance || (
                    <span className="text-gray-400 italic">
                      Sin alcance definido
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funciones Involucradas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Funciones Involucradas
              </CardTitle>
              {editingSection !== 'funciones' && (
                <EditButton section="funciones" />
              )}
            </CardHeader>
            <CardContent>
              {editingSection === 'funciones' ? (
                <div>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newFuncion}
                      onChange={e => setNewFuncion(e.target.value)}
                      placeholder="Agregar función..."
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFuncion();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddFuncion}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(editValues.funciones_involucradas || []).map(
                      (func, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm py-1 px-3 flex items-center gap-1"
                        >
                          {func}
                          <button
                            type="button"
                            onClick={() => handleRemoveFuncion(func)}
                            className="hover:text-red-600 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    )}
                  </div>
                  <SaveCancelButtons />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {definition.funciones_involucradas &&
                  definition.funciones_involucradas.length > 0 ? (
                    definition.funciones_involucradas.map((func, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm py-1 px-3"
                      >
                        {func}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      No hay funciones asignadas
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción Detallada del Proceso (antes Etapas) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Descripción Detallada del Proceso
              </CardTitle>
              {editingSection !== 'descripcion_detallada' && (
                <EditButton section="descripcion_detallada" />
              )}
            </CardHeader>
            <CardContent>
              {editingSection === 'descripcion_detallada' ? (
                <div>
                  <Textarea
                    value={(editValues.etapas_default || []).join('\n')}
                    onChange={e =>
                      setEditValues({
                        ...editValues,
                        etapas_default: e.target.value
                          .split('\n')
                          .filter(line => line.trim()),
                      })
                    }
                    rows={6}
                    placeholder="Una etapa por línea..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Ingresa una etapa por línea
                  </p>
                  <SaveCancelButtons />
                </div>
              ) : (
                <div>
                  {definition.etapas_default &&
                  definition.etapas_default.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-2">
                      {definition.etapas_default.map((etapa, index) => (
                        <li key={index} className="text-gray-900">
                          {etapa}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-400 italic text-sm">
                      No hay descripción detallada definida
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Objetivos de Calidad, Indicadores y Mediciones */}
          <Card>
            <ProcessQualityObjectives
              processId={definitionId}
              onNavigateToQuality={() =>
                router.push('/dashboard/quality/objetivos')
              }
            />
          </Card>
        </div>

        {/* 30% - Sidebar */}
        <div className="space-y-6">
          {/* Jefe de Proceso */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                Jefe de Proceso
              </CardTitle>
              {editingSection !== 'jefe_proceso' && (
                <EditButton section="jefe_proceso" />
              )}
            </CardHeader>
            <CardContent>
              {editingSection === 'jefe_proceso' ? (
                <div>
                  <select
                    value={editValues.jefe_proceso_id || ''}
                    onChange={e => handleJefeProcesoChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Sin jefe asignado</option>
                    {personnel.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.nombre_completo}
                        {person.puesto && ` - ${person.puesto}`}
                      </option>
                    ))}
                  </select>
                  <SaveCancelButtons />
                </div>
              ) : definition.jefe_proceso_nombre ? (
                <div className="text-sm font-semibold text-gray-900">
                  {definition.jefe_proceso_nombre}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin asignar</p>
              )}
            </CardContent>
          </Card>

          {/* Documentación Asociada */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Documentación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {definition.documentos_ids &&
              definition.documentos_ids.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {definition.documentos_ids.length} documento(s) vinculado(s)
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Documentos
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-400 italic mb-2">
                    Sin documentos vinculados
                  </p>
                  <Button variant="outline" size="sm" className="text-blue-600">
                    <Plus className="h-4 w-4 mr-1" />
                    Vincular Documento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registros del Proceso */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600" />
                Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Tipo de registros */}
                <div className="text-sm">
                  <span className="text-gray-600">Tipo: </span>
                  <Badge variant="outline" className="ml-1">
                    {definition.tipo_registros === 'vincular' &&
                      'Vinculados a módulo'}
                    {definition.tipo_registros === 'crear' &&
                      'Propios del proceso'}
                    {definition.tipo_registros === 'ambos' && 'Ambos'}
                    {!definition.tipo_registros && 'Propios del proceso'}
                  </Badge>
                </div>

                {/* Módulo vinculado */}
                {definition.modulo_vinculado && (
                  <div className="text-sm">
                    <span className="text-gray-600">Módulo: </span>
                    <Badge className="ml-1 bg-amber-100 text-amber-800">
                      {definition.modulo_vinculado === 'mejoras' &&
                        '📈 Mejoras'}
                      {definition.modulo_vinculado === 'auditorias' &&
                        '📋 Auditorías'}
                      {definition.modulo_vinculado === 'nc' &&
                        '⚠️ No Conformidades'}
                    </Badge>
                  </div>
                )}

                {/* Contador y acciones */}
                <div className="text-center py-2 border-t mt-2 pt-3">
                  <p className="text-2xl font-bold text-emerald-600">0</p>
                  <p className="text-xs text-gray-500">registros activos</p>
                </div>

                <div className="flex gap-2">
                  {(definition.tipo_registros === 'vincular' ||
                    definition.tipo_registros === 'ambos') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-amber-600"
                    >
                      Vincular
                    </Button>
                  )}
                  {(definition.tipo_registros === 'crear' ||
                    definition.tipo_registros === 'ambos' ||
                    !definition.tipo_registros) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-emerald-600"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nuevo
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Creado</div>
                  <div className="text-gray-900">
                    {definition.created_at instanceof Date
                      ? definition.created_at.toLocaleDateString('es-ES')
                      : typeof definition.created_at === 'object' &&
                          'seconds' in definition.created_at
                        ? new Date(
                            definition.created_at.seconds * 1000
                          ).toLocaleDateString('es-ES')
                        : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Última actualización</div>
                  <div className="text-gray-900">
                    {definition.updated_at instanceof Date
                      ? definition.updated_at.toLocaleDateString('es-ES')
                      : typeof definition.updated_at === 'object' &&
                          'seconds' in definition.updated_at
                        ? new Date(
                            definition.updated_at.seconds * 1000
                          ).toLocaleDateString('es-ES')
                        : '—'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
