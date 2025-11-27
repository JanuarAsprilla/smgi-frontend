import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { layerService } from '../../services/layerService';
import { X, Upload, Link2, Globe, Database, Loader2, FileUp, CheckCircle, AlertCircle } from 'lucide-react';

interface LayerUploadProps {
  onClose: () => void;
}

type TabType = 'file' | 'url' | 'arcgis' | 'database';

export default function LayerUpload({ onClose }: LayerUploadProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('file');
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  // Tab 1: File Upload
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileDescription, setFileDescription] = useState('');

  // Tab 2: URL Service
  const [urlData, setUrlData] = useState({
    name: '',
    description: '',
    service_type: 'wfs' as const,
    url: '',
    layers: '',
    username: '',
    password: '',
  });

  // Tab 3: ArcGIS
  const [arcgisData, setArcgisData] = useState({
    name: '',
    description: '',
    service_url: '',
    item_id: '',
    layer_index: 0,
    token: '',
    sync_enabled: false,
    sync_interval: 3600,
  });

  // Tab 4: Database
  const [dbData, setDbData] = useState({
    name: '',
    description: '',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    schema: 'public',
    table: '',
    geometry_column: 'geom',
    srid: 4326,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (activeTab === 'file') {
        if (!file) throw new Error('Selecciona un archivo');
        return layerService.uploadFile(file, fileName, fileDescription);
      } else if (activeTab === 'url') {
        return layerService.uploadFromURL(urlData);
      } else if (activeTab === 'arcgis') {
        return layerService.uploadFromArcGIS(arcgisData);
      } else if (activeTab === 'database') {
        return layerService.uploadFromDatabase(dbData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error: any) => {
      setStep('error');
      setErrorMessage(error.response?.data?.error || 'Error al subir la capa');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!fileName) {
        setFileName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  const tabs = [
    { id: 'file' as TabType, label: 'Archivo', icon: FileUp },
    { id: 'url' as TabType, label: 'URL/Servicio', icon: Link2 },
    { id: 'arcgis' as TabType, label: 'ArcGIS Online', icon: Globe },
    { id: 'database' as TabType, label: 'Base de Datos', icon: Database },
  ];

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¡Capa Subida!</h3>
          <p className="text-gray-600">La capa se ha procesado exitosamente.</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => setStep('form')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Agregar Nueva Capa</h2>
              <p className="text-sm text-gray-600">Sube desde múltiples fuentes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto mb-1" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Tab 1: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Selecciona un archivo</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".geojson,.json,.shp,.zip,.kml,.gpkg"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="pl-1">o arrastra aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      GeoJSON, Shapefile (ZIP), KML, GeoPackage
                    </p>
                    {file && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Capa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tab 2: URL Service */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={urlData.name}
                    onChange={(e) => setUrlData({ ...urlData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Servicio <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={urlData.service_type}
                    onChange={(e) => setUrlData({ ...urlData, service_type: e.target.value as any })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wfs">WFS - Web Feature Service</option>
                    <option value="wms">WMS - Web Map Service</option>
                    <option value="wmts">WMTS - Web Map Tile Service</option>
                    <option value="arcgis">ArcGIS REST Service</option>
                    <option value="geojson">GeoJSON URL</option>
                    <option value="xyz">XYZ Tiles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Servicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={urlData.url}
                  onChange={(e) => setUrlData({ ...urlData, url: e.target.value })}
                  required
                  placeholder="https://example.com/geoserver/wfs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={urlData.layers}
                  onChange={(e) => setUrlData({ ...urlData, layers: e.target.value })}
                  placeholder="layer1,layer2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario (opcional)
                  </label>
                  <input
                    type="text"
                    value={urlData.username}
                    onChange={(e) => setUrlData({ ...urlData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    value={urlData.password}
                    onChange={(e) => setUrlData({ ...urlData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={urlData.description}
                  onChange={(e) => setUrlData({ ...urlData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 El sistema detectará automáticamente el tipo de geometría y sistema de coordenadas.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: ArcGIS Online */}
          {activeTab === 'arcgis' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={arcgisData.name}
                  onChange={(e) => setArcgisData({ ...arcgisData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Servicio
                </label>
                <input
                  type="url"
                  value={arcgisData.service_url}
                  onChange={(e) => setArcgisData({ ...arcgisData, service_url: e.target.value })}
                  placeholder="https://services.arcgis.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">O proporciona el Item ID</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item ID (alternativo)
                </label>
                <input
                  type="text"
                  value={arcgisData.item_id}
                  onChange={(e) => setArcgisData({ ...arcgisData, item_id: e.target.value })}
                  placeholder="abc123def456..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Índice de Capa
                  </label>
                  <input
                    type="number"
                    value={arcgisData.layer_index}
                    onChange={(e) => setArcgisData({ ...arcgisData, layer_index: parseInt(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token (si es privado)
                  </label>
                  <input
                    type="text"
                    value={arcgisData.token}
                    onChange={(e) => setArcgisData({ ...arcgisData, token: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={arcgisData.sync_enabled}
                    onChange={(e) => setArcgisData({ ...arcgisData, sync_enabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Habilitar sincronización automática
                  </span>
                </label>

                {arcgisData.sync_enabled && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intervalo de Sincronización
                    </label>
                    <select
                      value={arcgisData.sync_interval}
                      onChange={(e) => setArcgisData({ ...arcgisData, sync_interval: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="300">5 minutos</option>
                      <option value="900">15 minutos</option>
                      <option value="1800">30 minutos</option>
                      <option value="3600">1 hora</option>
                      <option value="7200">2 horas</option>
                      <option value="14400">4 horas</option>
                      <option value="86400">24 horas</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={arcgisData.description}
                  onChange={(e) => setArcgisData({ ...arcgisData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Database */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Capa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dbData.name}
                  onChange={(e) => setDbData({ ...dbData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbData.host}
                    onChange={(e) => setDbData({ ...dbData, host: e.target.value })}
                    required
                    placeholder="localhost"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={dbData.port}
                    onChange={(e) => setDbData({ ...dbData, port: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base de Datos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbData.database}
                    onChange={(e) => setDbData({ ...dbData, database: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schema
                  </label>
                  <input
                    type="text"
                    value={dbData.schema}
                    onChange={(e) => setDbData({ ...dbData, schema: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbData.username}
                    onChange={(e) => setDbData({ ...dbData, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={dbData.password}
                    onChange={(e) => setDbData({ ...dbData, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tabla <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dbData.table}
                    onChange={(e) => setDbData({ ...dbData, table: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Columna de Geometría
                  </label>
                  <input
                    type="text"
                    value={dbData.geometry_column}
                    onChange={(e) => setDbData({ ...dbData, geometry_column: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={dbData.description}
                  onChange={(e) => setDbData({ ...dbData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Asegúrate de que la base de datos tenga PostGIS instalado y que el usuario tenga permisos de lectura.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-md hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Capa
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
