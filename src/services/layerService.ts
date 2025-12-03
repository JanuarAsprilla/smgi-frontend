/**
 * Layer Service - Servicio actualizado con soporte para múltiples fuentes
 * SMGI Frontend - Sistema de Monitoreo Geoespacial Inteligente
 * 
 * REEMPLAZA tu archivo /src/services/layerService.ts con este
 */

import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Layer, Feature, PaginatedResponse } from '../types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LayerFilters {
  layer_type?: 'vector' | 'raster';
  geometry_type?: string;
  is_active?: boolean;
  search?: string;
  tags?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface FeatureFilters {
  layer?: number;
  layer_name?: string;
  feature_id?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}

export interface ExportLayerPayload {
  format: 'geojson' | 'shapefile' | 'kml' | 'csv';
  include_metadata?: boolean;
  crs?: string;
}

// Tipos de fuente de datos
export type DataSourceType = 
  | 'wms' 
  | 'wfs' 
  | 'wmts' 
  | 'api' 
  | 'database' 
  | 'file' 
  | 'sentinel' 
  | 'landsat' 
  | 'arcgis' 
  | 'custom';

export type DataSourceStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface DataSource {
  id: number;
  name: string;
  description?: string;
  source_type: DataSourceType;
  url?: string;
  configuration: Record<string, any>;
  status: DataSourceStatus;
  refresh_interval: number;
  last_sync?: string;
  metadata: Record<string, any>;
  tags: string[];
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDataSourcePayload {
  name: string;
  description?: string;
  source_type: DataSourceType;
  url?: string;
  credentials?: Record<string, any>;
  configuration?: Record<string, any>;
  refresh_interval?: number;
  metadata?: Record<string, any>;
  tags?: string[];
  is_active?: boolean;
}

// Payload para crear capa desde URL (WMS, WFS, GeoJSON, etc)
export interface CreateLayerFromURLPayload {
  name: string;
  description?: string;
  service_type: 'wms' | 'wfs' | 'wmts' | 'arcgis' | 'geojson' | 'xyz';
  url: string;
  layers?: string;  // Capas específicas a cargar (separadas por coma)
  username?: string;
  password?: string;
  parameters?: Record<string, any>;
}

// Payload para crear capa desde ArcGIS
export interface CreateLayerFromArcGISPayload {
  name: string;
  description?: string;
  service_url?: string;
  item_id?: string;
  layer_index?: number;
  token?: string;
  username?: string;
  password?: string;
  sync_enabled?: boolean;
  sync_interval?: number;
}

// Payload para crear capa desde base de datos
export interface CreateLayerFromDatabasePayload {
  name: string;
  description?: string;
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  schema?: string;
  table: string;
  geometry_column?: string;
  srid?: number;
  where_clause?: string;
  sync_enabled?: boolean;
}

export interface SyncLog {
  id: number;
  data_source: number;
  data_source_name?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  started_at?: string;
  completed_at?: string;
  records_processed?: number;
  records_added?: number;
  records_updated?: number;
  records_failed?: number;
  error_message?: string;
  details?: Record<string, any>;
  created_at: string;
}

// ============================================================================
// Layer Service
// ============================================================================

export const layerService = {
  // ============================================================================
  // Layers CRUD
  // ============================================================================

  /**
   * Get all layers with optional filters
   */
  getLayers: async (filters?: LayerFilters): Promise<PaginatedResponse<Layer>> => {
    const { data } = await api.get<PaginatedResponse<Layer>>(
      API_ENDPOINTS.GEODATA.LAYERS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get single layer
   */
  getLayer: async (id: number): Promise<Layer> => {
    const { data } = await api.get<Layer>(API_ENDPOINTS.GEODATA.LAYER_DETAIL(id));
    return data;
  },

  /**
   * Create a layer
   */
  createLayer: async (payload: Partial<Layer>): Promise<Layer> => {
    const { data } = await api.post<Layer>(API_ENDPOINTS.GEODATA.LAYERS, payload);
    return data;
  },

  /**
   * Update a layer
   */
  updateLayer: async (id: number, payload: Partial<Layer>): Promise<Layer> => {
    const { data } = await api.put<Layer>(
      API_ENDPOINTS.GEODATA.LAYER_DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Partial update a layer
   */
  patchLayer: async (id: number, payload: Partial<Layer>): Promise<Layer> => {
    const { data } = await api.patch<Layer>(
      API_ENDPOINTS.GEODATA.LAYER_DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Delete layer
   */
  deleteLayer: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.GEODATA.LAYER_DETAIL(id));
  },

  // ============================================================================
  // Layer Upload & Import
  // ============================================================================

  /**
   * Upload layer from file (Shapefile, GeoJSON, KML, GeoPackage)
   */
  uploadLayer: async (formData: FormData): Promise<Layer> => {
    const { data } = await api.post<Layer>(
      API_ENDPOINTS.GEODATA.LAYER_UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutos para archivos grandes
      }
    );
    return data;
  },

  /**
   * Create layer from URL (WMS, WFS, GeoJSON URL, etc)
   */
  createFromURL: async (payload: CreateLayerFromURLPayload): Promise<Layer> => {
    const { data } = await api.post<Layer>(
      API_ENDPOINTS.GEODATA.LAYER_FROM_URL || `${API_ENDPOINTS.GEODATA.LAYERS}from-url/`,
      payload
    );
    return data;
  },

  /**
   * Create layer from ArcGIS service
   */
  createFromArcGIS: async (payload: CreateLayerFromArcGISPayload): Promise<Layer> => {
    const { data } = await api.post<Layer>(
      API_ENDPOINTS.GEODATA.LAYER_FROM_ARCGIS || `${API_ENDPOINTS.GEODATA.LAYERS}from-arcgis/`,
      payload
    );
    return data;
  },

  /**
   * Create layer from database (PostGIS)
   */
  createFromDatabase: async (payload: CreateLayerFromDatabasePayload): Promise<Layer> => {
    const { data } = await api.post<Layer>(
      API_ENDPOINTS.GEODATA.LAYER_FROM_DATABASE || `${API_ENDPOINTS.GEODATA.LAYERS}from-database/`,
      payload
    );
    return data;
  },

  // ============================================================================
  // Layer Export & Download
  // ============================================================================

  /**
   * Export layer to specific format
   */
  exportLayer: async (id: number, payload: ExportLayerPayload): Promise<{
    success: boolean;
    message: string;
    files: Array<{
      format: string;
      filename: string;
      size: number;
      download_url: string;
    }>;
  }> => {
    const { data } = await api.post(
      API_ENDPOINTS.GEODATA.LAYER_EXPORT(id),
      payload
    );
    return data;
  },

    /**
   * Get GeoJSON data for a layer (for visualization and analysis)
   */
  getLayerGeoJSON: async (id: number): Promise<any> => {
    try {
      // Intenta el endpoint de GeoJSON específico
      const { data } = await api.get(`/geodata/layers/${id}/geojson/`);
      return data;
    } catch (error) {
      // Fallback: intenta el endpoint de descarga
      try {
        const { data } = await api.get(`/geodata/layers/${id}/download/geojson/`);
        return data;
      } catch {
        // Último intento: obtener detalles de la capa
        const { data } = await api.get(`/geodata/layers/${id}/`);
        return data;
      }
    }
  },

  /**
   * Download layer as Shapefile (direct download)
   */
  downloadShapefile: async (id: number): Promise<Blob> => {
    const { data } = await api.get(
      API_ENDPOINTS.GEODATA.LAYER_DOWNLOAD_SHP(id),
      { 
        responseType: 'blob',
        headers: {
          'Accept': 'application/zip, application/octet-stream',
        }
      }
    );
    return data;
  },

  /**
   * Download layer as GeoJSON (direct download)
   */
  downloadGeoJSON: async (id: number): Promise<any> => {
    // Primero intentamos el endpoint de download
    try {
      const { data } = await api.get(
        API_ENDPOINTS.GEODATA.LAYER_DOWNLOAD_GEOJSON(id),
        {
          headers: {
            'Accept': 'application/geo+json, application/json',
          }
        }
      );
      return data;
    } catch {
      // Si falla, intentamos el endpoint /geojson/
      const { data } = await api.get(
        `${API_ENDPOINTS.GEODATA.LAYER_DETAIL(id)}geojson/`,
        {
          headers: {
            'Accept': 'application/geo+json, application/json',
          }
        }
      );
      return data;
    }
  },

  /**
   * Get layer statistics (feature count, bounds, attributes, etc.)
   */
  getLayerStats: async (id: number): Promise<any> => {
    const { data } = await api.get(`/geodata/layers/${id}/stats/`);
    return data;
  },

  // ============================================================================
  // Features
  // ============================================================================

  /**
   * Get features for a layer
   */
  getFeatures: async (filters?: FeatureFilters): Promise<PaginatedResponse<Feature>> => {
    const { data } = await api.get<PaginatedResponse<Feature>>(
      API_ENDPOINTS.GEODATA.FEATURES,
      { params: filters }
    );
    return data;
  },

  /**
   * Get single feature
   */
  getFeature: async (id: number): Promise<Feature> => {
    const { data } = await api.get<Feature>(API_ENDPOINTS.GEODATA.FEATURE_DETAIL(id));
    return data;
  },

  /**
   * Create feature
   */
  createFeature: async (payload: Partial<Feature>): Promise<Feature> => {
    const { data } = await api.post<Feature>(
      API_ENDPOINTS.GEODATA.FEATURES,
      payload
    );
    return data;
  },

  /**
   * Update feature
   */
  updateFeature: async (id: number, payload: Partial<Feature>): Promise<Feature> => {
    const { data } = await api.put<Feature>(
      API_ENDPOINTS.GEODATA.FEATURE_DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Delete feature
   */
  deleteFeature: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.GEODATA.FEATURE_DETAIL(id));
  },

  // ============================================================================
  // Data Sources
  // ============================================================================

  /**
   * Get all data sources
   */
  getDataSources: async (filters?: {
    source_type?: DataSourceType;
    status?: DataSourceStatus;
    is_active?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<DataSource>> => {
    const { data } = await api.get<PaginatedResponse<DataSource>>(
      API_ENDPOINTS.GEODATA.DATASOURCES,
      { params: filters }
    );
    return data;
  },

  /**
   * Get single data source
   */
  getDataSource: async (id: number): Promise<DataSource> => {
    const { data } = await api.get<DataSource>(
      API_ENDPOINTS.GEODATA.DATASOURCE_DETAIL(id)
    );
    return data;
  },

  /**
   * Create data source
   */
  createDataSource: async (payload: CreateDataSourcePayload): Promise<DataSource> => {
    const { data } = await api.post<DataSource>(
      API_ENDPOINTS.GEODATA.DATASOURCES,
      payload
    );
    return data;
  },

  /**
   * Update data source
   */
  updateDataSource: async (id: number, payload: Partial<CreateDataSourcePayload>): Promise<DataSource> => {
    const { data } = await api.patch<DataSource>(
      API_ENDPOINTS.GEODATA.DATASOURCE_DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Delete data source
   */
  deleteDataSource: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.GEODATA.DATASOURCE_DETAIL(id));
  },

  /**
   * Trigger manual sync for data source
   */
  syncDataSource: async (id: number): Promise<{ status: string; message: string }> => {
    const { data } = await api.post(API_ENDPOINTS.GEODATA.DATASOURCE_SYNC(id));
    return data;
  },

  // ============================================================================
  // Sync Logs
  // ============================================================================

  /**
   * Get sync logs
   */
  getSyncLogs: async (filters?: {
    data_source?: number;
    status?: string;
  }): Promise<PaginatedResponse<SyncLog>> => {
    const { data } = await api.get<PaginatedResponse<SyncLog>>(
      API_ENDPOINTS.GEODATA.SYNC_LOGS,
      { params: filters }
    );
    return data;
  },

  // ============================================================================
  // Datasets
  // ============================================================================

  /**
   * Get all datasets
   */
  getDatasets: async (filters?: {
    layer?: number;
    is_active?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.GEODATA.DATASETS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get single dataset
   */
  getDataset: async (id: number): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.GEODATA.DATASET_DETAIL(id));
    return data;
  },

  /**
   * Export dataset
   */
  exportDataset: async (id: number, format: 'geojson' | 'shapefile' | 'csv'): Promise<any> => {
    const { data } = await api.post(API_ENDPOINTS.GEODATA.DATASET_EXPORT(id), { format });
    return data;
  },

  /**
   * Download dataset
   */
  downloadDataset: async (id: number, format: string): Promise<Blob> => {
    const { data } = await api.get(
      API_ENDPOINTS.GEODATA.DATASET_DOWNLOAD(id, format),
      { responseType: 'blob' }
    );
    return data;
  },

  // ============================================================================
  // Helpers
  // ============================================================================

  /**
   * Validate URL accessibility
   */
  validateURL: async (url: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      // Intenta hacer un HEAD request al URL
      await api.head(url);
      return { valid: true };
    } catch (error: any) {
      return { 
        valid: false, 
        error: error.response?.data?.message || 'URL no accesible' 
      };
    }
  },

  /**
   * Get available service types
   */
  getServiceTypes: () => [
    { value: 'wms', label: 'WMS - Web Map Service', icon: '🗺️' },
    { value: 'wfs', label: 'WFS - Web Feature Service', icon: '📍' },
    { value: 'wmts', label: 'WMTS - Web Map Tile Service', icon: '🔲' },
    { value: 'arcgis', label: 'ArcGIS REST Service', icon: '🌐' },
    { value: 'geojson', label: 'GeoJSON URL', icon: '📄' },
    { value: 'xyz', label: 'XYZ Tiles', icon: '🗾' },
  ],
};

export default layerService;