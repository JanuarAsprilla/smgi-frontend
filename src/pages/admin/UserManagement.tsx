import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { Users, CheckCircle, XCircle, Clock, Loader2, Eye, UserCheck, UserX } from 'lucide-react';
import ApprovalModal from '../../components/admin/ApprovalModal';

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['pendingUsers'],
    queryFn: userService.getPendingApprovals,
  });

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: userService.getAllUsers,
  });

  const handleApprove = (user: any) => {
    setSelectedUser(user);
    setShowApprovalModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pendiente' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Aprobado' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Rechazado' },
      suspended: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: UserX, label: 'Suspendido' },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aprobar solicitudes y gestionar usuarios del sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Pendientes</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {pendingUsers?.length || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Aprobados</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {allUsers?.filter((u: any) => u.profile?.approval_status === 'approved').length || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-red-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Rechazados</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {allUsers?.filter((u: any) => u.profile?.approval_status === 'rejected').length || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Usuarios</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {allUsers?.length || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solicitudes Pendientes */}
      {pendingUsers && pendingUsers.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-600" />
              Solicitudes Pendientes ({pendingUsers.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingUsers.map((user: any) => (
              <div key={user.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                      {getStatusBadge(user.profile.approval_status)}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-600">{user.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Teléfono:</span>
                        <span className="ml-2 text-gray-600">{user.profile.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Organización:</span>
                        <span className="ml-2 text-gray-600">{user.profile.organization || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Departamento:</span>
                        <span className="ml-2 text-gray-600">{user.profile.department || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Cargo:</span>
                        <span className="ml-2 text-gray-600">{user.profile.position || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Rol Solicitado:</span>
                        <span className="ml-2 text-gray-600">{user.profile.role?.name || 'N/A'}</span>
                      </div>
                    </div>

                    {user.profile.access_justification && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-900">Justificación:</p>
                        <p className="text-sm text-blue-800 mt-1">{user.profile.access_justification}</p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Solicitado: {new Date(user.date_joined).toLocaleString('es-ES')}
                    </div>
                  </div>

                  <div className="ml-6 flex-shrink-0 flex flex-col space-y-2">
                    <button
                      onClick={() => handleApprove(user)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleApprove(user)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin solicitudes pendientes */}
      {pendingUsers && pendingUsers.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes pendientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Todas las solicitudes han sido procesadas.
          </p>
        </div>
      )}

      {/* Modal de Aprobación */}
      {showApprovalModal && selectedUser && (
        <ApprovalModal
          user={selectedUser}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['pendingUsers'] });
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
            setShowApprovalModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
