/**
 * Layers Page - Gestión completa de capas geoespaciales
 * SMGI Frontend
 * 
 * REEMPLAZA tu archivo /src/pages/layers/Layers.tsx con este
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { layerService } from '../../services/layerService';
import { useToast } from '../../components/ui/Toast';
import {
  Layers as LayersIcon,
  Trash2,
  Loader2,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  MapPin,
  Database,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileJson,
  FileArchive,
  AlertTriangle,
  X,
} from 'lucide-react';
import LayerUpload from '../../components/layers/LayerUpload';
import type { Layer } from '../../types';

// ============================================================================
// Delete Confirmation Modal
// ============================================================================

interface DeleteModalProps {
  layer: Layer;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteModalProps> = ({
  layer,
  onConfirm,
  onCancel,
  isDeleting,
}) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Eliminar Capa</h3>
            <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            ¿Estás seguro de que deseas eliminar la capa <strong>"{layer.name}"</strong>?
          </p>
          {layer.feature_count && layer.feature_count > 0 && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Esta capa contiene {layer.feature_count} features que también serán eliminados.
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Layer Card Component
// ============================================================================

interface LayerCardProps {
  layer: Layer;
  onDownload: (format: 'geojson' | 'shapefile') => void;
  onDelete: () => void;
  onView: () => void;
  isExporting: boolean;
}

const LayerCard: React.FC<LayerCardProps> = ({
  layer,
  onDownload,
  onDelete,
  onView,
  isExporting,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getGeometryIcon = (type?: string) => {
    switch (type?.toUpperCase()) {
      case 'POINT':
      case 'MULTIPOINT':
        return '📍';
      case 'LINESTRING':
      case 'MULTILINESTRING':
        return '📏';
      case 'POLYGON':
      case 'MULTIPOLYGON':
        return '🗺️';
      default:
        return '📐';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-2xl">
            {getGeometryIcon(layer.geometry_type)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate" title={layer.name}>
              {layer.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {layer.description || 'Sin descripción'}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onView();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Ver en mapa
                </button>
                <button
                  onClick={() => {
                    // TODO: Implementar edición
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          <MapPin className="h-3 w-3" />
          {layer.geometry_type || 'N/A'}
        </span>
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          <Database className="h-3 w-3" />
          {layer.feature_count || 0} features
        </span>
        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
          SRID: {layer.srid || 4326}
        </span>
      </div>

      {/* Footer with Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(layer.created_at)}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload('geojson')}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            title="Descargar como GeoJSON"
          >
            {isExporting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileJson className="h-3 w-3" />
            )}
            GeoJSON
          </button>
          <button
            onClick={() => onDownload('shapefile')}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            title="Descargar como Shapefile"
          >
            {isExporting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <FileArchive className="h-3 w-3" />
            )}
            Shapefile
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar capa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC<{ onUpload: () => void }> = ({ onUpload }) => (
  <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
    <div className="p-4 bg-blue-50 rounded-full w-fit mx-auto mb-4">
      <LayersIcon className="h-12 w-12 text-blue-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay capas</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Comienza agregando capas geoespaciales. Puedes subir archivos Shapefile, GeoJSON, KML
      o conectar servicios externos como WMS, WFS o ArcGIS.
    </p>
    <button
      onClick={onUpload}
      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      <Upload className="h-5 w-5" />
      Agregar Primera Capa
    </button>
  </div>
);

// ============================================================================
// Constants
// ============================================================================

const GEOMETRY_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'POINT', label: 'Punto' },
  { value: 'MULTIPOINT', label: 'Multipunto' },
  { value: 'LINESTRING', label: 'Línea' },
  { value: 'MULTILINESTRING', label: 'Multilínea' },
  { value: 'POLYGON', label: 'Polígono' },
  { value: 'MULTIPOLYGON', label: 'Multipolígono' },
];

const LAYER_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'vector', label: 'Vectorial' },
  { value: 'raster', label: 'Raster' },
];

const ORDERING_OPTIONS = [
  { value: '-created_at', label: 'Más recientes' },
  { value: 'created_at', label: 'Más antiguos' },
  { value: 'name', label: 'Nombre A-Z' },
  { value: '-name', label: 'Nombre Z-A' },
];

// ============================================================================
// Main Component
// ============================================================================

export default function Layers() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  // State
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [layerToDelete, setLayerToDelete] = useState<Layer | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    geometry_type: '',
    layer_type: '',
    is_active: '',
    ordering: '-created_at',
  });
  const pageSize = 12;

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['layers', currentPage, debouncedSearch, filters],
    queryFn: () => layerService.getLayers({
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearch || undefined,
      geometry_type: filters.geometry_type || undefined,
      layer_type: (filters.layer_type as 'raster' | 'vector' | undefined) || undefined,
      is_active: filters.is_active ? filters.is_active === 'true' : undefined,
      ordering: filters.ordering,
    }),
  });

  // Count active filters
  const activeFilterCount = [
    filters.geometry_type,
    filters.layer_type,
    filters.is_active,
  ].filter(Boolean).length;

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      geometry_type: '',
      layer_type: '',
      is_active: '',
      ordering: '-created_at',
    });
    setSearchTerm('');
  };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => layerService.deleteLayer(id),
    onSuccess: () => {
      toast.success('Capa eliminada', 'La capa se ha eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['layers'] });
      setLayerToDelete(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.detail || 'Error al eliminar la capa';
      toast.error('Error', message);
    },
  });

  // Download handler
  const handleDownload = async (layer: Layer, format: 'geojson' | 'shapefile') => {
    setExportingId(layer.id);
    
    try {
      let blob: Blob;
      let filename: string;

      if (format === 'geojson') {
        // Para GeoJSON, obtenemos el JSON y lo convertimos a Blob
        const geojsonData = await layerService.downloadGeoJSON(layer.id);
        const jsonString = typeof geojsonData === 'string' 
          ? geojsonData 
          : JSON.stringify(geojsonData, null, 2);
        blob = new Blob([jsonString], { type: 'application/geo+json' });
        filename = `${layer.name.replace(/[^a-zA-Z0-9]/g, '_')}.geojson`;
      } else {
        // Para Shapefile, esperamos un blob directamente
        blob = await layerService.downloadShapefile(layer.id);
        filename = `${layer.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      }

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Descarga iniciada', `${format.toUpperCase()} descargándose...`);
    } catch (error: any) {
      console.error('Error downloading:', error);
      const message = error.response?.data?.error || error.response?.data?.detail || `Error al descargar ${format}`;
      toast.error('Error de descarga', message);
    } finally {
      setExportingId(null);
    }
  };

  // View in map handler
  const handleViewInMap = (layer: Layer) => {
    // TODO: Navegar al mapa con la capa seleccionada
    toast.info('Próximamente', `La visualización de "${layer.name}" en el mapa estará disponible pronto`);
  };

  // Computed values
  const layers = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayersIcon className="h-6 w-6 text-blue-600" />
              </div>
              Capas Geoespaciales
            </h1>
            <p className="text-gray-500 mt-1">
              Gestiona y analiza las capas de datos del sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Upload className="h-4 w-4" />
              Nueva Capa
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-4 flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Botón de Filtros */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Panel de Filtros Dropdown */}
            {showFilters && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowFilters(false)} />
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Filtros</h3>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
                        Limpiar
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Tipo de Geometría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Geometría
                      </label>
                      <select
                        value={filters.geometry_type}
                        onChange={(e) => {
                          setFilters({ ...filters, geometry_type: e.target.value });
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {GEOMETRY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo de Capa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Capa
                      </label>
                      <select
                        value={filters.layer_type}
                        onChange={(e) => {
                          setFilters({ ...filters, layer_type: e.target.value });
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {LAYER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Estado Activo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <div className="flex gap-2">
                        {[
                          { value: '', label: 'Todos' },
                          { value: 'true', label: 'Activas' },
                          { value: 'false', label: 'Inactivas' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setFilters({ ...filters, is_active: option.value });
                              setCurrentPage(1);
                            }}
                            className={`flex-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                              filters.is_active === option.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ordenamiento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ordenar por
                      </label>
                      <select
                        value={filters.ordering}
                        onChange={(e) => setFilters({ ...filters, ordering: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {ORDERING_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Info de resultados */}
        {data && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <span>{data.count} capas encontradas</span>
            {(debouncedSearch || activeFilterCount > 0) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Cargando capas...</span>
        </div>
      ) : layers.length === 0 ? (
        <EmptyState onUpload={() => setShowUpload(true)} />
      ) : (
        <>
          {/* Layers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layers.map((layer) => (
              <LayerCard
                key={layer.id}
                layer={layer}
                onDownload={(format) => handleDownload(layer, format)}
                onDelete={() => setLayerToDelete(layer)}
                onView={() => handleViewInMap(layer)}
                isExporting={exportingId === layer.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <LayerUpload 
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {layerToDelete && (
        <DeleteConfirmModal
          layer={layerToDelete}
          onConfirm={() => deleteMutation.mutate(layerToDelete.id)}
          onCancel={() => setLayerToDelete(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}