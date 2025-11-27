import type { Layer, Analysis } from '../types';

export const mockLayers: Layer[] = [
  {
    id: 1,
    name: 'Zonas de Riesgo Inundación',
    description: 'Mapa de zonas con alto riesgo de inundación en temporada de lluvias',
    layer_type: 'vector',
    geometry_type: 'Polygon',
    srid: 4326,
    is_active: true,
    feature_count: 245,
    created_at: '2024-11-20T10:00:00Z',
  },
  {
    id: 2,
    name: 'Estaciones Meteorológicas',
    description: 'Ubicación de estaciones de monitoreo meteorológico',
    layer_type: 'vector',
    geometry_type: 'Point',
    srid: 4326,
    is_active: true,
    feature_count: 42,
    created_at: '2024-11-18T15:30:00Z',
  },
  {
    id: 3,
    name: 'Red Vial Principal',
    description: 'Carreteras principales y secundarias de la región',
    layer_type: 'vector',
    geometry_type: 'LineString',
    srid: 4326,
    is_active: true,
    feature_count: 1523,
    created_at: '2024-11-15T08:20:00Z',
  },
  {
    id: 4,
    name: 'Cobertura Vegetal',
    description: 'Clasificación de tipos de cobertura vegetal por zona',
    layer_type: 'raster',
    geometry_type: 'Polygon',
    srid: 4326,
    is_active: false,
    feature_count: 89,
    created_at: '2024-11-10T12:45:00Z',
  },
  {
    id: 5,
    name: 'Áreas Protegidas',
    description: 'Delimitación de áreas de conservación y protección ambiental',
    layer_type: 'vector',
    geometry_type: 'MultiPolygon',
    srid: 4326,
    is_active: true,
    feature_count: 15,
    created_at: '2024-11-05T09:15:00Z',
  },
];

export const mockAnalyses: Analysis[] = [
  {
    id: 1,
    layer: 1,
    status: 'completed',
    analysis_type: 'change_detection',
    result: { 
      changes_detected: 23, 
      affected_area: '45.3 km²',
      summary: 'Se detectaron 23 cambios significativos en las zonas de riesgo'
    },
    started_at: '2024-11-26T08:00:00Z',
    completed_at: '2024-11-26T08:15:00Z',
  },
  {
    id: 2,
    layer: 2,
    status: 'running',
    analysis_type: 'spatial_interpolation',
    started_at: '2024-11-26T10:30:00Z',
  },
  {
    id: 3,
    layer: 1,
    status: 'completed',
    analysis_type: 'risk_analysis',
    result: { 
      high_risk_zones: 12, 
      medium_risk_zones: 34,
      low_risk_zones: 89,
      summary: 'Análisis de riesgo completado con 12 zonas de alto riesgo identificadas'
    },
    started_at: '2024-11-25T14:20:00Z',
    completed_at: '2024-11-25T14:45:00Z',
  },
  {
    id: 4,
    layer: 3,
    status: 'failed',
    analysis_type: 'connectivity_analysis',
    started_at: '2024-11-25T11:00:00Z',
  },
  {
    id: 5,
    layer: 5,
    status: 'pending',
    analysis_type: 'classification',
    started_at: '2024-11-26T12:00:00Z',
  },
];

export const mockAgents = [
  {
    id: 1,
    name: 'Gemini Pro Geo',
    agent_type: 'gemini',
    model: 'gemini-pro',
    is_active: true,
    capabilities: ['spatial_analysis', 'pattern_detection', 'risk_assessment'],
  },
  {
    id: 2,
    name: 'GPT-4 Spatial',
    agent_type: 'gpt',
    model: 'gpt-4',
    is_active: true,
    capabilities: ['change_detection', 'classification', 'predictive_analysis'],
  },
  {
    id: 3,
    name: 'Claude 3 Sonnet',
    agent_type: 'claude',
    model: 'claude-3-sonnet-20240229',
    is_active: true,
    capabilities: ['deep_analysis', 'multi_layer_overlay', 'complex_queries'],
  },
];
