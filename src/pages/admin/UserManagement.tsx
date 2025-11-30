import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Shield,
  UserPlus,
  Settings,
  Edit,
  Search,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';
import api from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  profile?: {
    phone?: string;
    organization?: string;
    department?: string;
    position?: string;
    access_justification?: string;
    role?: {
      id: number;
      name: string;
      role_type: string;
    };
    area?: {
      id: number;
      name: string;
    };
    approval_status: string;
  };
}

interface Role {
  id: number;
  name: string;
  role_type: string;
  description: string;
  can_upload_layers: boolean;
  can_view_layers: boolean;
  can_edit_layers: boolean;
  can_delete_layers: boolean;
  can_download_layers: boolean;
  can_create_analysis: boolean;
  can_view_analysis: boolean;
  can_delete_analysis: boolean;
  can_upload_agents: boolean;
  can_create_monitors: boolean;
  can_view_monitors: boolean;
  can_configure_alerts: boolean;
  can_manage_users: boolean;
  can_approve_users: boolean;
  can_create_areas: boolean;
  can_share_resources: boolean;
  can_export_reports: boolean;
  can_view_audit_logs: boolean;
  is_system_role: boolean;
}

interface Area {
  id: number;
  name: string;
  description: string;
}

export default function UserManagementAdvanced() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'roles' | 'areas'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users/users/');
      return data;
    },
  });

  // Fetch pending approvals
  const { data: pendingData } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const { data } = await api.get('/users/users/pending-approvals/');
      return data;
    },
  });

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data } = await api.get('/users/roles/');
      return data;
    },
  });

  // Fetch areas
  const { data: areasData } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const { data } = await api.get('/users/areas/');
      return data;
    },
  });

  // Approve/Reject mutation
  const approveRejectMutation = useMutation({
    mutationFn: async ({ userId, action, roleId, areaId, reason }: any) => {
      const { data } = await api.post(`/users/users/${userId}/approve-reject/`, {
        action,
        role_id: roleId,
        area_id: areaId,
        rejection_reason: reason,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: any }) => {
      const response = await api.patch(`/users/users/${userId}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditModal(false);
    },
  });

  // Create/Update role mutation
  const saveRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      if (roleData.id) {
        const { data } = await api.patch(`/users/roles/${roleData.id}/`, roleData);
        return data;
      } else {
        const { data } = await api.post('/users/roles/', roleData);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowRoleModal(false);
    },
  });

  const users: User[] = usersData?.results || usersData || [];
  const pendingUsers: User[] = pendingData || [];
  const roles: Role[] = rolesData?.results || rolesData || [];
  const areas: Area[] = areasData?.results || areasData || [];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      !filterRole || user.profile?.role?.role_type === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleApprove = (userId: number, roleId: number, areaId?: number) => {
    approveRejectMutation.mutate({
      userId,
      action: 'approve',
      roleId,
      areaId,
    });
  };

  const handleReject = (userId: number, reason: string) => {
    approveRejectMutation.mutate({
      userId,
      action: 'reject',
      reason,
    });
  };

  const getRoleColor = (roleType: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      area_admin: 'bg-blue-100 text-blue-800',
      analyst_ai: 'bg-green-100 text-green-800',
      loader: 'bg-yellow-100 text-yellow-800',
      monitor_analyst: 'bg-orange-100 text-orange-800',
      viewer: 'bg-gray-100 text-gray-800',
      downloader: 'bg-cyan-100 text-cyan-800',
      editor: 'bg-pink-100 text-pink-800',
    };
    return colors[roleType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-7 w-7 mr-2 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        {pendingUsers.length > 0 && (
          <div className="flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 font-medium">
              {pendingUsers.length} solicitudes pendientes
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'users', label: 'Usuarios', icon: Users, count: users.length },
            { id: 'pending', label: 'Pendientes', icon: Clock, count: pendingUsers.length },
            { id: 'roles', label: 'Roles', icon: Shield, count: roles.length },
            { id: 'areas', label: 'Áreas', icon: MapPin, count: areas.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-3 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    tab.id === 'pending' && tab.count > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuarios..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.role_type}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Último acceso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.first_name?.[0] || user.username[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.profile?.role && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(
                            user.profile.role.role_type
                          )}`}
                        >
                          {user.profile.role.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.profile?.area?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Settings className="h-4 w-4 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                No hay solicitudes pendientes
              </h3>
              <p className="text-sm text-gray-500">
                Todas las solicitudes han sido procesadas
              </p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <PendingUserCard
                key={user.id}
                user={user}
                roles={roles}
                areas={areas}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={approveRejectMutation.isPending}
              />
            ))
          )}
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setSelectedRole(null);
                setShowRoleModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Shield className="h-4 w-4 mr-2" />
              Crear Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => {
                  setSelectedRole(role);
                  setShowRoleModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Areas Tab */}
      {activeTab === 'areas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">{area.name}</h3>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{area.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          areas={areas}
          onClose={() => setShowEditModal(false)}
          onSave={(data) =>
            updateUserMutation.mutate({ userId: selectedUser.id, data })
          }
          isLoading={updateUserMutation.isPending}
        />
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <RoleModal
          role={selectedRole}
          onClose={() => setShowRoleModal(false)}
          onSave={(data) => saveRoleMutation.mutate(data)}
          isLoading={saveRoleMutation.isPending}
        />
      )}
    </div>
  );
}

// Pending User Card Component
function PendingUserCard({
  user,
  roles,
  areas,
  onApprove,
  onReject,
  isLoading,
}: {
  user: User;
  roles: Role[];
  areas: Area[];
  onApprove: (userId: number, roleId: number, areaId?: number) => void;
  onReject: (userId: number, reason: string) => void;
  isLoading: boolean;
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<number>(
    user.profile?.role?.id || roles[0]?.id || 0
  );
  const [selectedAreaId, setSelectedAreaId] = useState<number | undefined>(
    user.profile?.area?.id
  );
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-gray-900">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400">
              Solicitado: {new Date(user.date_joined).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Organización:</span>
          <p className="font-medium">{user.profile?.organization || '-'}</p>
        </div>
        <div>
          <span className="text-gray-500">Cargo:</span>
          <p className="font-medium">{user.profile?.position || '-'}</p>
        </div>
      </div>

      {user.profile?.access_justification && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Justificación:</p>
          <p className="text-sm text-gray-700">{user.profile.access_justification}</p>
        </div>
      )}

      {!showReject ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Asignar Rol</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Asignar Área</label>
              <select
                value={selectedAreaId || ''}
                onChange={(e) =>
                  setSelectedAreaId(e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Sin área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => onApprove(user.id, selectedRoleId, selectedAreaId)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Aprobar
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              <UserX className="h-4 w-4 mr-2" />
              Rechazar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Motivo del rechazo</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Explica el motivo..."
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowReject(false)}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onReject(user.id, rejectReason)}
              disabled={!rejectReason || isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Confirmar Rechazo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Role Card Component
function RoleCard({ role, onEdit }: { role: Role; onEdit: () => void }) {
  const permissions = [
    { key: 'can_upload_layers', label: 'Subir capas' },
    { key: 'can_view_layers', label: 'Ver capas' },
    { key: 'can_edit_layers', label: 'Editar capas' },
    { key: 'can_delete_layers', label: 'Eliminar capas' },
    { key: 'can_create_analysis', label: 'Crear análisis' },
    { key: 'can_upload_agents', label: 'Subir agentes' },
    { key: 'can_manage_users', label: 'Gestionar usuarios' },
  ];

  const activePermissions = permissions.filter(
    (p) => role[p.key as keyof Role]
  );

  return (
    <div className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">{role.name}</h3>
        </div>
        {!role.is_system_role && (
          <button onClick={onEdit} className="p-1 hover:bg-gray-100 rounded">
            <Edit className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3">{role.description}</p>

      <div className="flex flex-wrap gap-1">
        {activePermissions.slice(0, 4).map((p) => (
          <span
            key={p.key}
            className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
          >
            {p.label}
          </span>
        ))}
        {activePermissions.length > 4 && (
          <span className="text-xs text-gray-500">
            +{activePermissions.length - 4} más
          </span>
        )}
      </div>

      {role.is_system_role && (
        <p className="text-xs text-gray-400 mt-2">Rol del sistema (no editable)</p>
      )}
    </div>
  );
}

// Edit User Modal
function EditUserModal({
  user,
  roles,
  areas,
  onClose,
  onSave,
  isLoading,
}: {
  user: User;
  roles: Role[];
  areas: Area[];
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    is_active: user.is_active,
    role_id: user.profile?.role?.id,
    area_id: user.profile?.area?.id,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-semibold mb-4">
            Editar {user.first_name} {user.last_name}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.value === 'active' })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={formData.role_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, role_id: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área
              </label>
              <select
                value={formData.area_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    area_id: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sin área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Role Modal (simplified)
function RoleModal({
  role,
  onClose,
  onSave,
  isLoading,
}: {
  role: Role | null;
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    id: role?.id,
    name: role?.name || '',
    description: role?.description || '',
    role_type: role?.role_type || 'custom',
    can_upload_layers: role?.can_upload_layers || false,
    can_view_layers: role?.can_view_layers || true,
    can_edit_layers: role?.can_edit_layers || false,
    can_delete_layers: role?.can_delete_layers || false,
    can_download_layers: role?.can_download_layers || false,
    can_create_analysis: role?.can_create_analysis || false,
    can_view_analysis: role?.can_view_analysis || true,
    can_upload_agents: role?.can_upload_agents || false,
    can_manage_users: role?.can_manage_users || false,
  });

  const permissions = [
    { key: 'can_upload_layers', label: 'Subir capas' },
    { key: 'can_view_layers', label: 'Ver capas' },
    { key: 'can_edit_layers', label: 'Editar capas' },
    { key: 'can_delete_layers', label: 'Eliminar capas' },
    { key: 'can_download_layers', label: 'Descargar capas' },
    { key: 'can_create_analysis', label: 'Crear análisis' },
    { key: 'can_view_analysis', label: 'Ver análisis' },
    { key: 'can_upload_agents', label: 'Subir agentes' },
    { key: 'can_manage_users', label: 'Gestionar usuarios' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
          <h3 className="text-lg font-semibold mb-4">
            {role ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos
              </label>
              <div className="grid grid-cols-2 gap-2">
                {permissions.map((perm) => (
                  <label key={perm.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[perm.key as keyof typeof formData] as boolean}
                      onChange={(e) =>
                        setFormData({ ...formData, [perm.key]: e.target.checked })
                      }
                      className="rounded text-blue-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={isLoading || !formData.name}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
