import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, BrainCircuitIcon, Sparkles } from 'lucide-react';
import { layerService } from '../../services/layerService';
import { analysisService } from '../../services/analysisService';

interface CreateAnalysisProps {
  onClose: () => void;
}

export default function CreateAnalysis({ onClose }: CreateAnalysisProps) {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('');
  const [analysisType, setAnalysisType] = useState('');
  const [prompt, setPrompt] = useState('');

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
      onClose();
    },
  });

  const analysisTypes = [
    { value: 'change_detection', label: 'Detección de Cambios' },
    { value: 'spatial_interpolation', label: 'Interpolación Espacial' },
    { value: 'risk_analysis', label: 'Análisis de Riesgo' },
    { value: 'classification', label: 'Clasificación Supervisada' },
    { value: 'hotspot_analysis', label: 'Análisis de Puntos Calientes' },
    { value: 'buffer_analysis', label: 'Análisis de Buffer' },
    { value: 'overlay', label: 'Superposición de Capas' },
    { value: 'custom', label: 'Análisis Personalizado (Prompt)' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAgent || !selectedLayer || !analysisType) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    createMutation.mutate({
      agent_id: parseInt(selectedAgent),
      layer_id: parseInt(selectedLayer),
      analysis_type: analysisType,
      prompt: prompt || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BrainCircuitIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crear Análisis con IA</h2>
              <p className="text-sm text-gray-500">Configura un nuevo análisis geoespacial</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agente de IA <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un agente</option>
              {agents?.results.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.agent_type.toUpperCase()} - {agent.model})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              El agente procesará los datos geoespaciales
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capa a Analizar <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una capa</option>
              {layers?.results.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name} ({layer.feature_count || 0} features)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Análisis <span className="text-red-500">*</span>
            </label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona el tipo</option>
              {analysisTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt / Instrucciones
              {analysisType === 'custom' && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required={analysisType === 'custom'}
              rows={4}
              placeholder="Describe qué quieres analizar o qué patrones buscar..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {analysisType === 'custom' 
                ? 'Requerido para análisis personalizado'
                : 'Opcional - proporciona contexto adicional para mejorar el análisis'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-blue-900">Análisis Potenciado por IA</p>
                <p className="text-blue-700 mt-1">
                  El agente analizará los datos geoespaciales usando modelos de lenguaje avanzados
                  para detectar patrones, anomalías y generar insights automáticamente.
                </p>
              </div>
            </div>
          </div>

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
              disabled={createMutation.isPending}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <BrainCircuitIcon className="h-4 w-4 mr-2" />
                  Crear Análisis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
