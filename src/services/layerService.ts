import api from './api';
import type { Layer, PaginatedResponse } from '../types';
import { mockLayers } from './mockData';

const DEMO_MODE = false;

export const layerService = {
  getLayers: async (): Promise<PaginatedResponse<Layer>> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        count: mockLayers.length,
        results: mockLayers,
      };
    }
    const { data } = await api.get<PaginatedResponse<Layer>>('/geodata/layers/');
    return data;
  },
  
  getLayer: async (id: number): Promise<Layer> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const layer: Layer | undefined = mockLayers.find((l: Layer) => l.id === id);
      if (!layer) throw new Error('Layer not found');
      return layer;
    }
    const { data } = await api.get<Layer>(`/geodata/layers/${id}/`);
    return data;
  },
  
  createLayer: async (layerData: Partial<Layer>): Promise<Layer> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newLayer: Layer = {
        id: Math.max(...mockLayers.map((l: Layer) => l.id)) + 1,
        name: layerData.name || 'Nueva Capa',
        description: layerData.description,
        layer_type: 'vector' as const,
        geometry_type: 'Polygon' as const,
        srid: 4326,
        is_active: true,
        feature_count: 0,
        created_at: new Date().toISOString(),
      };
      mockLayers.push(newLayer);
      return newLayer;
    }
    const { data } = await api.post<Layer>('/geodata/layers/', layerData);
    return data;
  },
  
  uploadLayer: async (formData: FormData): Promise<Layer> => {
    // Esta función NO usa modo demo - siempre intenta conectar con el backend
    const { data } = await api.post<Layer>('/geodata/layers/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
  
  deleteLayer: async (id: number): Promise<void> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index: number = mockLayers.findIndex((l: Layer) => l.id === id);
      if (index !== -1) {
        mockLayers.splice(index, 1);
      }
      return;
    }
    await api.delete(`/geodata/layers/${id}/`);
  },
  
  exportLayer: async (id: number, format: 'shapefile' | 'geojson'): Promise<Blob> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const layer: Layer | undefined = mockLayers.find((l: Layer) => l.id === id);
      const content = JSON.stringify({
        type: 'FeatureCollection',
        name: layer?.name,
        features: []
      }, null, 2);
      return new Blob([content], { type: 'application/json' });
    }
    const { data } = await api.post(
      `/geodata/layers/${id}/export/`,
      { format },
      { responseType: 'blob' }
    );
    return data;
  },
};
