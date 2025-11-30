import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Activity,
  Clock,
  Settings,
  Play,
  Pause,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';

interface Monitor {
  id: number;
  name: string;
  description: string;
  monitor_type: string;
  status: string;
  is_active: boolean;
  check_interval: number;
  last_check: string | null;
  next_check: string | null;
  total_checks: number;
  detections_count: number;
  layers: number[];
  agent?: {
    id: number;
    name: string;
  };
  parameters: Record<string, any>;
}

interface Detection {
  id: number;
  monitor: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  detected_at: string;
  location?: any;
  analysis_data: Record<string, any>;
}

export default function MonitoringConfig() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'monitors' | 'detections' | 'settings'>('monitors');
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Removed unused selectedMonitor state

  // Fetch monitors
  const { data: monitorsData } = useQuery({
    queryKey: ['monitors'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/monitors/');
      return data;
    },
  });

  // Fetch recent detections
  const { data: detectionsData } = useQuery({
    queryKey: ['detections'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/detections/');
      return data;
    },
  });

  // Fetch layers for selection
  const { data: layersData } = useQuery({
    queryKey: ['layers'],
    queryFn: async () => {
      const { data } = await api.get('/geodata/layers/');
      return data;
    },
  });

  // Fetch agents for selection
  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await api.get('/agents/agents/');
      return data;
    },
  });

  // Toggle monitor mutation
  const toggleMonitorMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const { data } = await api.patch(`/monitoring/monitors/${id}/`, {
        is_active: isActive,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });

  // Run check mutation
  const runCheckMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/monitoring/monitors/${id}/run-check/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      queryClient.invalidateQueries({ queryKey: ['detections'] });
    },
  });

  // Create monitor mutation
  const createMonitorMutation = useMutation({
    mutationFn: async (monitorData: any) => {
      const { data } = await api.post('/monitoring/monitors/', monitorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      setShowCreateModal(false);
    },
  });

  const monitors: Monitor[] = monitorsData?.results || [];
  const detections: Detection[] = detectionsData?.results || [];
  const layers = layersData?.results || [];
  const agents = agentsData?.results || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Stats
  const stats = {
    totalMonitors: monitors.length,
    activeMonitors: monitors.filter((m) => m.is_active).length,
    totalDetections: detections.length,
    criticalDetections: detections.filter((d) => d.severity === 'critical').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="h-7 w-7 mr-2 text-green-600" />
            Configuración de Monitoreo
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configura monitores automáticos para detectar cambios en tus capas
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Monitor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Monitores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMonitors}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeMonitors}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Detecciones</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDetections}</p>
            </div>
            <Bell className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Críticas</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalDetections}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'monitors', label: 'Monitores', icon: Activity },
            { id: 'detections', label: 'Detecciones', icon: Bell },
            { id: 'settings', label: 'Configuración', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-3 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Monitors Tab */}
      {activeTab === 'monitors' && (
        <div className="space-y-4">
          {monitors.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No hay monitores</h3>
              <p className="text-sm text-gray-500 mb-4">
                Crea un monitor para detectar cambios automáticamente
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear Monitor
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {monitors.map((monitor) => (
                <div
                  key={monitor.id}
                  className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(monitor.status)}
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{monitor.name}</h3>
                        <p className="text-xs text-gray-500">{monitor.monitor_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          toggleMonitorMutation.mutate({
                            id: monitor.id,
                            isActive: !monitor.is_active,
                          })
                        }
                        className={`p-2 rounded-lg ${
                          monitor.is_active
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {monitor.is_active ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => runCheckMutation.mutate(monitor.id)}
                        disabled={runCheckMutation.isPending}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        {runCheckMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{monitor.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Intervalo:</span>
                      <p className="font-medium">{monitor.check_interval} min</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Capas:</span>
                      <p className="font-medium">{monitor.layers?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Verificaciones:</span>
                      <p className="font-medium">{monitor.total_checks}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Detecciones:</span>
                      <p className="font-medium text-orange-600">
                        {monitor.detections_count}
                      </p>
                    </div>
                  </div>

                  {monitor.last_check && (
                    <div className="text-xs text-gray-400 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Última: {new Date(monitor.last_check).toLocaleString()}
                    </div>
                  )}

                  {monitor.agent && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-xs text-gray-500">Agente IA:</span>
                      <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        {monitor.agent.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detections Tab */}
      {activeTab === 'detections' && (
        <div className="space-y-4">
          {detections.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Sin detecciones</h3>
              <p className="text-sm text-gray-500">
                Los monitores aún no han detectado cambios
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Detección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Severidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {detections.map((detection) => (
                    <tr key={detection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{detection.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {detection.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(
                            detection.severity
                          )}`}
                        >
                          {detection.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            detection.status === 'resolved'
                              ? 'bg-green-100 text-green-700'
                              : detection.status === 'investigating'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {detection.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(detection.detected_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuración General
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo mínimo de verificación (minutos)
                </label>
                <input
                  type="number"
                  defaultValue={5}
                  min={1}
                  className="w-full max-w-xs px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retención de detecciones (días)
                </label>
                <input
                  type="number"
                  defaultValue={90}
                  min={7}
                  className="w-full max-w-xs px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Notificaciones por Defecto
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded text-green-600 mr-2" />
                <span className="text-sm text-gray-700">Email para detecciones críticas</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded text-green-600 mr-2" />
                <span className="text-sm text-gray-700">Notificación en app</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-green-600 mr-2" />
                <span className="text-sm text-gray-700">SMS para alertas críticas</span>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* Create Monitor Modal */}
      {showCreateModal && (
        <CreateMonitorModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMonitorMutation.mutate(data)}
          isLoading={createMonitorMutation.isPending}
          layers={layers}
          agents={agents}
        />
      )}
    </div>
  );
}

// Create Monitor Modal Component
function CreateMonitorModal({
  onClose,
  onCreate,
  isLoading,
  layers,
  agents,
}: {
  onClose: () => void;
  onCreate: (data: any) => void;
  isLoading: boolean;
  layers: any[];
  agents: any[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monitor_type: 'change_detection',
    check_interval: 60,
    layer_ids: [] as number[],
    agent_id: '',
    parameters: {},
  });

  const monitorTypes = [
    { value: 'change_detection', label: 'Detección de Cambios' },
    { value: 'threshold', label: 'Umbral' },
    { value: 'anomaly', label: 'Anomalías' },
    { value: 'spatial', label: 'Espacial' },
    { value: 'ai_based', label: 'Basado en IA' },
  ];

  const handleSubmit = () => {
    onCreate({
      ...formData,
      agent_id: formData.agent_id ? parseInt(formData.agent_id) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Crear Monitor</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Monitor de deforestación"
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
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Monitor
              </label>
              <select
                value={formData.monitor_type}
                onChange={(e) =>
                  setFormData({ ...formData, monitor_type: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                {monitorTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo de verificación (minutos)
              </label>
              <input
                type="number"
                value={formData.check_interval}
                onChange={(e) =>
                  setFormData({ ...formData, check_interval: parseInt(e.target.value) })
                }
                min={5}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capas a monitorear
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {layers.map((layer) => (
                  <label key={layer.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={formData.layer_ids.includes(layer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            layer_ids: [...formData.layer_ids, layer.id],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            layer_ids: formData.layer_ids.filter((id) => id !== layer.id),
                          });
                        }
                      }}
                      className="rounded text-green-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">{layer.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agente IA (opcional)
              </label>
              <select
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sin agente</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name || formData.layer_ids.length === 0 || isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Crear Monitor'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
