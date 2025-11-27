import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layerService } from '../../services/layerService';
import { LayersIcon, DownloadIcon, Trash2Icon, Loader2, PlusIcon, UploadIcon } from 'lucide-react';
import LayerUpload from '../../components/layers/LayerUpload';

export default function Layers() {
  const queryClient = useQueryClient();
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['layers'],
    queryFn: layerService.getLayers,
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
      const blob = await layerService.exportLayer(id, format);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botones */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capas Geoespaciales</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las capas de datos del sistema
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Subir Capa
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Capa
          </button>
        </div>
      </div>

      {/* Lista de capas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {data?.results.map((layer) => (
            <li key={layer.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
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
            Comienza subiendo una capa GeoJSON o Shapefile.
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
