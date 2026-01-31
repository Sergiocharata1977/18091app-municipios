'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DepartmentFormData,
  departmentFormSchema,
} from '@/lib/validations/rrhh';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface DepartmentFormProps {
  initialData?: DepartmentFormData;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DepartmentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: initialData || {
      nombre: '',
      descripcion: '',
      responsable_id: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  const handleFormSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la Secretaría *</Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Ingrese el nombre de la secretaría"
          className={errors.nombre ? 'border-red-500' : ''}
        />
        {errors.nombre && (
          <p className="text-sm text-red-500">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          {...register('descripcion')}
          placeholder="Ingrese una descripción de la secretaría"
          rows={3}
          className={errors.descripcion ? 'border-red-500' : ''}
        />
        {errors.descripcion && (
          <p className="text-sm text-red-500">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsable_id">ID Usuario Responsable</Label>
        <Input
          id="responsable_id"
          {...register('responsable_id')}
          placeholder="Ingrese el ID del usuario responsable"
          className={errors.responsable_id ? 'border-red-500' : ''}
        />
        {errors.responsable_id && (
          <p className="text-sm text-red-500">
            {errors.responsable_id.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={isActive}
          onCheckedChange={checked => setValue('is_active', checked as boolean)}
        />
        <Label htmlFor="is_active">Secretaría activa</Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          {isSubmitting || isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
