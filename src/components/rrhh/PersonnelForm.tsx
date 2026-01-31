'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Textarea } from '@/components/ui/textarea';
import { PersonnelFormData, personnelFormSchema } from '@/lib/validations/rrhh';
import { Personnel } from '@/types/rrhh';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface PersonnelFormProps {
  initialData?: Personnel | null;
  onSubmit: (data: PersonnelFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PersonnelForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PersonnelFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tieneAccesoSistema, setTieneAccesoSistema] = useState(
    initialData?.tiene_acceso_sistema || false
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelFormSchema) as any,
    defaultValues: initialData
      ? {
          nombres: initialData.nombres || '',
          apellidos: initialData.apellidos || '',
          email: initialData.email || '',
          telefono: initialData.telefono || '',
          direccion: initialData.direccion || '',
          puesto: initialData.puesto || '',
          departamento: initialData.departamento || '',
          supervisor: initialData.supervisor_nombre || '',
          estado: initialData.estado || ('Activo' as const),
          fecha_ingreso:
            initialData.fecha_ingreso instanceof Date
              ? initialData.fecha_ingreso
              : new Date(),
          salario: initialData.salario || '',
          foto: initialData.foto || '',
          certificaciones: initialData.certificaciones || [],
          meta_mensual: initialData.meta_mensual || 0,
          comision_porcentaje: initialData.comision_porcentaje || 0,
          tipo_personal:
            initialData.tipo_personal || ('administrativo' as const),
          tiene_acceso_sistema: initialData.tiene_acceso_sistema || false,
        }
      : {
          nombres: '',
          apellidos: '',
          email: '',
          telefono: '',
          direccion: '',
          puesto: '',
          departamento: '',
          supervisor: '',
          estado: 'Activo' as const,
          fecha_ingreso: new Date(),
          salario: '',
          foto: '',
          certificaciones: [],
          meta_mensual: 0,
          comision_porcentaje: 0,
          tipo_personal: 'administrativo' as const,
          tiene_acceso_sistema: false,
        },
  });

  const handleFormSubmit = async (data: PersonnelFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Editar Empleado' : 'Crear Empleado'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Información Personal */}
          <div className="space-y-4">
            <SectionHeader title="Información Personal" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  {...register('nombres')}
                  placeholder="Ej. Juan Carlos"
                  className={`mt-1.5 focus:ring-emerald-500 focus:border-emerald-500 ${errors.nombres ? 'border-red-500' : ''}`}
                />
                {errors.nombres && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.nombres.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  {...register('apellidos')}
                  placeholder="Ej. Pérez González"
                  className={`mt-1.5 focus:ring-emerald-500 focus:border-emerald-500 ${errors.apellidos ? 'border-red-500' : ''}`}
                />
                {errors.apellidos && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.apellidos.message}
                  </p>
                )}
              </div>
            </div>

            {/* Acceso al Sistema */}
            <div className="space-y-4 p-4 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="tiene_acceso_sistema"
                  {...register('tiene_acceso_sistema')}
                  checked={tieneAccesoSistema}
                  onChange={e => {
                    const checked = e.target.checked;
                    setTieneAccesoSistema(checked);
                    setValue('tiene_acceso_sistema', checked);
                    if (!checked) {
                      setValue('email', '');
                    }
                  }}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="tiene_acceso_sistema"
                    className="font-semibold text-emerald-900"
                  >
                    Este empleado necesita acceso al sistema
                  </Label>
                  <p className="text-sm text-emerald-700 mt-1">
                    Si marcas esta opción, se creará un usuario y se enviará una
                    invitación por email
                  </p>
                </div>
              </div>

              {tieneAccesoSistema && (
                <div className="mt-4">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="juan.perez@empresa.com"
                    className={`mt-1.5 focus:ring-emerald-500 focus:border-emerald-500 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Se enviará una invitación a este email para configurar la
                    contraseña
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...register('telefono')}
                  placeholder="+54 11 1234-5678"
                  className={`mt-1.5 focus:ring-emerald-500 focus:border-emerald-500 ${errors.telefono ? 'border-red-500' : ''}`}
                />
                {errors.telefono && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.telefono.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="documento_identidad">
                  Documento de Identidad
                </Label>
                <Input
                  id="documento_identidad"
                  {...register('documento_identidad')}
                  placeholder="DNI, Pasaporte, etc."
                  className={`mt-1.5 focus:ring-emerald-500 focus:border-emerald-500 ${errors.documento_identidad ? 'border-red-500' : ''}`}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                {...register('direccion')}
                placeholder="Dirección completa"
                className={`mt-1.5 focus:ring-emerald-500 focus:border-emerald-500 ${errors.direccion ? 'border-red-500' : ''}`}
              />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.direccion.message}
                </p>
              )}
            </div>
          </div>

          {/* Información Laboral */}
          <div className="space-y-4">
            <SectionHeader title="Información Laboral" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <Input
                  id="supervisor"
                  {...register('supervisor')}
                  placeholder="Nombre del supervisor"
                  className={`mt-1.5 focus:ring-emerald-500 focus:border-emerald-500 ${errors.supervisor ? 'border-red-500' : ''}`}
                />
                {errors.supervisor && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supervisor.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  {...register('estado')}
                  className="w-full h-10 mt-1.5 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Activo">Activo</option>
                  <option value="Licencia">Licencia</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                {errors.estado && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.estado.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
                <Input
                  id="fecha_ingreso"
                  type="date"
                  {...register('fecha_ingreso', {
                    setValueAs: value => (value ? new Date(value) : new Date()),
                  })}
                  className={`mt-1.5 ${errors.fecha_ingreso ? 'border-red-500' : ''}`}
                />
                {errors.fecha_ingreso && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fecha_ingreso.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  {...register('salario')}
                  placeholder="Ej. $65,000"
                  className={`mt-1.5 ${errors.salario ? 'border-red-500' : ''}`}
                />
                {errors.salario && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.salario.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="foto">URL de Foto</Label>
              <Input
                id="foto"
                {...register('foto')}
                placeholder="https://ejemplo.com/foto.jpg"
                className={`mt-1.5 ${errors.foto ? 'border-red-500' : ''}`}
              />
              {errors.foto && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.foto.message}
                </p>
              )}
            </div>
          </div>

          {/* Certificaciones */}
          <div className="space-y-4">
            <SectionHeader title="Certificaciones" />
            <div>
              <Label htmlFor="certificaciones">
                Certificaciones (separadas por comas)
              </Label>
              <Input
                id="certificaciones"
                {...register('certificaciones', {
                  setValueAs: value => {
                    if (!value) return [];
                    if (typeof value === 'string') {
                      return value
                        .split(',')
                        .map((cert: string) => cert.trim());
                    }
                    return Array.isArray(value) ? value : [];
                  },
                })}
                placeholder="ISO 9001, Análisis de Datos, Six Sigma"
                className={`mt-1.5 ${errors.certificaciones ? 'border-red-500' : ''}`}
              />
              {errors.certificaciones && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.certificaciones.message}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              {isLoading || isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
