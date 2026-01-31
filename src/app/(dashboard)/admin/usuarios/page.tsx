'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { AssignPersonnelDialog } from '@/components/users/AssignPersonnelDialog';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { ModulosDialog } from '@/components/users/ModulosDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Eye,
  Key,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  disabled: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime?: string;
  };
  customClaims?: {
    role?: string;
    personnelId?: string;
  };
  // Multi-tenant fields
  organization_id?: string | null;
  rol?: string;
  personnelData?: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    procesos_asignados: string[];
    tiene_acceso_sistema: boolean;
  } | null;
  relationshipStatus?: 'ok' | 'broken' | 'none';
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { usuario, loading: userLoading } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignPersonnelDialog, setShowAssignPersonnelDialog] =
    useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    uid: string;
    email: string;
    modulos_habilitados?: string[] | null;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModulosDialog, setShowModulosDialog] = useState(false);
  const [creatingPersonnelFor, setCreatingPersonnelFor] = useState<
    string | null
  >(null);

  // Determine if current user is super_admin
  const isSuperAdmin = usuario?.rol === 'super_admin';

  useEffect(() => {
    // Wait for user to load before fetching users
    if (!userLoading && usuario) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, usuario?.organization_id]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Build API URL with organization filter
      let apiUrl = '/api/users/list';
      if (!isSuperAdmin && usuario?.organization_id) {
        apiUrl += `?organization_id=${usuario.organization_id}`;
      } else if (isSuperAdmin) {
        // Super admin sees all users
        apiUrl += '?include_all=true';
      }

      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Email de restablecimiento enviado',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el email',
        variant: 'destructive',
      });
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/users/sync', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Sincronización completada',
          description: `Se sincronizaron ${data.stats.syncedUsers} usuarios. Total: ${data.stats.totalAuthUsers}`,
        });
        await fetchUsers();
      } else {
        throw new Error('Error en la sincronización');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo sincronizar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoCreatePersonnel = async (user: User) => {
    try {
      setCreatingPersonnelFor(user.uid);

      // Extract name from email (before @) as fallback
      const emailName = user.email.split('@')[0];
      const nameParts = emailName.split('.');
      const nombres = nameParts[0]
        ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)
        : emailName;
      const apellidos = nameParts[1]
        ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)
        : '';

      const response = await fetch('/api/personnel/auto-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          nombres,
          apellidos,
          role: user.customClaims?.role || user.rol || 'operario',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Personal creado',
          description: `Se creó el registro de personal para ${user.email}`,
        });
        await fetchUsers();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear personal');
      }
    } catch (error) {
      console.error('Error creating personnel:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'No se pudo crear el personal',
        variant: 'destructive',
      });
    } finally {
      setCreatingPersonnelFor(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => !u.disabled).length,
    withPersonnel: users.filter(u => u.customClaims?.personnelId).length,
    admins: users.filter(u => u.customClaims?.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios del Sistema"
        description="Administra los usuarios con acceso al sistema ISO 9001"
        breadcrumbs={[
          { label: 'Administración', href: '/admin' },
          { label: 'Usuarios' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`}
              />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Con Personnel</p>
                <p className="text-2xl font-bold">{stats.withPersonnel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Email
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Rol
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Personnel
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Estado
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700 text-sm">
                    Último Acceso
                  </th>
                  <th className="text-right p-4 font-medium text-slate-700 text-sm">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr
                      key={user.uid}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{user.email}</span>
                          {user.emailVerified && (
                            <Badge variant="outline" className="text-xs">
                              ✓ Verificado
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={
                            user.customClaims?.role === 'admin'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {user.customClaims?.role || 'Usuario'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.customClaims?.personnelId ? (
                          <div className="flex items-center gap-2">
                            {user.relationshipStatus === 'ok' ? (
                              <Badge
                                className="bg-green-100 text-green-800"
                                title={
                                  user.personnelData
                                    ? `${user.personnelData.nombres} ${user.personnelData.apellidos}`
                                    : 'Vinculado'
                                }
                              >
                                ✓ Vinculado
                              </Badge>
                            ) : (
                              <Badge
                                className="bg-red-100 text-red-800"
                                title="Relación rota: Los datos no coinciden"
                              >
                                ⚠️ Error
                              </Badge>
                            )}
                            {user.personnelData &&
                              user.personnelData.procesos_asignados.length >
                                0 && (
                                <Badge
                                  variant="outline"
                                  className="text-blue-600"
                                  title={`${user.personnelData.procesos_asignados.length} procesos asignados`}
                                >
                                  📋{' '}
                                  {user.personnelData.procesos_asignados.length}
                                </Badge>
                              )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Sin vincular
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {user.disabled ? (
                          <Badge variant="destructive">Inactivo</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            Activo
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.metadata.lastSignInTime
                          ? new Date(
                              user.metadata.lastSignInTime
                            ).toLocaleDateString('es-ES')
                          : 'Nunca'}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {!user.customClaims?.personnelId ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAutoCreatePersonnel(user)}
                                disabled={creatingPersonnelFor === user.uid}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                title="Crear personal automáticamente"
                              >
                                {creatingPersonnelFor === user.uid ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <UserPlus className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser({
                                    uid: user.uid,
                                    email: user.email,
                                  });
                                  setShowAssignPersonnelDialog(true);
                                }}
                                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                                title="Asignar personnel existente"
                              >
                                Asignar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                router.push(
                                  `/dashboard/rrhh/personnel/${user.customClaims?.personnelId}`
                                )
                              }
                              title="Ver personnel"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser({
                                uid: user.uid,
                                email: user.email,
                              });
                              setShowModulosDialog(true);
                            }}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Configurar módulos habilitados"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResetPassword(user.email)}
                            title="Resetear contraseña"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser({
                                uid: user.uid,
                                email: user.email,
                              });
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchUsers}
      />

      {/* Assign Personnel Dialog */}
      {selectedUser && (
        <AssignPersonnelDialog
          open={showAssignPersonnelDialog}
          onOpenChange={setShowAssignPersonnelDialog}
          userId={selectedUser.uid}
          userEmail={selectedUser.email}
          onSuccess={fetchUsers}
        />
      )}

      {/* Delete User Dialog */}
      {selectedUser && (
        <DeleteUserDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          userId={selectedUser.uid}
          userEmail={selectedUser.email}
          onSuccess={fetchUsers}
        />
      )}

      {/* Modulos Dialog */}
      {selectedUser && (
        <ModulosDialog
          open={showModulosDialog}
          onOpenChange={setShowModulosDialog}
          userId={selectedUser.uid}
          userEmail={selectedUser.email}
          currentModulos={selectedUser.modulos_habilitados}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
