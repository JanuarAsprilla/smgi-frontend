import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BrainCircuit,
  Upload,
  Sparkles,
  Settings,
  Play,
  Plus,
  Code,
  Zap,
  Cloud,
  Server,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import api from '../../services/api';

interface AIProvider {
  id: string;
  name: string;
  description: string;
  free: boolean;
  requires_key: boolean;
  setup_url: string | null;
  models: string[];
  status?: string;
}

interface PrebuiltAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  parameters: Record<string, any>;
  example_prompt: string;
  ai_providers_supported: string[];
}

export default function AgentManager() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'prebuilt' | 'custom' | 'providers'>('prebuilt');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProviderConfig, setShowProviderConfig] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providerApiKey, setProviderApiKey] = useState('');
  const [providerModel, setProviderModel] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  // Fetch providers
  const { data: providersData } = useQuery({
    queryKey: ['ai-providers'],
    queryFn: async () => {
      const { data } = await api.get('/agents/agents/providers/');
      return data;
    },
  });

  // Fetch prebuilt agents
  const { data: prebuiltData } = useQuery({
    queryKey: ['prebuilt-agents'],
    queryFn: async () => {
      const { data } = await api.get('/agents/agents/prebuilt/');
      return data;
    },
  });

  // Fetch user's agents
  const { data: myAgentsData } = useQuery({
    queryKey: ['my-agents'],
    queryFn: async () => {
      const { data } = await api.get('/agents/agents/my-agents/');
      return data;
    },
  });

  // Configure provider mutation
  const configureProviderMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/agents/agents/configure-provider/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      setShowProviderConfig(false);
      setProviderApiKey('');
    },
  });

  // Test provider mutation
  const testProviderMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/agents/agents/test-provider/', payload);
      return data;
    },
    onSuccess: (data) => {
      setTestResult(data);
    },
    onError: (error: any) => {
      setTestResult({ status: 'error', error: error.response?.data?.error || 'Error' });
    },
  });

  // Create from prebuilt mutation
  const createFromPrebuiltMutation = useMutation({
    mutationFn: async (prebuiltId: string) => {
      const { data } = await api.post('/agents/agents/from-prebuilt/', {
        prebuilt_id: prebuiltId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-agents'] });
    },
  });

  const providers: AIProvider[] = providersData?.providers || [];
  const prebuiltAgents: PrebuiltAgent[] = prebuiltData?.agents || [];
  const myAgents = myAgentsData?.agents || [];

  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'configured':
        return 'text-green-600 bg-green-100';
      case 'offline':
      case 'not_configured':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleConfigureProvider = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = providers.find(p => p.id === providerId);
    if (provider?.models?.length) {
      setProviderModel(provider.models[0]);
    }
    setShowProviderConfig(true);
    setTestResult(null);
  };

  const handleTestProvider = () => {
    testProviderMutation.mutate({
      provider: selectedProvider,
      api_key: providerApiKey,
      model: providerModel,
    });
  };

  const handleSaveProvider = () => {
    configureProviderMutation.mutate({
      provider: selectedProvider,
      api_key: providerApiKey,
      model: providerModel,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BrainCircuit className="h-7 w-7 mr-2 text-purple-600" />
            Agentes de IA
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configura y ejecuta agentes de análisis geoespacial con IA
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Upload className="h-4 w-4 mr-2" />
          Subir Agente
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'prebuilt', label: 'Agentes Predefinidos', icon: Sparkles },
            { id: 'custom', label: 'Mis Agentes', icon: Code },
            { id: 'providers', label: 'Proveedores IA', icon: Cloud },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-3 border-b-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Prebuilt Agents */}
      {activeTab === 'prebuilt' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prebuiltAgents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {agent.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{agent.description}</p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Proveedores soportados:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.ai_providers_supported.map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => createFromPrebuiltMutation.mutate(agent.id)}
                  disabled={createFromPrebuiltMutation.isPending}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Usar
                </button>
                <button className="px-3 py-2 border text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Agents */}
      {activeTab === 'custom' && (
        <div>
          {myAgents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes agentes personalizados</h3>
              <p className="text-sm text-gray-500 mb-4">
                Sube tu propio código Python o crea uno desde una plantilla
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Upload className="h-4 w-4 mr-2 inline" />
                  Subir Agente
                </button>
                <button className="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">
                  <Sparkles className="h-4 w-4 mr-2 inline" />
                  Crear desde plantilla
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {myAgents.map((agent: any) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-lg border p-4 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Code className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{agent.name}</h4>
                      <p className="text-sm text-gray-500">{agent.agent_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        agent.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {agent.status}
                    </span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Play className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Settings className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Providers */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Proveedores de IA Gratuitos</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Configura proveedores de IA gratuitos para ejecutar tus agentes.
                  Groq ofrece la mejor velocidad para uso gratuito.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {provider.id === 'ollama' ? (
                      <Server className="h-8 w-8 text-gray-600" />
                    ) : (
                      <Cloud className="h-8 w-8 text-blue-600" />
                    )}
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      {provider.free && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          Gratis
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${getProviderStatusColor(
                      provider.status || 'available'
                    )}`}
                  >
                    {provider.status === 'online' || provider.status === 'configured'
                      ? 'Configurado'
                      : 'Disponible'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{provider.description}</p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Modelos disponibles:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.slice(0, 3).map((model) => (
                      <span
                        key={model}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono"
                      >
                        {model.split('/').pop()?.substring(0, 20)}
                      </span>
                    ))}
                    {provider.models.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{provider.models.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConfigureProvider(provider.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configurar
                  </button>
                  {provider.setup_url && (
                    <a
                      href={provider.setup_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Configuration Modal */}
      {showProviderConfig && selectedProvider && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowProviderConfig(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurar {providers.find(p => p.id === selectedProvider)?.name}
                </h3>
                <button onClick={() => setShowProviderConfig(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {providers.find(p => p.id === selectedProvider)?.requires_key && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={providerApiKey}
                      onChange={(e) => setProviderApiKey(e.target.value)}
                      placeholder="Ingresa tu API Key"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {providers.find(p => p.id === selectedProvider)?.setup_url && (
                      <a
                        href={providers.find(p => p.id === selectedProvider)?.setup_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Obtener API Key gratis →
                      </a>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <select
                    value={providerModel}
                    onChange={(e) => setProviderModel(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {providers
                      .find(p => p.id === selectedProvider)
                      ?.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Test Result */}
                {testResult && (
                  <div
                    className={`p-3 rounded-lg ${
                      testResult.status === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {testResult.status === 'success' ? (
                      <div>
                        <div className="flex items-center text-green-700 mb-1">
                          <Check className="h-4 w-4 mr-1" />
                          <span className="font-medium">Conexión exitosa</span>
                        </div>
                        <p className="text-xs text-green-600">
                          Tiempo: {testResult.elapsed_seconds}s
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-700">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{testResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleTestProvider}
                  disabled={testProviderMutation.isPending}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                >
                  {testProviderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Probar
                    </>
                  )}
                </button>
                <button
                  onClick={handleSaveProvider}
                  disabled={configureProviderMutation.isPending || testResult?.status !== 'success'}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {configureProviderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Agent Modal */}
      {showUploadModal && (
        <AgentUploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}

// Agent Upload Modal Component
function AgentUploadModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentType, setAgentType] = useState('custom');
  const [code, setCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/agents/agents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-agents'] });
      onClose();
    },
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('agent_type', agentType);
    
    if (file) {
      formData.append('code_file', file);
    } else if (code) {
      formData.append('code', code);
    }
    
    if (requirements) {
      const reqList = requirements.split('\n').filter(r => r.trim());
      formData.append('requirements', JSON.stringify(reqList));
    }

    uploadMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h3 className="text-lg font-semibold text-gray-900">Subir Agente Personalizado</h3>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mi Agente de Análisis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Describe qué hace tu agente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Agente</label>
              <select
                value={agentType}
                onChange={(e) => setAgentType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="custom">Personalizado</option>
                <option value="change_detection">Detección de Cambios</option>
                <option value="classification">Clasificación</option>
                <option value="prediction">Predicción</option>
                <option value="statistics">Estadísticas</option>
                <option value="anomaly_detection">Detección de Anomalías</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivo Python (.py)
              </label>
              <input
                type="file"
                accept=".py"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                O escribe el código directamente abajo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Python
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                placeholder={`def execute(input_layers, parameters, context):
    """
    Tu código de análisis aquí
    
    Args:
        input_layers: Lista de GeoDataFrames
        parameters: Diccionario de parámetros
        context: Contexto (user, ai_provider, etc.)
    
    Returns:
        dict con output_data y output_layers
    """
    return {
        'output_data': {'result': 'success'},
        'output_layers': []
    }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dependencias (una por línea)
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                placeholder="numpy
pandas
scikit-learn"
              />
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
              disabled={!name || !description || (!code && !file) || uploadMutation.isPending}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Subir Agente'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
