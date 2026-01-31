import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Personnel } from '@/types/rrhh';
import {
  CheckCircle2,
  Edit,
  Eye,
  GitBranch,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Trash2,
  User,
} from 'lucide-react';

interface PersonnelCardProps {
  personnel: Personnel;
  processMap?: Record<string, string>; // ID -> Name mapping
  onEdit?: (personnel: Personnel) => void;
  onDelete?: (personnel: Personnel) => void;
  onView?: (personnel: Personnel) => void;
  onCardClick?: (personnel: Personnel) => void;
}

export function PersonnelCard({
  personnel,
  processMap = {},
  onEdit,
  onDelete,
  onView,
  onCardClick,
}: PersonnelCardProps) {
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

  const getInitials = (nombres?: string, apellidos?: string) => {
    const firstInitial = nombres?.charAt(0) || '?';
    const lastInitial = apellidos?.charAt(0) || '?';
    return `${firstInitial}${lastInitial}`;
  };

  const formatDate = (
    date: Date | { seconds: number; nanoseconds: number } | undefined
  ) => {
    if (!date) return 'N/A';
    if (typeof date === 'object' && 'seconds' in date) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const handleCardClick = () => {
    onCardClick?.(personnel);
  };

  return (
    <Card
      className="bg-white shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition-all duration-200 rounded-xl border border-slate-200 group"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver detalles de ${personnel.nombres} ${personnel.apellidos}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
              <AvatarImage
                src={personnel.foto || '/placeholder.svg'}
                alt={`${personnel.nombres} ${personnel.apellidos}`}
              />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                {getInitials(personnel.nombres, personnel.apellidos)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {personnel.nombres} {personnel.apellidos}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge
                  variant="outline"
                  className="text-xs border-slate-200 text-slate-500"
                >
                  {personnel.id}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={e => e.stopPropagation()}
                aria-label={`Opciones para ${personnel.nombres} ${personnel.apellidos}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(personnel)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(personnel)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(personnel)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Procesos Asignados - Destacado */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-3 rounded-lg border border-emerald-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <GitBranch className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-700 font-medium mb-1">
                    Procesos Asignados
                  </p>
                  {personnel.procesos_asignados &&
                  personnel.procesos_asignados.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {personnel.procesos_asignados
                        .slice(0, 3)
                        .map((procesoId, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-emerald-100 text-emerald-700"
                          >
                            {processMap[procesoId] || procesoId}
                          </Badge>
                        ))}
                      {personnel.procesos_asignados.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{personnel.procesos_asignados.length - 3} más
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Sin procesos asignados
                    </p>
                  )}
                </div>
              </div>
              {personnel.procesos_asignados &&
                personnel.procesos_asignados.length > 0 && (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {personnel.procesos_asignados.length}
                  </Badge>
                )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 truncate">
              {personnel.email}
            </span>
          </div>

          {personnel.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {personnel.telefono}
              </span>
            </div>
          )}

          {personnel.direccion && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 truncate">
                {personnel.direccion}
              </span>
            </div>
          )}

          {personnel.supervisor_nombre && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Supervisor: {personnel.supervisor_nombre}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(personnel.estado)}>
                {personnel.estado || 'N/A'}
              </Badge>
              {personnel.tiene_acceso_sistema && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                  title="Tiene acceso al sistema"
                >
                  🔐 Sistema
                </Badge>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Ingreso</p>
              <p className="text-sm font-medium">
                {formatDate(personnel.fecha_ingreso)}
              </p>
            </div>
          </div>

          {personnel.salario && (
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Salario</span>
                <span className="text-sm font-medium text-gray-900">
                  {personnel.salario}
                </span>
              </div>
            </div>
          )}

          {personnel.certificaciones &&
            personnel.certificaciones.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Certificaciones:</p>
                <div className="flex flex-wrap gap-1">
                  {personnel.certificaciones.slice(0, 2).map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                  {personnel.certificaciones.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{personnel.certificaciones.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

          {personnel.ultima_evaluacion && (
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Última Evaluación</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(personnel.ultima_evaluacion)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
