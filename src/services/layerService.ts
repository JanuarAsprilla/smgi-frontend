import api from './api';
import type { Layer, PaginatedResponse } from '../types';

export const layerService = {
  getLayers: async (): Promise<PaginatedResponse<Layer>> => {
    const { data } = await api.get<PaginatedResponse<Layer>>('/geodata/layers/');
    return data;
  },
  
  getLayer: async (id: number): Promise<Layer> => {
    const { data } = await api.get<Layer>(`/geodata/layers/${id}/`);
    return data;
  },
  
  deleteLayer: async (id: number): Promise<void> => {
    await api.delete(`/geodata/layers/${id}/`);
  },
  
  exportLayer: async (id: number, format: 'shapefile' | 'geojson'): Promise<Blob> => {
    const { data } = await api.post(
      `/geodata/layers/${id}/export/`,
      { format },
      { responseType: 'blob' }
    );
    return data;
  },
};
