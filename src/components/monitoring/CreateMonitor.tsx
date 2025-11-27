import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, BellIcon, Activity } from 'lucide-react';
import { layerService } from '../../services/layerService';

interface CreateMonitorProps {
  onClose: () => void;
}

export default function CreateMonitor({ onClose }: CreateMonitorProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [selectedLayer, setSelectedLayer] = useState('');
  const [monitorType, setMonitorType] = useState('');
  const [frequency, setFrequency] = useState('3600');
  const [threshold, setThreshold] = useState('');

  const { data: layers } = useQuery({
    queryKey: ['layers'],
    queryFn: layerService.getLayers,
  });

  const monitorTypes = [
    { value: 'change_detection', label: 'Detección de Cambios', description: 'Detecta modificaciones en los features' },
    { value: 'anomaly_detection', label: 'Detección de Anomalías', description: 'Identifica patrones anormales' },
    { value: 'threshold_alert', label: 'Alerta por Umbral', description: 'Notifica cuando se supera un valor' },
    { value: 'spatial_pattern', label: 'Patrón Espacial', description: 'Detecta patrones geográficos' },
    { value: 'temporal_analysis', label: 'Análisis Temporal', description: 'Monitorea cambios en el tiempo' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Creating monitor:', {
      name,
      layer: selectedLayer,
      monitor_type: monitorType,
      frequency: parseInt(frequency),
      threshold,
    });

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crear Monitor</h2>
              <p className="text-sm text-gray-500">Configura un nuevo sistema de monitoreo</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Monitor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="ej: Monitor de Zonas de Riesgo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capa a Monitorear <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona una capa</option>
              {layers?.results.map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Monitoreo <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {monitorTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    monitorType === type.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="monitorType"
                    value={type.value}
                    checked={monitorType === type.value}
                    onChange={(e) => setMonitorType(e.target.value)}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia de Ejecución <span className="text-red-500">*</span>
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Con qué frecuencia se ejecutará el monitoreo
            </p>
          </div>

          {monitorType === 'threshold_alert' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Umbral
              </label>
              <input
                type="number"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="ej: 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Se generará una alerta cuando se supere este valor
              </p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <BellIcon className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-green-900">Monitoreo Automático</p>
                <p className="text-green-700 mt-1">
                  El sistema ejecutará este monitor automáticamente según la frecuencia configurada
                  y generará alertas cuando detecte cambios o anomalías.
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
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Crear Monitor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
