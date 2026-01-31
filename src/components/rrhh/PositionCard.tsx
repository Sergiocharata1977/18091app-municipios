import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Position } from '@/types/rrhh';
import {
  Briefcase,
  Building2,
  Calendar,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  User,
} from 'lucide-react';

interface PositionCardProps {
  position: Position;
  onEdit?: (position: Position) => void;
  onDelete?: (position: Position) => void;
  onView?: (position: Position) => void;
  onCardClick?: (position: Position) => void;
}

export function PositionCard({
  position,
  onEdit,
  onDelete,
  onView,
  onCardClick,
}: PositionCardProps) {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const handleCardClick = () => {
    onCardClick?.(position);
  };

  return (
    <Card
      className="group bg-white hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer border-slate-200 overflow-hidden"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Ver detalles de ${position.nombre}`}
    >
      <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm group-hover:border-emerald-200 group-hover:shadow-md transition-all">
              <Briefcase className="w-5 h-5 text-slate-600 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {position.nombre}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-xs font-normal bg-white text-slate-500 border-slate-200"
                >
                  ID: {position.id}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={e => e.stopPropagation()}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900"
                aria-label={`Opciones para ${position.nombre}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView?.(position)}>
                <Eye className="w-4 h-4 mr-2 text-slate-500" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(position)}>
                <Edit className="w-4 h-4 mr-2 text-slate-500" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(position)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Descripción
            </p>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {position.descripcion_responsabilidades ||
                'Sin descripción disponible'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="truncate">
                Dep:{' '}
                <span className="font-medium text-slate-900">Sin asignar</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span className="truncate">
                Reporta a:{' '}
                <span className="font-medium text-slate-900">Sin definir</span>
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-none font-medium">
              Activo
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(position.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
