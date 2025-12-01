import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Layer, Feature, Dataset, DataSource, PaginatedResponse } from '../types';

export interface LayerFilters {
  datasource?: number;
  layer_type?: 'raster' | 'vector' | 'tile';
  is_active?: boolean;
  is_public?: boolean;
  search?: string;
  ordering?: string;
}

export interface FeatureFilters {
  layer?: number;
  search?: string;
}

export interface ExportLayerPayload {
  format: 'shapefile' | 'geojson' | 'both';
  filename?: string;
  crs?: string; // EPSG code, e.g., 'EPSG:4326'
}

export const layerService = {
  // ============================================================================
  // Data Sources
  // ============================================================================

  /**
   * Get all data sources
   */
  getDataSources: async (): Promise<PaginatedResponse<DataSource>> => {
    const { data } = await api.get<PaginatedResponse<DataSource>>(
      API_ENDPOINTS.GEODATA.DATASOURCES
    );
    return data;
  },

  /**
   * Create a data source
   */
  createDataSource: async (payload: Partial<DataSource>): Promise<DataSource> => {
    const { data } = await api.post<DataSource>(
      API_ENDPOINTS.GEODATA.DATASOURCES,
      payload
    );
    return data;
  },

  /**
   * Sync a data source
   */
  syncDataSource: async (id: number): Promise<{ message: string }> => {
    const { data } = await api.post(
      `${API_ENDPOINTS.GEODATA.DATASOURCES}${id}/sync/`
    );
    return data;
  },

  // ============================================================================
  // Layers
  // ============================================================================

  /**
   * Get all layers
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
   * Delete layer
   */
  deleteLayer: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.GEODATA.LAYER_DETAIL(id));
  },

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
      }
    );
    return data;
  },

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
   * Download layer as Shapefile (direct download)
   */
  downloadShapefile: async (id: number): Promise<Blob> => {
    const { data } = await api.get(
      API_ENDPOINTS.GEODATA.LAYER_DOWNLOAD_SHP(id),
      { responseType: 'blob' }
    );
    return data;
  },

  /**
   * Download layer as GeoJSON (direct download)
   */
  downloadGeoJSON: async (id: number): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.GEODATA.LAYER_DOWNLOAD_GEOJSON(id));
    return data;
  },

  /**
   * Get layer statistics
   */
  getLayerStatistics: async (id: number): Promise<any> => {
    const { data } = await api.get(
      `${API_ENDPOINTS.GEODATA.LAYER_DETAIL(id)}statistics/`
    );
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
   * Get a single feature
   */
  getFeature: async (id: number): Promise<Feature> => {
    const { data } = await api.get<Feature>(`${API_ENDPOINTS.GEODATA.FEATURES}${id}/`);
    return data;
  },

  /**
   * Create a feature
   */
  createFeature: async (payload: {
    layer: number;
    geometry: any; // GeoJSON geometry
    properties: Record<string, any>;
  }): Promise<Feature> => {
    const { data } = await api.post<Feature>(API_ENDPOINTS.GEODATA.FEATURES, payload);
    return data;
  },

  /**
   * Update a feature
   */
  updateFeature: async (id: number, payload: Partial<Feature>): Promise<Feature> => {
    const { data } = await api.put<Feature>(
      `${API_ENDPOINTS.GEODATA.FEATURES}${id}/`,
      payload
    );
    return data;
  },

  /**
   * Delete a feature
   */
  deleteFeature: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.GEODATA.FEATURES}${id}/`);
  },

  // ============================================================================
  // Datasets
  // ============================================================================

  /**
   * Get all datasets
   */
  getDatasets: async (): Promise<PaginatedResponse<Dataset>> => {
    const { data } = await api.get<PaginatedResponse<Dataset>>(
      API_ENDPOINTS.GEODATA.DATASETS
    );
    return data;
  },

  /**
   * Get a single dataset
   */
  getDataset: async (id: number): Promise<Dataset> => {
    const { data } = await api.get<Dataset>(`${API_ENDPOINTS.GEODATA.DATASETS}${id}/`);
    return data;
  },

  /**
   * Create a dataset
   */
  createDataset: async (payload: Partial<Dataset>): Promise<Dataset> => {
    const { data } = await api.post<Dataset>(API_ENDPOINTS.GEODATA.DATASETS, payload);
    return data;
  },

  /**
   * Update a dataset
   */
  updateDataset: async (id: number, payload: Partial<Dataset>): Promise<Dataset> => {
    const { data } = await api.put<Dataset>(
      `${API_ENDPOINTS.GEODATA.DATASETS}${id}/`,
      payload
    );
    return data;
  },

  /**
   * Delete a dataset
   */
  deleteDataset: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.GEODATA.DATASETS}${id}/`);
  },

  /**
   * Export dataset (all layers in one ZIP)
   */
  exportDataset: async (id: number, format: 'shapefile' | 'geojson'): Promise<{
    success: boolean;
    message: string;
    download_url: string;
  }> => {
    const { data } = await api.post(API_ENDPOINTS.GEODATA.DATASET_EXPORT(id), { format });
    return data;
  },

  // ============================================================================
  // Sync Logs
  // ============================================================================

  /**
   * Get sync logs
   */
  getSyncLogs: async (filters?: { datasource?: number }): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.GEODATA.SYNC_LOGS,
      { params: filters }
    );
    return data;
  },
};
