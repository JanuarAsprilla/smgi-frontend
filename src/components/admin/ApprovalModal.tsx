import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApprovalModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApprovalModal({ user, onClose, onSuccess }: ApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [roleId, setRoleId] = useState(user.profile.role?.id?.toString() || '');
  const [areaId, setAreaId] = useState(user.profile.area?.id?.toString() || '');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: userService.getRoles,
  });

  const { data: areas } = useQuery({
    queryKey: ['areas'],
    queryFn: userService.getAreas,
  });

  const approvalMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) => 
      userService.approveReject(userId, data),
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = { action };

    if (action === 'approve') {
      data.role_id = parseInt(roleId);
      if (areaId) data.area_id = parseInt(areaId);
    } else {
      data.rejection_reason = rejectionReason;
    }

    approvalMutation.mutate({ userId: user.id, data });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {action === 'approve' ? 'Aprobar Usuario' : 'Rechazar Usuario'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Usuario Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
            {user.profile.organization && (
              <p className="text-sm text-gray-600 mt-1">{user.profile.organization}</p>
            )}
          </div>

          {/* Action Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Acción</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAction('approve')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center ${
                  action === 'approve'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-medium">Aprobar</span>
              </button>
              <button
                type="button"
                onClick={() => setAction('reject')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <XCircle className="h-5 w-5 mr-2 text-red-600" />
                <span className="font-medium">Rechazar</span>
              </button>
            </div>
          </div>

          {/* Approve Fields */}
          {action === 'approve' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol Asignado <span className="text-red-500">*</span>
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecciona un rol</option>
                  {roles?.map((role: any) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área (Opcional)
                </label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sin área específica</option>
                  {areas?.results?.map((area: any) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ El usuario recibirá un email de confirmación con sus credenciales de acceso.
                </p>
              </div>
            </>
          )}

          {/* Reject Fields */}
          {action === 'reject' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del Rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  rows={4}
                  placeholder="Explica el motivo del rechazo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ⚠️ El usuario recibirá un email con el motivo del rechazo.
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {approvalMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                Error al procesar la solicitud. Intenta de nuevo.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={approvalMutation.isPending}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-md ${
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {approvalMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Procesando...
                </>
              ) : action === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar Usuario
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar Usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
