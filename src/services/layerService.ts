import api from './api';

const DEMO_MODE = false;

export interface Layer {
  id: number;
  name: string;
  description: string;
  geometry_type: string;
  feature_count: number;
  srid: number;
  created_at: string;
  updated_at: string;
}

export interface URLLayerData {
  name: string;
  description?: string;
  service_type: 'wms' | 'wfs' | 'wmts' | 'arcgis' | 'geojson' | 'xyz';
  url: string;
  layers?: string;
  username?: string;
  password?: string;
  parameters?: Record<string, any>;
}

export interface ArcGISLayerData {
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

export interface DatabaseLayerData {
  name: string;
  description?: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  schema: string;
  table: string;
  geometry_column?: string;
  srid?: number;
  query?: string;
}

export const layerService = {
  getLayers: async () => {
    if (DEMO_MODE) {
      return { results: [] };
    }
    const { data } = await api.get('/geodata/layers/');
    return data;
  },

  getLayer: async (id: number) => {
    const { data } = await api.get(`/geodata/layers/${id}/`);
    return data;
  },

  deleteLayer: async (id: number) => {
    await api.delete(`/geodata/layers/${id}/`);
  },

  // Upload desde archivo
  uploadFile: async (file: File, name: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) formData.append('description', description);

    const { data } = await api.post('/geodata/layers/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Upload desde URL (WMS, WFS, etc)
  uploadFromURL: async (layerData: URLLayerData) => {
    const { data } = await api.post('/geodata/layers/from-url/', layerData);
    return data;
  },

  // Upload desde ArcGIS Online
  uploadFromArcGIS: async (layerData: ArcGISLayerData) => {
    const { data } = await api.post('/geodata/layers/from-arcgis/', layerData);
    return data;
  },

  // Upload desde Base de Datos
  uploadFromDatabase: async (layerData: DatabaseLayerData) => {
    const { data } = await api.post('/geodata/layers/from-database/', layerData);
    return data;
  },

  // Obtener info de servicio antes de cargar
  getServiceInfo: async (serviceType: string, url: string, token?: string) => {
    const { data } = await api.post('/geodata/layers/get-service-info/', {
      service_type: serviceType,
      url,
      token,
    });
    return data;
  },

  // Export
  exportLayer: async (id: number, format: string) => {
    const response = await api.get(`/geodata/layers/${id}/export/`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
