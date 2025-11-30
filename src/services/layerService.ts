import api from './api';

export const layerService = {
  // Get all layers
  getLayers: async () => {
    const { data } = await api.get('/geodata/layers/');
    return data;
  },

  // Get single layer
  getLayer: async (id: number) => {
    const { data } = await api.get(`/geodata/layers/${id}/`);
    return data;
  },

  // Upload layer from file
  uploadLayer: async (formData: FormData) => {
    const { data } = await api.post('/geodata/layers/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Delete layer
  deleteLayer: async (id: number) => {
    await api.delete(`/geodata/layers/${id}/`);
  },

  // Export as GeoJSON
  exportGeoJSON: async (id: number) => {
    const { data } = await api.get(`/geodata/layers/${id}/export_geojson/`);
    return data;
  },

  // Export as Shapefile
  exportShapefile: async (id: number) => {
    const { data } = await api.get(`/geodata/layers/${id}/export_shapefile/`);
    return data;
  },

  // Get features for a layer
  getFeatures: async (layerId: number) => {
    const { data } = await api.get('/geodata/features/', {
      params: { layer: layerId }
    });
    return data;
  },
};
