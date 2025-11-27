import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlayCircle, PauseCircle, CheckCircle2, XCircle, Clock, Eye, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';

// Mock data de procesos
const mockProcesses = [
  {
    id: 1,
    name: 'Análisis de Riesgo - Zona Norte',
    layers: ['Zonas de Riesgo Inundación', 'Estaciones Meteorológicas'],
    agent: { name: 'Gemini Pro Geo', type: 'gemini' },
    status: 'completed',
    progress: 100,
    analysis_type: 'risk_analysis',
    started_at: '2024-11-26T08:00:00Z',
    completed_at: '2024-11-26T08:45:00Z',
    is_monitoring: false,
    results: {
      summary: 'Análisis completado exitosamente. Se identificaron 23 zonas de alto riesgo.',
      high_risk_zones: 23,
      medium_risk_zones: 45,
      low_risk_zones: 120,
      insights: [
        'Mayor concentración de riesgo en sector noreste',
        'Correlación detectada entre proximidad a ríos y nivel de riesgo',
        'Recomendación: priorizar evacuación en 5 zonas críticas'
      ]
    }
  },
  {
    id: 2,
    name: 'Detección de Cambios - Red Vial',
    layers: ['Red Vial Principal', 'Áreas Protegidas'],
    agent: { name: 'GPT-4 Spatial', type: 'gpt' },
    status: 'running',
    progress: 67,
    analysis_type: 'change_detection',
    started_at: '2024-11-26T10:15:00Z',
    is_monitoring: true,
    monitoring_frequency: 3600,
  },
  {
    id: 3,
    name: 'Clasificación de Cobertura Vegetal',
    layers: ['Cobertura Vegetal'],
    agent: { name: 'Claude 3 Sonnet', type: 'claude' },
    status: 'pending',
    progress: 0,
    analysis_type: 'classification',
    created_at: '2024-11-26T11:00:00Z',
    is_monitoring: false,
  },
  {
    id: 4,
    name: 'Monitor Continuo - Zonas Inundables',
    layers: ['Zonas de Riesgo Inundación', 'Estaciones Meteorológicas'],
    agent: { name: 'Gemini Pro Geo', type: 'gemini' },
    status: 'running',
    progress: 100,
    analysis_type: 'anomaly_detection',
    started_at: '2024-11-25T08:00:00Z',
    is_monitoring: true,
    monitoring_frequency: 900,
    executions: 47,
    last_detection: '2024-11-26T10:30:00Z',
  },
  {
    id: 5,
    name: 'Análisis Espacial Completo',
    layers: ['Zonas de Riesgo Inundación', 'Red Vial Principal', 'Áreas Protegidas'],
    agent: { name: 'GPT-4 Spatial', type: 'gpt' },
    status: 'failed',
    progress: 34,
    analysis_type: 'spatial_pattern',
    started_at: '2024-11-25T14:00:00Z',
    failed_at: '2024-11-25T14:20:00Z',
    error: 'Error al procesar geometrías complejas',
    is_monitoring: false,
  },
];

export default function Processes() {
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusIcon = (status: string, progress: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'running':
        return <PlayCircle className="h-6 w-6 text-blue-500 animate-pulse" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-gray-400" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      completed: 'Completado',
      failed: 'Fallido',
      running: 'En Proceso',
      pending: 'En Cola',
    };
    return labels[status as keyof typeof labels] || status;
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

  const getFrequencyLabel = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${seconds / 60}m`;
    if (seconds < 86400) return `${seconds / 3600}h`;
    return `${seconds / 86400}d`;
  };

  const filteredProcesses = filterStatus === 'all' 
    ? mockProcesses 
    : mockProcesses.filter(p => p.status === filterStatus);

  const stats = {
    total: mockProcesses.length,
    running: mockProcesses.filter(p => p.status === 'running').length,
    completed: mockProcesses.filter(p => p.status === 'completed').length,
    monitoring: mockProcesses.filter(p => p.is_monitoring).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Procesos de Análisis</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona y monitorea los procesos de análisis geoespacial con IA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Procesos</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.total}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">En Proceso</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.running}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Completados</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.completed}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-orange-500">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Monitoreando</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.monitoring}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'running', label: 'En Proceso' },
              { value: 'completed', label: 'Completados' },
              { value: 'pending', label: 'En Cola' },
              { value: 'failed', label: 'Fallidos' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-3 py-1 text-sm rounded-md ${
                  filterStatus === filter.value
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de procesos */}
      <div className="space-y-4">
        {filteredProcesses.map((process) => (
          <div key={process.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              {/* Header del proceso */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getStatusIcon(process.status, process.progress)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{process.name}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(process.status)}`}>
                        {getStatusLabel(process.status)}
                      </span>
                      {process.is_monitoring && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          🔄 Monitoreo Activo
                        </span>
                      )}
                    </div>

                    {/* Información del proceso */}
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Capas:</span> {process.layers.join(', ')}
                      </p>
                      <p>
                        <span className="font-medium">Agente:</span> {process.agent.name} ({process.agent.type.toUpperCase()})
                      </p>
                      <p>
                        <span className="font-medium">Tipo:</span> {process.analysis_type}
                      </p>
                      {process.is_monitoring && process.monitoring_frequency && (
                        <p>
                          <span className="font-medium">Frecuencia:</span> cada {getFrequencyLabel(process.monitoring_frequency)}
                          {process.executions && <span> • {process.executions} ejecuciones</span>}
                        </p>
                      )}
                    </div>

                    {/* Progreso */}
                    {process.status === 'running' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progreso</span>
                          <span className="font-medium text-gray-900">{process.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${process.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      {process.started_at && (
                        <span>Iniciado: {formatDate(process.started_at)}</span>
                      )}
                      {process.completed_at && (
                        <span>• Completado: {formatDate(process.completed_at)}</span>
                      )}
                      {process.failed_at && (
                        <span>• Fallido: {formatDate(process.failed_at)}</span>
                      )}
                      {process.last_detection && (
                        <span>• Última detección: {formatDate(process.last_detection)}</span>
                      )}
                    </div>

                    {/* Error */}
                    {process.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Error:</span> {process.error}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col space-y-2">
                  {process.status === 'completed' && process.results && (
                    <button
                      onClick={() => setSelectedProcess(selectedProcess === process.id ? null : process.id)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedProcess === process.id ? 'Ocultar' : 'Ver Resultados'}
                    </button>
                  )}
                  
                  {process.is_monitoring && process.status === 'running' && (
                    <button className="inline-flex items-center px-4 py-2 border border-orange-300 shadow-sm text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50">
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pausar
                    </button>
                  )}
                </div>
              </div>

              {/* Resultados expandidos */}
              {selectedProcess === process.id && process.results && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">📊 Resultados del Análisis</h4>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-sm text-red-600 font-medium">Alto Riesgo</p>
                      <p className="text-2xl font-bold text-red-900">{process.results.high_risk_zones}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-600 font-medium">Riesgo Medio</p>
                      <p className="text-2xl font-bold text-yellow-900">{process.results.medium_risk_zones}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 font-medium">Bajo Riesgo</p>
                      <p className="text-2xl font-bold text-green-900">{process.results.low_risk_zones}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Resumen Ejecutivo</p>
                    <p className="text-sm text-blue-800">{process.results.summary}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900 mb-2">💡 Insights Generados por IA</p>
                    <ul className="space-y-2">
                      {process.results.insights.map((insight: string, idx: number) => (
                        <li key={idx} className="text-sm text-purple-800 flex items-start">
                          <span className="mr-2">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProcesses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay procesos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus === 'all' 
              ? 'Crea tu primer proceso de análisis desde la página de Capas'
              : `No hay procesos con estado "${getStatusLabel(filterStatus)}"`
            }
          </p>
        </div>
      )}
    </div>
  );
}
