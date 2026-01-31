'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { EvaluationType, Personnel, Training } from '@/types/rrhh';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface EvaluationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EvaluationFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: EvaluationFormDialogProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [systemUsers, setSystemUsers] = useState<Personnel[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    fecha_evaluacion: '',
    tipo: 'evaluacion_competencias' as EvaluationType,
    capacitacionId: '',
    responsable_id: '',
  });

  const loadTrainings = useCallback(async () => {
    try {
      const orgId =
        sessionStorage.getItem('organization_id') ||
        (user as any)?.organization_id;
      if (!orgId) return;

      const response = await fetch(
        `/api/rrhh/trainings?organization_id=${orgId}&limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter completed trainings
        const trainingList = data.data || data;
        setTrainings(
          Array.isArray(trainingList)
            ? trainingList.filter((t: Training) => t.estado === 'completada')
            : []
        );
      }
    } catch (error) {
      console.error('Error loading trainings:', error);
    }
  }, [user]);

  const loadSystemUsers = useCallback(async () => {
    try {
      const orgId =
        sessionStorage.getItem('organization_id') ||
        (user as any)?.organization_id;
      if (!orgId) return;

      const response = await fetch(
        `/api/rrhh/personnel?organization_id=${orgId}&limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        const personnel = data.data || data;
        setSystemUsers(
          Array.isArray(personnel)
            ? personnel.filter((p: Personnel) => p.estado === 'Activo')
            : []
        );
      }
    } catch (error) {
      console.error('Error loading system users:', error);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, fecha_evaluacion: today }));
      loadTrainings();
      loadSystemUsers();
    }
  }, [open, loadTrainings, loadSystemUsers]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-fill title from training
    if (field === 'capacitacionId' && value) {
      const training = trainings.find(t => t.id === value);
      if (training) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          titulo: `Evaluación Eficacia: ${training.tema}`,
        }));
      }
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.organization_id) {
        throw new Error('No se pudo obtener la organización del usuario');
      }

      const responsable = systemUsers.find(
        u => u.user_id === formData.responsable_id
      );

      const payload = {
        titulo: formData.titulo,
        fecha_evaluacion: new Date(formData.fecha_evaluacion),
        tipo: formData.tipo,
        capacitacionId:
          formData.tipo === 'evaluacion_capacitacion'
            ? formData.capacitacionId
            : undefined,
        responsable_id: formData.responsable_id || null,
        responsable_nombre: responsable
          ? `${responsable.nombres} ${responsable.apellidos}`
          : null,
        evaluador_id: (user as any)?.uid || '',
        organization_id: user.organization_id,
        periodo: new Date().toISOString().slice(0, 7),
        estado: 'borrador',
        competencias_a_evaluar: [],
        empleados_evaluados: [],
      };

      const response = await fetch('/api/rrhh/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear evaluación');
      }

      const newEvaluation = await response.json();

      toast({
        title: '✅ Evaluación creada',
        description: `"${formData.titulo}" fue creada exitosamente`,
      });

      setFormData({
        titulo: '',
        fecha_evaluacion: '',
        tipo: 'evaluacion_competencias',
        capacitacionId: '',
        responsable_id: '',
      });

      onOpenChange(false);
      onSuccess?.();

      router.push(`/dashboard/rrhh/evaluations/${newEvaluation.id}`);
    } catch (error: any) {
      console.error('Error creating evaluation:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'No se pudo crear la evaluación',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva Evaluación</DialogTitle>
          <DialogDescription>
            Los empleados y competencias se configurarán en la siguiente
            pantalla
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tipo de Evaluación */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Evaluación *</Label>
            <Select
              value={formData.tipo}
              onValueChange={value => handleChange('tipo', value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evaluacion_competencias">
                  📋 Evaluación de Competencias
                </SelectItem>
                <SelectItem value="evaluacion_capacitacion">
                  🎓 Evaluación de Eficacia (post-capacitación)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Capacitación (solo si tipo = evaluacion_capacitacion) */}
          {formData.tipo === 'evaluacion_capacitacion' && (
            <div className="space-y-2">
              <Label htmlFor="capacitacionId">Capacitación a Evaluar *</Label>
              <Select
                value={formData.capacitacionId}
                onValueChange={value => handleChange('capacitacionId', value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Seleccionar capacitación..." />
                </SelectTrigger>
                <SelectContent>
                  {trainings.length === 0 ? (
                    <SelectItem value="_empty" disabled>
                      No hay capacitaciones completadas
                    </SelectItem>
                  ) : (
                    trainings.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.tema}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Solo se muestran capacitaciones con estado "completada"
              </p>
            </div>
          )}

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título de la Evaluación *</Label>
            <Input
              id="titulo"
              placeholder="Ej: Evaluación Q1 2026 - Área Técnica"
              value={formData.titulo}
              onChange={e => handleChange('titulo', e.target.value)}
              required
              className="focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label htmlFor="fecha_evaluacion">Fecha de Evaluación *</Label>
            <Input
              id="fecha_evaluacion"
              type="date"
              value={formData.fecha_evaluacion}
              onChange={e => handleChange('fecha_evaluacion', e.target.value)}
              required
              className="focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Responsable */}
          <div className="space-y-2">
            <Label htmlFor="responsable_id">Responsable *</Label>
            <Select
              value={formData.responsable_id}
              onValueChange={value => handleChange('responsable_id', value)}
            >
              <SelectTrigger className="bg-white focus:ring-emerald-500 focus:border-emerald-500">
                <SelectValue placeholder="Seleccionar responsable..." />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                {systemUsers.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    No hay usuarios disponibles
                  </SelectItem>
                ) : (
                  systemUsers.map(u => (
                    <SelectItem key={u.id} value={u.user_id!}>
                      {u.nombres} {u.apellidos}
                      {u.puesto ? ` - ${u.puesto}` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Usuario responsable de realizar la evaluación
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.titulo ||
                !formData.fecha_evaluacion ||
                !formData.responsable_id ||
                (formData.tipo === 'evaluacion_capacitacion' &&
                  !formData.capacitacionId)
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              {isSubmitting ? 'Creando...' : 'Crear Evaluación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
