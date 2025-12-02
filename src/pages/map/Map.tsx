import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { layerService } from '../../services';
import { 
  Layers as LayersIcon, 
  Maximize2, 
  Minimize2, 
  Download, 
  Ruler,
  Eye,
  EyeOff,
  Settings,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LayerControlItem {
  id: number;
  name: string;
  visible: boolean;
  opacity: number;
  data: any;
}

// Componente para ajustar el mapa a los límites
function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  
  return null;
}

export default function Map() {
  const [center] = useState<[number, number]>([4.6097, -74.0817]); // Bogotá
  const [zoom] = useState(6);
  const [baseLayer, setBaseLayer] = useState('osm');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [layerControls, setLayerControls] = useState<LayerControlItem[]>([]);
  const [bounds, setBounds] = useState<L.LatLngBoundsExpression | null>(null);

  // Obtener capas
  const { data: layersResponse } = useQuery({
    queryKey: ['layers'],
    queryFn: () => layerService.getLayers(),
  });

  const layers = layersResponse?.results || [];

  // Cargar datos GeoJSON de las capas
  useEffect(() => {
    if (layers.length > 0) {
      const loadedLayers: LayerControlItem[] = layers.map((layer: any) => ({
        id: layer.id,
        name: layer.name,
        visible: true,
        opacity: 0.7,
        data: null, // Se cargará bajo demanda
      }));
      setLayerControls(loadedLayers);
    }
  }, [layers]);

  const toggleLayerVisibility = (layerId: number) => {
    setLayerControls(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const updateLayerOpacity = (layerId: number, opacity: number) => {
    setLayerControls(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, opacity } : layer
      )
    );
  };

  const zoomToLayer = (_layer: any) => {
    // TODO: Calcular bounds desde los features
    // Por ahora, zoom general a Colombia
    setBounds([
      [-4.2, -79.0],
      [13.4, -66.8]
    ] as L.LatLngBoundsExpression);
  };

  const baseLayers = [
    { id: 'osm', name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { id: 'satellite', name: 'Satélite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { id: 'topo', name: 'Topográfico', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
    { id: 'dark', name: 'Modo Oscuro', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
  ];

  const currentBaseLayer = baseLayers.find(l => l.id === baseLayer) || baseLayers[0];

  // Funciones de utilidad para GeoJSON (disponibles para uso futuro)
  // getFeatureStyle: retorna estilo para features
  // onEachFeature: maneja eventos de features

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Map Container */}
      <div className={`h-full ${sidebarOpen ? 'mr-80' : 'mr-0'} transition-all duration-300`}>
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
          zoomControl={false}
        >
          {/* Base Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={currentBaseLayer.url}
          />

          {/* Zoom Control (posición personalizada) */}
          <ZoomControl position="bottomright" />

          {/* Fit Bounds */}
          <FitBounds bounds={bounds} />

          {/* TODO: Cargar capas GeoJSON */}
          {/* Por ahora sin datos */}
        </MapContainer>
      </div>

      {/* Sidebar */}
      <div
        className={`absolute top-0 right-0 h-full bg-white shadow-xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '320px' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-linear-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <LayersIcon className="h-5 w-5 mr-2 text-blue-600" />
                Control de Capas
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Base Layer Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Capa Base
              </label>
              <select
                value={baseLayer}
                onChange={(e) => setBaseLayer(e.target.value)}
                className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {baseLayers.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Layers List */}
          <div className="flex-1 overflow-y-auto p-4">
            {layerControls.length === 0 ? (
              <div className="text-center py-12">
                <LayersIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No hay capas disponibles</p>
                <p className="text-xs text-gray-400 mt-1">
                  Sube capas desde la sección "Capas"
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {layerControls.map((layer) => (
                  <div
                    key={layer.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1">
                        <button
                          onClick={() => toggleLayerVisibility(layer.id)}
                          className="shrink-0"
                        >
                          {layer.visible ? (
                            <Eye className="h-4 w-4 text-blue-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {layer.name}
                        </span>
                      </div>
                      <button
                        onClick={() => zoomToLayer(layer)}
                        className="shrink-0 p-1 hover:bg-gray-100 rounded"
                        title="Zoom a capa"
                      >
                        <Maximize2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    {/* Opacity Slider */}
                    {layer.visible && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Opacidad</span>
                          <span>{Math.round(layer.opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={layer.opacity}
                          onChange={(e) =>
                            updateLayerOpacity(layer.id, parseFloat(e.target.value))
                          }
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>Capas visibles:</span>
                <span className="font-medium">
                  {layerControls.filter(l => l.visible).length} / {layerControls.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Capa base:</span>
                <span className="font-medium">{currentBaseLayer.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button (cuando está cerrado) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 right-4 p-2 bg-white shadow-lg rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-4 bg-white shadow-lg rounded-lg p-2 flex flex-col space-y-2">
        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="p-2 hover:bg-gray-100 rounded"
          title={fullscreen ? 'Salir pantalla completa' : 'Pantalla completa'}
        >
          {fullscreen ? (
            <Minimize2 className="h-5 w-5 text-gray-700" />
          ) : (
            <Maximize2 className="h-5 w-5 text-gray-700" />
          )}
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Herramientas de medición"
        >
          <Ruler className="h-5 w-5 text-gray-700" />
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Exportar mapa"
        >
          <Download className="h-5 w-5 text-gray-700" />
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Configuración"
        >
          <Settings className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Scale */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded text-xs font-mono">
        Zoom: {zoom}
      </div>

      {/* Attribution */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-3 py-1 rounded text-xs text-gray-600">
        SMGI - Sistema de Monitoreo Geoespacial Inteligente
      </div>
    </div>
  );
}
