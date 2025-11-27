import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BellIcon, PlusIcon, Activity, PlayIcon, PauseIcon, Trash2Icon, Eye, AlertTriangleIcon } from 'lucide-react';
import CreateMonitor from '../../components/monitoring/CreateMonitor';

// Mock data para monitores
const mockMonitors = [
  {
    id: 1,
    name: 'Monitor de Zonas Inundables',
    layer: 1,
    layer_name: 'Zonas de Riesgo Inundación',
    monitor_type: 'change_detection',
    frequency: 3600,
    is_active: true,
    last_run: '2024-11-26T10:30:00Z',
    next_run: '2024-11-26T11:30:00Z',
    detections_count: 12,
  },
  {
    id: 2,
    name: 'Alertas Meteorológicas',
    layer: 2,
    layer_name: 'Estaciones Meteorológicas',
    monitor_type: 'threshold_alert',
    frequency: 900,
    is_active: true,
    last_run: '2024-11-26T10:45:00Z',
    next_run: '2024-11-26T11:00:00Z',
    detections_count: 3,
  },
  {
    id: 3,
    name: 'Cambios en Red Vial',
    layer: 3,
    layer_name: 'Red Vial Principal',
    monitor_type: 'spatial_pattern',
    frequency: 86400,
    is_active: false,
    last_run: '2024-11-25T08:00:00Z',
    next_run: null,
    detections_count: 0,
  },
];

// Mock data para detecciones
const mockDetections = [
  {
    id: 1,
    monitor: 1,
    monitor_name: 'Monitor de Zonas Inundables',
    detection_type: 'change_detected',
    severity: 'high',
    description: 'Nueva zona de riesgo detectada en sector norte',
    detected_at: '2024-11-26T10:30:00Z',
    metadata: { area_affected: '2.5 km²', confidence: 0.87 },
  },
  {
    id: 2,
    monitor: 2,
    monitor_name: 'Alertas Meteorológicas',
    detection_type: 'threshold_exceeded',
    severity: 'critical',
    description: 'Precipitación supera 100mm en estación #5',
    detected_at: '2024-11-26T09:15:00Z',
    metadata: { value: 127.5, threshold: 100, station_id: 5 },
  },
  {
    id: 3,
    monitor: 1,
    monitor_name: 'Monitor de Zonas Inundables',
    detection_type: 'anomaly',
    severity: 'medium',
    description: 'Patrón anómalo en distribución de puntos',
    detected_at: '2024-11-26T08:00:00Z',
    metadata: { anomaly_score: 0.73 },
  },
];

export default function Monitoring() {
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitors' | 'detections'>('monitors');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getFrequencyLabel = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${seconds / 60}m`;
    if (seconds < 86400) return `${seconds / 3600}h`;
    return `${seconds / 86400}d`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Monitoreo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitoreo automático y detecciones en tiempo real
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Monitor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monitores Activos</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {mockMonitors.filter(m => m.is_active).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Detecciones Hoy</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {mockDetections.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                <BellIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Alta Severidad</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {mockDetections.filter(d => d.severity === 'critical' || d.severity === 'high').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Monitores</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {mockMonitors.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('monitors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monitors'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Activity className="inline-block h-5 w-5 mr-2" />
            Monitores ({mockMonitors.length})
          </button>
          <button
            onClick={() => setActiveTab('detections')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detections'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AlertTriangleIcon className="inline-block h-5 w-5 mr-2" />
            Detecciones ({mockDetections.length})
          </button>
        </nav>
      </div>

      {/* Contenido de Monitores */}
      {activeTab === 'monitors' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {mockMonitors.map((monitor) => (
              <li key={monitor.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${monitor.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Activity className={`h-5 w-5 ${monitor.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{monitor.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          monitor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {monitor.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Capa: {monitor.layer_name} • Tipo: {monitor.monitor_type}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span>Frecuencia: {getFrequencyLabel(monitor.frequency)}</span>
                        {monitor.last_run && <span>Última ejecución: {formatDate(monitor.last_run)}</span>}
                        {monitor.detections_count > 0 && (
                          <span className="text-orange-600 font-medium">
                            {monitor.detections_count} detecciones
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      title={monitor.is_active ? 'Pausar' : 'Activar'}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {monitor.is_active ? (
                        <PauseIcon className="h-5 w-5" />
                      ) : (
                        <PlayIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      title="Ver detalles"
                      className="p-2 text-gray-400 hover:text-blue-600"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      title="Eliminar"
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contenido de Detecciones */}
      {activeTab === 'detections' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {mockDetections.map((detection) => (
              <li key={detection.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <AlertTriangleIcon className={`h-5 w-5 mt-0.5 ${
                      detection.severity === 'critical' ? 'text-red-500' :
                      detection.severity === 'high' ? 'text-orange-500' :
                      detection.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{detection.description}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(detection.severity)}`}>
                          {detection.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Monitor: {detection.monitor_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Detectado: {formatDate(detection.detected_at)}
                      </p>
                      {detection.metadata && (
                        <div className="mt-2 text-xs text-gray-600">
                          <pre className="bg-gray-50 p-2 rounded">
                            {JSON.stringify(detection.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  <button className="ml-4 text-sm text-blue-600 hover:text-blue-700">
                    Ver en mapa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal de crear monitor */}
      {showCreate && <CreateMonitor onClose={() => setShowCreate(false)} />}
    </div>
  );
}
