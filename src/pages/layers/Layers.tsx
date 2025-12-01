import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layerService } from '../../services';
import { LayersIcon, DownloadIcon, Trash2Icon, Loader2, UploadIcon, BrainCircuitIcon, CheckSquare, Square } from 'lucide-react';
import LayerUpload from '../../components/layers/LayerUpload';
import { useNavigate } from 'react-router-dom';

export default function Layers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<number[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['layers'],
    queryFn: () => layerService.getLayers(),
  });

  const deleteMutation = useMutation({
    mutationFn: layerService.deleteLayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layers'] });
    },
  });

  const handleExport = async (id: number, format: 'shapefile' | 'geojson') => {
    setExportingId(id);
    try {
      const blob = format === 'shapefile' 
        ? await layerService.downloadShapefile(id)
        : await layerService.downloadGeoJSON(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `layer_${id}.${format === 'shapefile' ? 'zip' : 'geojson'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Error al exportar la capa');
    } finally {
      setExportingId(null);
    }
  };

  const toggleLayerSelection = (layerId: number) => {
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const selectAll = () => {
    if (selectedLayers.length === data?.results.length) {
      setSelectedLayers([]);
    } else {
      setSelectedLayers(data?.results.map(l => l.id) || []);
    }
  };

  const handleAnalyzeSelected = () => {
    if (selectedLayers.length === 0) {
      alert('Por favor selecciona al menos una capa');
      return;
    }
    // Navegar a crear proceso con capas pre-seleccionadas
    navigate('/analysis/create', { state: { selectedLayers } });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capas Geoespaciales</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona y analiza las capas de datos del sistema
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Subir Capas
          </button>
        </div>
      </div>

      {/* Barra de acciones para capas seleccionadas */}
      {(data?.results?.length ?? 0) > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={selectAll}
                className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                {selectedLayers.length === data?.results.length ? (
                  <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5 mr-2" />
                )}
                {selectedLayers.length === data?.results.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
              
              {selectedLayers.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedLayers.length} capa{selectedLayers.length !== 1 ? 's' : ''} seleccionada{selectedLayers.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {selectedLayers.length > 0 && (
              <button
                onClick={handleAnalyzeSelected}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <BrainCircuitIcon className="h-4 w-4 mr-2" />
                Analizar Seleccionadas ({selectedLayers.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista de capas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {data?.results.map((layer) => (
            <li key={layer.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                {/* Checkbox de selección */}
                <button
                  onClick={() => toggleLayerSelection(layer.id)}
                  className="shrink-0"
                >
                  {selectedLayers.includes(layer.id) ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                {/* Información de la capa */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <LayersIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{layer.name}</h3>
                      <p className="text-sm text-gray-500">{layer.description || 'Sin descripción'}</p>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{layer.geometry_type}</span>
                        <span>•</span>
                        <span>{layer.feature_count || 0} features</span>
                        <span>•</span>
                        <span>SRID: {layer.srid}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleExport(layer.id, 'geojson')}
                    disabled={exportingId === layer.id}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {exportingId === layer.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <DownloadIcon className="h-3 w-3 mr-1" />
                    )}
                    GeoJSON
                  </button>
                  
                  <button
                    onClick={() => handleExport(layer.id, 'shapefile')}
                    disabled={exportingId === layer.id}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {exportingId === layer.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <DownloadIcon className="h-3 w-3 mr-1" />
                    )}
                    Shapefile
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de eliminar esta capa?')) {
                        deleteMutation.mutate(layer.id);
                      }
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {!data?.results.length && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <LayersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay capas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza subiendo capas GeoJSON o Shapefile para analizar.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Subir Primera Capa
          </button>
        </div>
      )}

      {/* Modal de upload */}
      {showUpload && <LayerUpload onClose={() => setShowUpload(false)} />}
    </div>
  );
}
