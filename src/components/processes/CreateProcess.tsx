import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, BrainCircuitIcon, Sparkles, PlayCircle, Clock } from 'lucide-react';
import { layerService } from '../../services/layerService';
import { analysisService } from '../../services/analysisService';

interface CreateProcessProps {
  onClose: () => void;
  preSelectedLayers?: number[];
}

export default function CreateProcess({ onClose, preSelectedLayers = [] }: CreateProcessProps) {
  const queryClient = useQueryClient();
  const [processName, setProcessName] = useState('');
  const [selectedLayers, setSelectedLayers] = useState<number[]>(preSelectedLayers);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [analysisType, setAnalysisType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [enableMonitoring, setEnableMonitoring] = useState(false);
  const [monitoringFrequency, setMonitoringFrequency] = useState('3600');

  const { data: layers } = useQuery({
    queryKey: ['layers'],
    queryFn: layerService.getLayers,
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: analysisService.getAgents,
  });

  const createMutation = useMutation({
    mutationFn: analysisService.createAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      onClose();
    },
  });

  const analysisTypes = [
    { value: 'change_detection', label: '🔍 Detección de Cambios', description: 'Identifica modificaciones en las capas' },
    { value: 'risk_analysis', label: '⚠️ Análisis de Riesgo', description: 'Evalúa zonas de riesgo y vulnerabilidad' },
    { value: 'spatial_interpolation', label: '📊 Interpolación Espacial', description: 'Predice valores en ubicaciones no medidas' },
    { value: 'classification', label: '🏷️ Clasificación', description: 'Clasifica features según características' },
    { value: 'hotspot_analysis', label: '🔥 Puntos Calientes', description: 'Detecta concentraciones significativas' },
    { value: 'anomaly_detection', label: '🎯 Detección de Anomalías', description: 'Encuentra patrones inusuales' },
    { value: 'spatial_pattern', label: '🗺️ Patrón Espacial', description: 'Analiza distribución geográfica' },
    { value: 'custom', label: '✨ Personalizado', description: 'Define tu propio análisis con prompt' },
  ];

  const frequencies = [
    { value: '300', label: '5 minutos' },
    { value: '900', label: '15 minutos' },
    { value: '1800', label: '30 minutos' },
    { value: '3600', label: '1 hora' },
    { value: '7200', label: '2 horas' },
    { value: '14400', label: '4 horas' },
    { value: '86400', label: '24 horas' },
  ];

  const toggleLayer = (layerId: number) => {
    setSelectedLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedLayers.length === 0) {
      alert('Selecciona al menos una capa');
      return;
    }

    if (!selectedAgent || !analysisType) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    console.log('Creando proceso:', {
      name: processName,
      layers: selectedLayers,
      agent_id: parseInt(selectedAgent),
      analysis_type: analysisType,
      prompt: prompt || undefined,
      enable_monitoring: enableMonitoring,
      monitoring_frequency: enableMonitoring ? parseInt(monitoringFrequency) : undefined,
    });

    createMutation.mutate({
      agent_id: parseInt(selectedAgent),
      layer_id: selectedLayers[0],
      analysis_type: analysisType,
      prompt: prompt || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <PlayCircle className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crear Proceso de Análisis</h2>
              <p className="text-sm text-gray-600">Configura un proceso completo de análisis con IA</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proceso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              required
              placeholder="ej: Análisis de Riesgo - Zona Norte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capas a Analizar <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto bg-gray-50">
              {layers?.results.map((layer) => (
                <label
                  key={layer.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedLayers.includes(layer.id)
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-white border border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLayers.includes(layer.id)}
                    onChange={() => toggleLayer(layer.id)}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{layer.name}</p>
                    <p className="text-xs text-gray-500">
                      {layer.geometry_type} • {layer.feature_count || 0} features
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {selectedLayers.length} capa{selectedLayers.length !== 1 ? 's' : ''} seleccionada{selectedLayers.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agente de IA <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona un agente</option>
                {agents?.results.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.agent_type.toUpperCase()})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                El agente procesará todas las capas seleccionadas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Análisis <span className="text-red-500">*</span>
              </label>
              <select
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona el tipo</option>
                {analysisTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {analysisType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">
                {analysisTypes.find(t => t.value === analysisType)?.label}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {analysisTypes.find(t => t.value === analysisType)?.description}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instrucciones para el Agente
              {analysisType === 'custom' && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required={analysisType === 'custom'}
              rows={4}
              placeholder="Describe qué quieres que analice el agente, qué patrones buscar, o qué insights generar..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {analysisType === 'custom'
                ? 'Requerido para análisis personalizado'
                : 'Opcional - proporciona contexto adicional para mejorar el análisis'}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="enableMonitoring"
                checked={enableMonitoring}
                onChange={(e) => setEnableMonitoring(e.target.checked)}
                className="mt-1 h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <div className="ml-3 flex-1">
                <label htmlFor="enableMonitoring" className="text-sm font-medium text-gray-900 cursor-pointer">
                  🔄 Habilitar Monitoreo Continuo
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  El proceso se ejecutará automáticamente de forma periódica para detectar cambios en tiempo real
                </p>
              </div>
            </div>

            {enableMonitoring && (
              <div className="mt-4 ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de Monitoreo
                </label>
                <select
                  value={monitoringFrequency}
                  onChange={(e) => setMonitoringFrequency(e.target.value)}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {frequencies.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      Cada {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-purple-900">Proceso Inteligente Multi-Capa</p>
                <p className="text-purple-700 mt-1">
                  El agente analizará {selectedLayers.length > 0 ? `las ${selectedLayers.length} capas` : 'las capas'} seleccionadas
                  de forma integral, detectando patrones, correlaciones y generando insights automáticamente.
                  {enableMonitoring && ' El monitoreo continuo te alertará ante cualquier cambio significativo.'}
                </p>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            {selectedLayers.length > 0 && selectedAgent && analysisType && (
              <span className="text-green-600 font-medium">✓ Listo para iniciar</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || selectedLayers.length === 0 || !selectedAgent || !analysisType}
              className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creando Proceso...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Iniciar Proceso
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
