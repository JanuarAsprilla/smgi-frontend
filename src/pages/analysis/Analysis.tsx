/**
 * Analysis Page - Análisis con IA Completo
 * SMGI Frontend - Versión 3.1 FUNCIONAL
 * 
 * 3 TIPOS DE ANÁLISIS:
 * 1. Agentes Predeterminados - EJECUTAN EN FRONTEND (funcional)
 * 2. Agentes Personalizados - Código Python (backend)
 * 3. Análisis con LLM - Groq/Gemini GRATIS (funcional)
 */

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService, layerService } from '../../services';
import { useToast } from '../../components/ui/Toast';
import {
  BrainCircuit,
  Loader2,
  CheckCircle2,
  XCircle,
  Play,
  Eye,
  RefreshCw,
  Code,
  Upload,
  Sparkles,
  AlertTriangle,
  X,
  FileCode,
  History,
  PlusCircle,
  BarChart3,
  MapPin,
  Ruler,
  GitCompare,
  Shield,
  FileText,
  Filter,
  Send,
  Bot,
  Key,
  Check,
  Copy,
  ExternalLink,
  Wand2,
  TrendingUp,
  PieChart,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Layer {
  id: number;
  name: string;
  description?: string;
  geometry_type?: string;
  feature_count?: number;
  srid?: number;
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: any;
  properties: Record<string, any>;
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface Execution {
  id: number;
  agent: number;
  agent_name?: string;
  name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  parameters?: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  duration?: number;
  created_at: string;
}

interface LocalAnalysisResult {
  id: string;
  name: string;
  layerName: string;
  type: string;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: Date;
}

// ============================================================================
// Funciones de Geometría (para análisis en frontend)
// ============================================================================

function calculateArea(geometry: any): number {
  if (!geometry) return 0;
  const type = geometry.type;
  const coords = geometry.coordinates;

  if (type === 'Polygon') return Math.abs(polygonArea(coords[0]));
  if (type === 'MultiPolygon') {
    return coords.reduce((sum: number, poly: any) => sum + Math.abs(polygonArea(poly[0])), 0);
  }
  return 0;
}

function polygonArea(ring: number[][]): number {
  if (!ring || ring.length < 3) return 0;
  let area = 0;
  const n = ring.length;
  for (let i = 0; i < n - 1; i++) {
    const j = (i + 1) % n;
    // Conversión aproximada a metros cuadrados
    const x1 = ring[i][0] * 111320 * Math.cos((ring[i][1] * Math.PI) / 180);
    const y1 = ring[i][1] * 110540;
    const x2 = ring[j][0] * 111320 * Math.cos((ring[j][1] * Math.PI) / 180);
    const y2 = ring[j][1] * 110540;
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

function calculatePerimeter(geometry: any): number {
  if (!geometry) return 0;
  const type = geometry.type;
  const coords = geometry.coordinates;

  if (type === 'Polygon') return ringPerimeter(coords[0]);
  if (type === 'MultiPolygon') {
    return coords.reduce((sum: number, poly: any) => sum + ringPerimeter(poly[0]), 0);
  }
  if (type === 'LineString') return lineLength(coords);
  return 0;
}

function ringPerimeter(ring: number[][]): number {
  if (!ring) return 0;
  let perimeter = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    perimeter += haversineDistance(ring[i], ring[i + 1]);
  }
  return perimeter;
}

function lineLength(coords: number[][]): number {
  if (!coords) return 0;
  let length = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    length += haversineDistance(coords[i], coords[i + 1]);
  }
  return length;
}

function haversineDistance(coord1: number[], coord2: number[]): number {
  const R = 6371000; // Radio de la Tierra en metros
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const deltaLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const deltaLon = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateCentroid(geometry: any): { x: number; y: number } | null {
  if (!geometry) return null;
  const type = geometry.type;
  const coords = geometry.coordinates;

  if (type === 'Point') return { x: coords[0], y: coords[1] };
  if (type === 'Polygon' && coords[0]) {
    const ring = coords[0];
    const n = ring.length - 1;
    if (n < 1) return null;
    let sumX = 0, sumY = 0;
    for (let i = 0; i < n; i++) {
      sumX += ring[i][0];
      sumY += ring[i][1];
    }
    return { x: sumX / n, y: sumY / n };
  }
  if (type === 'MultiPolygon') {
    const centroids = coords.map((poly: any) => {
      if (!poly[0]) return null;
      const ring = poly[0];
      const n = ring.length - 1;
      if (n < 1) return null;
      let sumX = 0, sumY = 0;
      for (let i = 0; i < n; i++) {
        sumX += ring[i][0];
        sumY += ring[i][1];
      }
      return { x: sumX / n, y: sumY / n };
    }).filter(Boolean);
    if (centroids.length === 0) return null;
    return {
      x: centroids.reduce((sum: number, c: any) => sum + c.x, 0) / centroids.length,
      y: centroids.reduce((sum: number, c: any) => sum + c.y, 0) / centroids.length,
    };
  }
  return null;
}

function isValidGeometry(geometry: any): boolean {
  if (!geometry || !geometry.type || !geometry.coordinates) return false;
  try {
    const coords = geometry.coordinates;
    if (geometry.type === 'Point') return coords.length >= 2;
    if (geometry.type === 'Polygon') return coords[0]?.length >= 4;
    if (geometry.type === 'MultiPolygon') return coords.every((p: any) => p[0]?.length >= 4);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Análisis Predeterminados (Ejecutados en Frontend)
// ============================================================================

interface BuiltinAnalysis {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  execute: (geojson: GeoJSONCollection, layer: Layer) => any;
}

const BUILTIN_ANALYSES: BuiltinAnalysis[] = [
  {
    id: 'stats',
    name: 'Estadísticas Completas',
    description: 'Calcula área, perímetro, conteo y estadísticas de atributos numéricos.',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    execute: (geojson, layer) => {
      const features = geojson.features || [];
      const count = features.length;

      if (count === 0) return { error: 'No hay features para analizar' };

      let totalArea = 0;
      let totalPerimeter = 0;
      const areas: number[] = [];

      features.forEach((f) => {
        if (f.geometry) {
          const area = calculateArea(f.geometry);
          const perimeter = calculatePerimeter(f.geometry);
          areas.push(area);
          totalArea += area;
          totalPerimeter += perimeter;
        }
      });

      // Estadísticas de atributos numéricos
      const numericStats: Record<string, any> = {};
      const sampleProps = features[0]?.properties || {};

      Object.keys(sampleProps).forEach((key) => {
        const values = features
          .map((f) => f.properties?.[key])
          .filter((v) => typeof v === 'number') as number[];

        if (values.length > 0) {
          numericStats[key] = {
            count: values.length,
            sum: Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100,
            min: Math.round(Math.min(...values) * 100) / 100,
            max: Math.round(Math.max(...values) * 100) / 100,
            avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
          };
        }
      });

      // Tipos de geometría
      const geoTypes: Record<string, number> = {};
      features.forEach((f) => {
        const type = f.geometry?.type || 'null';
        geoTypes[type] = (geoTypes[type] || 0) + 1;
      });

      return {
        '📊 Resumen General': {
          capa: layer.name,
          total_features: count,
          tipo_geometria: layer.geometry_type,
          srid: layer.srid,
        },
        '📐 Estadísticas Espaciales': {
          area_total_m2: Math.round(totalArea * 100) / 100,
          area_total_ha: Math.round((totalArea / 10000) * 100) / 100,
          area_total_km2: Math.round((totalArea / 1000000) * 1000) / 1000,
          perimetro_total_m: Math.round(totalPerimeter * 100) / 100,
          perimetro_total_km: Math.round((totalPerimeter / 1000) * 100) / 100,
        },
        '📏 Áreas por Feature': {
          minima_ha: areas.length > 0 ? Math.round((Math.min(...areas) / 10000) * 100) / 100 : 0,
          maxima_ha: areas.length > 0 ? Math.round((Math.max(...areas) / 10000) * 100) / 100 : 0,
          promedio_ha: areas.length > 0 ? Math.round((totalArea / count / 10000) * 100) / 100 : 0,
        },
        '🔢 Atributos Numéricos': Object.keys(numericStats).length > 0 ? numericStats : 'Sin atributos numéricos',
        '🗺️ Tipos de Geometría': geoTypes,
      };
    },
  },
  {
    id: 'validator',
    name: 'Validador de Calidad',
    description: 'Detecta geometrías inválidas, datos faltantes y genera score de calidad.',
    icon: Shield,
    color: 'from-green-500 to-emerald-500',
    execute: (geojson, _layer) => {
      const features = geojson.features || [];
      const issues: any[] = [];
      let validGeometries = 0;
      let invalidGeometries = 0;
      let nullGeometries = 0;
      let emptyProperties = 0;

      features.forEach((f, idx) => {
        if (!f.geometry) {
          nullGeometries++;
          if (issues.length < 20) issues.push({ feature: idx, tipo: '❌ Sin geometría' });
        } else if (!isValidGeometry(f.geometry)) {
          invalidGeometries++;
          if (issues.length < 20) issues.push({ feature: idx, tipo: '⚠️ Geometría inválida' });
        } else {
          validGeometries++;
        }

        if (!f.properties || Object.keys(f.properties).length === 0) {
          emptyProperties++;
        }
      });

      const total = features.length;
      const qualityScore = total > 0 ? Math.round((validGeometries / total) * 100) : 0;

      let qualityLevel = '🟢 Excelente';
      if (qualityScore < 50) qualityLevel = '🔴 Bajo';
      else if (qualityScore < 75) qualityLevel = '🟡 Regular';
      else if (qualityScore < 90) qualityLevel = '🟢 Bueno';

      const recommendations: string[] = [];
      if (nullGeometries > 0) recommendations.push(`• Revisar ${nullGeometries} features sin geometría`);
      if (invalidGeometries > 0) recommendations.push(`• Reparar ${invalidGeometries} geometrías inválidas`);
      if (emptyProperties > 0) recommendations.push(`• Completar atributos en ${emptyProperties} features`);
      if (recommendations.length === 0) recommendations.push('✅ La capa tiene excelente calidad');

      return {
        '📈 Score de Calidad': `${qualityScore}%`,
        '🏆 Nivel': qualityLevel,
        '📋 Resumen': {
          total_features: total,
          geometrias_validas: validGeometries,
          geometrias_invalidas: invalidGeometries,
          geometrias_nulas: nullGeometries,
          features_sin_atributos: emptyProperties,
        },
        '⚠️ Problemas Detectados': issues.length > 0 ? issues : 'Sin problemas',
        '💡 Recomendaciones': recommendations,
      };
    },
  },
  {
    id: 'coverage',
    name: 'Análisis de Cobertura',
    description: 'Distribución por tipo/categoría con porcentajes y áreas.',
    icon: PieChart,
    color: 'from-purple-500 to-pink-500',
    execute: (geojson, _layer) => {
      const features = geojson.features || [];
      
      // Detectar campo de clasificación
      const sampleProps = features[0]?.properties || {};
      const candidates = ['tipo', 'type', 'clase', 'class', 'category', 'categoria', 'cobertura', 'uso', 'land_use', 'clasificacion', 'name', 'nombre'];
      let classField = null;
      
      for (const field of candidates) {
        if (sampleProps[field] !== undefined) {
          classField = field;
          break;
        }
      }

      if (!classField) {
        // Buscar cualquier campo string con valores repetidos
        for (const [key, value] of Object.entries(sampleProps)) {
          if (typeof value === 'string') {
            classField = key;
            break;
          }
        }
      }

      if (!classField) {
        return {
          '❌ Error': 'No se encontró campo de clasificación',
          '📋 Campos Disponibles': Object.keys(sampleProps),
        };
      }

      const coverage: Record<string, { count: number; area: number }> = {};

      features.forEach((f) => {
        const value = String(f.properties?.[classField] || 'Sin clasificar');
        const area = calculateArea(f.geometry);

        if (!coverage[value]) coverage[value] = { count: 0, area: 0 };
        coverage[value].count++;
        coverage[value].area += area;
      });

      const totalArea = Object.values(coverage).reduce((sum, c) => sum + c.area, 0);
      const totalCount = features.length;

      const distribution = Object.entries(coverage)
        .map(([tipo, data]) => ({
          tipo,
          cantidad: data.count,
          porcentaje_cantidad: `${Math.round((data.count / totalCount) * 1000) / 10}%`,
          area_ha: Math.round((data.area / 10000) * 100) / 100,
          porcentaje_area: `${totalArea > 0 ? Math.round((data.area / totalArea) * 1000) / 10 : 0}%`,
        }))
        .sort((a, b) => b.area_ha - a.area_ha);

      const dominant = distribution[0];

      return {
        '🏷️ Campo de Clasificación': classField,
        '🏆 Tipo Dominante': dominant ? `${dominant.tipo} (${dominant.porcentaje_area})` : 'N/A',
        '📊 Total de Tipos': distribution.length,
        '📋 Distribución': distribution,
      };
    },
  },
  {
    id: 'buffer',
    name: 'Zonas de Influencia',
    description: 'Calcula áreas de buffer y zonas de influencia.',
    icon: Ruler,
    color: 'from-orange-500 to-red-500',
    execute: (geojson, _layer) => {
      const features = geojson.features || [];
      const bufferDistance = 100; // metros por defecto
      
      let totalOriginalArea = 0;
      let totalBufferArea = 0;
      const details: any[] = [];

      features.slice(0, 30).forEach((f, idx) => {
        const originalArea = calculateArea(f.geometry);
        const perimeter = calculatePerimeter(f.geometry);
        // Área aproximada del buffer: área original + (perímetro × distancia) + (π × distancia²)
        const bufferArea = originalArea + (perimeter * bufferDistance) + (Math.PI * bufferDistance * bufferDistance);
        
        totalOriginalArea += originalArea;
        totalBufferArea += bufferArea;

        details.push({
          feature: idx + 1,
          nombre: f.properties?.nombre || f.properties?.name || `Feature ${idx + 1}`,
          area_original_ha: Math.round((originalArea / 10000) * 100) / 100,
          area_con_buffer_ha: Math.round((bufferArea / 10000) * 100) / 100,
        });
      });

      return {
        '⚙️ Parámetros': {
          distancia_buffer_m: bufferDistance,
          features_analizadas: Math.min(features.length, 30),
          total_features: features.length,
        },
        '📊 Resumen': {
          area_original_ha: Math.round((totalOriginalArea / 10000) * 100) / 100,
          area_con_buffer_ha: Math.round((totalBufferArea / 10000) * 100) / 100,
          incremento_ha: Math.round(((totalBufferArea - totalOriginalArea) / 10000) * 100) / 100,
          porcentaje_incremento: totalOriginalArea > 0 
            ? `${Math.round(((totalBufferArea - totalOriginalArea) / totalOriginalArea) * 100)}%` 
            : '0%',
        },
        '📋 Detalle (primeros 30)': details,
      };
    },
  },
  {
    id: 'compare',
    name: 'Análisis Temporal',
    description: 'Analiza distribución temporal si hay campos de fecha.',
    icon: GitCompare,
    color: 'from-red-500 to-rose-500',
    execute: (geojson, _layer) => {
      const features = geojson.features || [];
      const sampleProps = features[0]?.properties || {};
      
      // Detectar campos de fecha
      const dateFields = Object.keys(sampleProps).filter((key) => {
        const value = sampleProps[key];
        if (typeof value !== 'string') return false;
        return /\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|^\d{4}$/.test(value);
      });

      if (dateFields.length === 0) {
        return {
          '⚠️ Aviso': 'No se detectaron campos de fecha en los datos',
          '📋 Campos Disponibles': Object.keys(sampleProps),
          '📊 Estadísticas Actuales': {
            total_features: features.length,
            area_total_ha: Math.round(features.reduce((sum, f) => sum + calculateArea(f.geometry), 0) / 10000),
          },
        };
      }

      const dateField = dateFields[0];
      const temporal: Record<string, number> = {};

      features.forEach((f) => {
        const dateValue = f.properties?.[dateField];
        if (dateValue) {
          const match = String(dateValue).match(/\d{4}/);
          const year = match ? match[0] : 'Desconocido';
          temporal[year] = (temporal[year] || 0) + 1;
        }
      });

      const distribution = Object.entries(temporal)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([periodo, cantidad]) => ({ periodo, cantidad }));

      return {
        '📅 Campo de Fecha Detectado': dateField,
        '📊 Distribución Temporal': distribution,
        '📈 Períodos Encontrados': Object.keys(temporal).length,
        '📋 Total Features': features.length,
      };
    },
  },
  {
    id: 'report',
    name: 'Generador de Reporte',
    description: 'Reporte completo con toda la información de la capa.',
    icon: FileText,
    color: 'from-teal-500 to-cyan-500',
    execute: (geojson, layer) => {
      const features = geojson.features || [];
      const sampleProps = features[0]?.properties || {};
      const fields = Object.keys(sampleProps);

      let totalArea = 0;
      let totalPerimeter = 0;

      features.forEach((f) => {
        totalArea += calculateArea(f.geometry);
        totalPerimeter += calculatePerimeter(f.geometry);
      });

      // Análisis de campos
      const fieldAnalysis: Record<string, any> = {};
      fields.slice(0, 10).forEach((field) => {
        const values = features.map((f) => f.properties?.[field]).filter((v) => v != null);
        const uniqueValues = new Set(values);

        fieldAnalysis[field] = {
          valores_totales: values.length,
          valores_unicos: uniqueValues.size,
          tipo: typeof values[0],
          muestra: Array.from(uniqueValues).slice(0, 3),
        };
      });

      return {
        '📋 Metadata': {
          generado: new Date().toLocaleString('es-CO'),
          generador: 'SMGI - Centro de Análisis',
          version: '3.1',
        },
        '🗺️ Información de Capa': {
          nombre: layer.name,
          total_features: features.length,
          tipo_geometria: layer.geometry_type,
          srid: layer.srid,
          total_campos: fields.length,
        },
        '📐 Estadísticas Espaciales': {
          area_total_ha: Math.round((totalArea / 10000) * 100) / 100,
          area_total_km2: Math.round((totalArea / 1000000) * 1000) / 1000,
          perimetro_total_km: Math.round((totalPerimeter / 1000) * 100) / 100,
          area_promedio_ha: Math.round((totalArea / features.length / 10000) * 100) / 100,
        },
        '📊 Análisis de Campos': fieldAnalysis,
        '📝 Muestra de Datos': features.slice(0, 2).map((f) => f.properties),
      };
    },
  },
  {
    id: 'centroid',
    name: 'Centroides',
    description: 'Calcula el centro geométrico de cada feature.',
    icon: MapPin,
    color: 'from-pink-500 to-rose-500',
    execute: (geojson, _layer) => {
      const features = geojson.features || [];
      const centroids: any[] = [];
      let sumX = 0, sumY = 0, validCount = 0;

      features.slice(0, 50).forEach((f, idx) => {
        const centroid = calculateCentroid(f.geometry);
        if (centroid) {
          centroids.push({
            id: idx + 1,
            nombre: f.properties?.nombre || f.properties?.name || `Feature ${idx + 1}`,
            longitud: Math.round(centroid.x * 1000000) / 1000000,
            latitud: Math.round(centroid.y * 1000000) / 1000000,
          });
          sumX += centroid.x;
          sumY += centroid.y;
          validCount++;
        }
      });

      // Bounding Box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      features.forEach((f) => {
        if (f.geometry?.coordinates) {
          const coords = JSON.stringify(f.geometry.coordinates);
          const numbers = coords.match(/-?\d+\.?\d*/g)?.map(Number) || [];
          for (let i = 0; i < numbers.length; i += 2) {
            if (numbers[i] < minX) minX = numbers[i];
            if (numbers[i] > maxX) maxX = numbers[i];
            if (numbers[i + 1] < minY) minY = numbers[i + 1];
            if (numbers[i + 1] > maxY) maxY = numbers[i + 1];
          }
        }
      });

      return {
        '📍 Centroide General': validCount > 0 ? {
          longitud: Math.round((sumX / validCount) * 1000000) / 1000000,
          latitud: Math.round((sumY / validCount) * 1000000) / 1000000,
        } : 'No calculable',
        '📦 Bounding Box': {
          suroeste: `${Math.round(minY * 10000) / 10000}, ${Math.round(minX * 10000) / 10000}`,
          noreste: `${Math.round(maxY * 10000) / 10000}, ${Math.round(maxX * 10000) / 10000}`,
        },
        '📋 Centroides por Feature': centroids,
        '📊 Total Calculados': `${centroids.length} de ${features.length}`,
      };
    },
  },
  {
    id: 'filter',
    name: 'Explorador de Atributos',
    description: 'Explora y resume los atributos de la capa.',
    icon: Filter,
    color: 'from-indigo-500 to-purple-500',
    execute: (geojson, layer) => {
      const features = geojson.features || [];
      const sampleProps = features[0]?.properties || {};
      const fields = Object.keys(sampleProps);

      const fieldSummary = fields.map((field) => {
        const values = features.map((f) => f.properties?.[field]);
        const nonNull = values.filter((v) => v != null);
        const unique = new Set(nonNull);
        const firstValue = nonNull[0];
        const tipo = typeof firstValue;

        let stats: any = {
          campo: field,
          tipo,
          valores_totales: nonNull.length,
          valores_unicos: unique.size,
          nulos: values.length - nonNull.length,
        };

        if (tipo === 'number') {
          const nums = nonNull as number[];
          stats.min = Math.round(Math.min(...nums) * 100) / 100;
          stats.max = Math.round(Math.max(...nums) * 100) / 100;
          stats.promedio = Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
        } else if (unique.size <= 10) {
          stats.valores = Array.from(unique).slice(0, 10);
        }

        return stats;
      });

      return {
        '📊 Resumen de Capa': {
          nombre: layer.name,
          total_features: features.length,
          total_campos: fields.length,
        },
        '📋 Análisis de Campos': fieldSummary,
        '📝 Muestra de Datos': features.slice(0, 5).map((f, i) => ({
          feature: i + 1,
          ...f.properties,
        })),
      };
    },
  },
];

// ============================================================================
// Prompts predefinidos para LLM
// ============================================================================

const LLM_PROMPTS = [
  {
    id: 'summary',
    name: 'Resumen General',
    prompt: 'Analiza estos datos geoespaciales y proporciona un resumen ejecutivo con los hallazgos más importantes.',
    icon: FileText,
  },
  {
    id: 'patterns',
    name: 'Detectar Patrones',
    prompt: 'Identifica patrones espaciales, clusters o agrupaciones en estos datos. ¿Hay concentraciones geográficas?',
    icon: TrendingUp,
  },
  {
    id: 'anomalies',
    name: 'Buscar Anomalías',
    prompt: 'Busca anomalías, outliers o datos atípicos. ¿Hay features con valores inusuales o geometrías extrañas?',
    icon: AlertTriangle,
  },
  {
    id: 'recommendations',
    name: 'Recomendaciones',
    prompt: 'Basándote en estos datos, ¿qué acciones o análisis adicionales recomendarías?',
    icon: Wand2,
  },
];

// ============================================================================
// LLM Service (Groq/Gemini GRATIS) - MODELOS ACTUALIZADOS
// ============================================================================

interface LLMConfig {
  provider: 'groq' | 'gemini';
  apiKey: string;
  model: string;
}

const analyzWithLLM = async (
  layerData: any,
  geojson: GeoJSONCollection | null,
  prompt: string,
  config: LLMConfig
): Promise<string> => {
  if (!config.apiKey) {
    throw new Error('API Key no configurada');
  }

  // Preparar datos para el LLM
  const sampleFeatures = geojson?.features?.slice(0, 15) || [];
  const stats = {
    total_features: geojson?.features?.length || layerData.feature_count,
    area_total_ha: sampleFeatures.length > 0 
      ? Math.round(sampleFeatures.reduce((sum, f) => sum + calculateArea(f.geometry), 0) / 10000)
      : 'No disponible',
  };

  const dataForLLM = {
    layer_name: layerData.name,
    geometry_type: layerData.geometry_type,
    feature_count: layerData.feature_count,
    srid: layerData.srid,
    statistics: stats,
    sample_properties: sampleFeatures.map(f => f.properties),
    attributes: Object.keys(sampleFeatures[0]?.properties || {}),
  };

  const systemPrompt = `Eres un experto en análisis de datos geoespaciales y GIS. 
Analiza los datos proporcionados y responde en español de forma clara y estructurada.
Usa formato markdown para mejor legibilidad.
Si los datos tienen coordenadas, indica el sistema de referencia (SRID).
Proporciona insights accionables y recomendaciones cuando sea apropiado.`;

  const userPrompt = `${prompt}

DATOS DE LA CAPA "${layerData.name}":
- Total features: ${dataForLLM.feature_count}
- Tipo geometría: ${dataForLLM.geometry_type}
- SRID: ${dataForLLM.srid}
- Área total aproximada: ${dataForLLM.statistics.area_total_ha} hectáreas
- Campos disponibles: ${dataForLLM.attributes.join(', ')}

MUESTRA DE DATOS (${sampleFeatures.length} features):
\`\`\`json
${JSON.stringify(dataForLLM.sample_properties, null, 2)}
\`\`\``;

  if (config.provider === 'groq') {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Error de API: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sin respuesta';
  }

  // Gemini
  if (config.provider === 'gemini') {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
    
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Error de API: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
  }

  throw new Error('Proveedor no soportado');
};

// ============================================================================
// Modal de Configuración LLM
// ============================================================================

interface LLMConfigModalProps {
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
  onClose: () => void;
}

const LLMConfigModal: React.FC<LLMConfigModalProps> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg">
                <Key className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Configurar LLM</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor de IA
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLocalConfig({ ...localConfig, provider: 'groq', model: 'llama-3.3-70b-versatile' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    localConfig.provider === 'groq'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Groq</div>
                  <div className="text-xs text-gray-500 mt-1">LLaMA 3.3 - Ultra rápido</div>
                  <div className="text-xs text-green-600 font-medium mt-1">✓ GRATIS</div>
                </button>
                <button
                  onClick={() => setLocalConfig({ ...localConfig, provider: 'gemini', model: 'gemini-1.5-flash' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    localConfig.provider === 'gemini'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Gemini</div>
                  <div className="text-xs text-gray-500 mt-1">Google AI</div>
                  <div className="text-xs text-green-600 font-medium mt-1">✓ GRATIS</div>
                </button>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={localConfig.apiKey}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={localConfig.provider === 'groq' ? 'gsk_...' : 'AIza...'}
              />
              <p className="mt-2 text-xs text-gray-500">
                {localConfig.provider === 'groq' ? (
                  <>
                    Obtén tu API Key gratis en{' '}
                    <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      console.groq.com <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </>
                ) : (
                  <>
                    Obtén tu API Key gratis en{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      Google AI Studio <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* Model - ACTUALIZADO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {localConfig.provider === 'groq' ? (
                  <>
                    <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B (Recomendado)</option>
                    <option value="llama-3.1-8b-instant">LLaMA 3.1 8B (Más rápido)</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                    <option value="gemma2-9b-it">Gemma 2 9B</option>
                  </>
                ) : (
                  <>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recomendado)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onSave(localConfig);
                onClose();
              }}
              disabled={!localConfig.apiKey}
              className="flex-1 px-4 py-2 bg-linear-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Panel de Análisis con LLM
// ============================================================================

interface LLMAnalysisPanelProps {
  layers: Layer[];
}

const LLMAnalysisPanel: React.FC<LLMAnalysisPanelProps> = ({ layers }) => {
  const toast = useToast();
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  
  // Cargar configuración del localStorage - MODELO ACTUALIZADO
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(() => {
    const saved = localStorage.getItem('smgi_llm_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Actualizar modelo si es el descontinuado
      if (parsed.model === 'llama-3.1-70b-versatile') {
        parsed.model = 'llama-3.3-70b-versatile';
      }
      return parsed;
    }
    return {
      provider: 'groq',
      apiKey: '',
      model: 'llama-3.3-70b-versatile', // MODELO ACTUALIZADO
    };
  });

  // Guardar configuración
  const saveLLMConfig = (config: LLMConfig) => {
    setLlmConfig(config);
    localStorage.setItem('smgi_llm_config', JSON.stringify(config));
    toast.success('Configuración guardada', 'La API Key se ha guardado correctamente');
  };

  // Cargar GeoJSON de la capa
  const { data: geojsonData, isLoading: loadingGeoJSON } = useQuery({
    queryKey: ['layer-geojson-llm', selectedLayer],
    queryFn: async () => {
      if (!selectedLayer) return null;
      try {
        const data = await layerService.getLayerGeoJSON(selectedLayer);
        return data as GeoJSONCollection;
      } catch (error) {
        console.error('Error cargando GeoJSON:', error);
        return null;
      }
    },
    enabled: !!selectedLayer,
  });

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  const runAnalysis = async () => {
    if (!selectedLayer || !prompt.trim()) {
      toast.warning('Atención', 'Selecciona una capa y escribe un prompt');
      return;
    }

    if (!llmConfig.apiKey) {
      setShowConfig(true);
      return;
    }

    setIsAnalyzing(true);
    setResponse(null);

    try {
      const result = await analyzWithLLM(selectedLayerData, geojsonData || null, prompt, llmConfig);
      setResponse(result);
      toast.success('Análisis completado', 'La IA ha procesado tu solicitud');
    } catch (error: any) {
      toast.error('Error', error.message || 'Error al analizar');
      setResponse(`Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con config */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Análisis con IA Generativa</h3>
          <p className="text-sm text-gray-500">Usa LLMs gratuitos para analizar tus datos</p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            llmConfig.apiKey
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-orange-500 bg-orange-50 text-orange-700'
          }`}
        >
          {llmConfig.apiKey ? <Check className="h-4 w-4" /> : <Key className="h-4 w-4" />}
          {llmConfig.apiKey ? `${llmConfig.provider.toUpperCase()} conectado` : 'Configurar API'}
        </button>
      </div>

      {/* Selector de capa y prompts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capa a analizar
          </label>
          <select
            value={selectedLayer || ''}
            onChange={(e) => setSelectedLayer(Number(e.target.value) || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecciona una capa</option>
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.name} ({layer.feature_count} features)
              </option>
            ))}
          </select>
          
          {selectedLayer && selectedLayerData && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <span>Tipo: <strong>{selectedLayerData.geometry_type}</strong></span>
                <span>Features: <strong>{selectedLayerData.feature_count}</strong></span>
                <span>SRID: <strong>{selectedLayerData.srid}</strong></span>
                <span>GeoJSON: {loadingGeoJSON ? <Loader2 className="h-3 w-3 animate-spin inline" /> : geojsonData ? '✓' : '⚠️'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Prompts rápidos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Análisis rápidos
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LLM_PROMPTS.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => setPrompt(template.prompt)}
                  className="flex items-center gap-2 p-2 text-left text-sm border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <Icon className="h-4 w-4 text-purple-500 shrink-0" />
                  <span className="truncate">{template.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prompt input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ¿Qué quieres analizar?
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none pr-12"
            placeholder="Escribe tu pregunta sobre los datos... Ej: ¿Cuáles son las áreas con mayor concentración?"
          />
          <button
            onClick={runAnalysis}
            disabled={!selectedLayer || !prompt.trim() || isAnalyzing}
            className="absolute bottom-3 right-3 p-2 bg-linear-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Response */}
      {isAnalyzing && (
        <div className="flex items-center justify-center gap-3 py-8 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-purple-700">Analizando con {llmConfig.provider.toUpperCase()} ({llmConfig.model})...</span>
        </div>
      )}

      {response && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-linear-to-br from-purple-500 to-pink-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-medium">Respuesta de {llmConfig.provider.toUpperCase()}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(response);
                toast.success('Copiado', 'Respuesta copiada al portapapeles');
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {response}
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      {showConfig && (
        <LLMConfigModal
          config={llmConfig}
          onSave={saveLLMConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// Modal de Ejecución para Agentes del Backend
// ============================================================================

interface ExecuteModalProps {
  agent: any;
  layers: Layer[];
  onClose: () => void;
  onSuccess: () => void;
}

const ExecuteAgentModal: React.FC<ExecuteModalProps> = ({ agent, layers, onClose, onSuccess }) => {
  const toast = useToast();
  const [selectedLayers, setSelectedLayers] = useState<number[]>([]);

  const executeMutation = useMutation({
    mutationFn: () => agentService.executeAgent(agent.id, {
      parameters: {
        input_layers: selectedLayers,
      },
    }),
    onSuccess: () => {
      toast.success('Ejecución iniciada', 'El agente está procesando...');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.error || 'Error al ejecutar');
    },
  });

  const toggleLayer = (id: number) => {
    setSelectedLayers(prev => 
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Ejecutar: {agent.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">{agent.description}</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capas de entrada <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
              {layers.map((layer) => (
                <label
                  key={layer.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedLayers.includes(layer.id)}
                    onChange={() => toggleLayer(layer.id)}
                    className="h-4 w-4 text-purple-600 rounded"
                  />
                  <span className="text-sm text-gray-900">{layer.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{layer.feature_count} features</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => executeMutation.mutate()}
              disabled={selectedLayers.length === 0 || executeMutation.isPending}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {executeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Ejecutar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Modal de Crear Agente
// ============================================================================

interface CreateAgentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentType, setAgentType] = useState('statistics');
  const [fileName, setFileName] = useState('');
  const [code, setCode] = useState(`# Variables disponibles:
# - input_layers: lista de capas de entrada
# - parameters: diccionario de parámetros  
# - output_data: diccionario para guardar resultados
# - logger: para logging

import logging
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

# Tu código aquí...
count = features.count()

output_data['feature_count'] = count
output_data['layer_name'] = layer.name

logger.info(f"Procesadas {count} features")
`);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.py')) {
        toast.error('Error', 'Solo se permiten archivos .py');
        return;
      }
      
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
        if (!name) {
          setName(file.name.replace('.py', '').replace(/_/g, ' '));
        }
      };
      reader.readAsText(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      // Obtener categorías para asignar la primera por defecto
      const categories = await agentService.getCategories();
      const defaultCategory = categories.results[0]?.id || 1;
      
      const agent = await agentService.createAgent({
        name,
        description,
        category: defaultCategory,
        agent_type: agentType,
        code,
        is_public: false,
      });
      
      await agentService.publishAgent(agent.id);
      return agent;
    },
    onSuccess: () => {
      toast.success('Agente creado', 'El agente se ha creado y publicado');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.code?.[0] 
        || error.response?.data?.error 
        || error.response?.data?.detail
        || error.message 
        || 'Error al crear el agente';
      toast.error('Error', errorMsg);
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-linear-to-br from-green-500 to-teal-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileCode className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Crear Agente</h2>
                  <p className="text-green-100 text-sm">Escribe código o sube un archivo .py</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Upload button */}
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                <Upload className="h-4 w-4" />
                Subir archivo .py
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".py"
                onChange={handleFileUpload}
                className="hidden"
              />
              {fileName && (
                <span className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                  <Check className="h-4 w-4" />
                  {fileName}
                </span>
              )}
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Mi Agente de Análisis"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="statistics">Estadísticas</option>
                  <option value="classification">Clasificación</option>
                  <option value="detection">Detección</option>
                  <option value="transformation">Transformación</option>
                  <option value="analysis">Análisis</option>
                  <option value="validation">Validación</option>
                  <option value="export">Exportación</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="¿Qué hace tu agente?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Python <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  {fileName || 'agent_code.py'}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none resize-y"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!name || !code || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-linear-to-br from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Crear Agente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Modal de Resultado de Análisis Local
// ============================================================================

interface LocalResultModalProps {
  result: LocalAnalysisResult;
  onClose: () => void;
}

const LocalResultModal: React.FC<LocalResultModalProps> = ({ result, onClose }) => {
  const toast = useToast();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className={`p-4 flex items-center justify-between ${
            result.status === 'completed' ? 'bg-linear-to-br from-green-500 to-emerald-500' :
            result.status === 'failed' ? 'bg-linear-to-br from-red-500 to-rose-500' :
            'bg-linear-to-br from-blue-500 to-cyan-500'
          } text-white`}>
            <div className="flex items-center gap-3">
              {result.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> :
               result.status === 'failed' ? <XCircle className="h-5 w-5" /> :
               <Loader2 className="h-5 w-5 animate-spin" />}
              <div>
                <h3 className="font-bold">{result.name}</h3>
                <p className="text-sm opacity-90">{result.layerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(result.result, null, 2));
                  toast.success('Copiado', 'Resultado copiado al portapapeles');
                }}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {result.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <strong>Error:</strong> {result.error}
              </div>
            ) : (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Componente Principal
// ============================================================================

export default function Analysis() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'llm' | 'builtin' | 'custom' | 'history'>('llm');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  
  // Estado para análisis locales (frontend)
  const [localResults, setLocalResults] = useState<LocalAnalysisResult[]>([]);
  const [selectedLocalResult, setSelectedLocalResult] = useState<LocalAnalysisResult | null>(null);
  const [selectedBuiltinLayer, setSelectedBuiltinLayer] = useState<number | null>(null);
  const [runningAnalysis, setRunningAnalysis] = useState<string | null>(null);

  // Queries
  const { data: layersData } = useQuery({
    queryKey: ['layers'],
    queryFn: () => layerService.getLayers({ page_size: 100 }),
  });

  const { data: agentsData, isLoading: loadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => agentService.getAgents({ status: 'published' }),
  });

  const { data: executionsData, refetch: refetchExecutions } = useQuery({
    queryKey: ['executions'],
    queryFn: () => agentService.getExecutions({ ordering: '-created_at' }),
    refetchInterval: 5000,
  });

  const layers = layersData?.results || [];
  const agents = agentsData?.results || [];
  const executions = executionsData?.results || [];

  // Cargar GeoJSON para análisis predeterminados
  const { data: builtinGeojson, isLoading: loadingBuiltinGeojson } = useQuery({
    queryKey: ['builtin-geojson', selectedBuiltinLayer],
    queryFn: async () => {
      if (!selectedBuiltinLayer) return null;
      try {
        const data = await layerService.getLayerGeoJSON(selectedBuiltinLayer);
        return data as GeoJSONCollection;
      } catch (error) {
        console.error('Error cargando GeoJSON:', error);
        return null;
      }
    },
    enabled: !!selectedBuiltinLayer,
  });

  // Ejecutar análisis predeterminado
  const runBuiltinAnalysis = async (analysis: BuiltinAnalysis) => {
    if (!selectedBuiltinLayer) {
      toast.warning('Atención', 'Selecciona una capa primero');
      return;
    }

    if (!builtinGeojson) {
      toast.error('Error', 'No se pudo cargar los datos de la capa');
      return;
    }

    const layerData = layers.find(l => l.id === selectedBuiltinLayer);
    if (!layerData) return;

    setRunningAnalysis(analysis.id);

    const resultId = `local-${Date.now()}`;
    const newResult: LocalAnalysisResult = {
      id: resultId,
      name: analysis.name,
      layerName: layerData.name,
      type: analysis.id,
      status: 'running',
      timestamp: new Date(),
    };

    setLocalResults(prev => [newResult, ...prev]);

    // Simular pequeño delay para UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Validar que layerData tenga los campos requeridos
      const validLayerData: Layer = {
        ...layerData,
        geometry_type: layerData.geometry_type || 'Unknown',
        feature_count: layerData.feature_count || 0,
        srid: layerData.srid || 4326,
      };
      
      const result = analysis.execute(builtinGeojson, validLayerData);
      
      setLocalResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'completed', result } 
          : r
      ));
      
      toast.success('Análisis completado', `${analysis.name} ejecutado correctamente`);
      setActiveTab('history');
    } catch (error: any) {
      setLocalResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'failed', error: error.message } 
          : r
      ));
      toast.error('Error', error.message);
    } finally {
      setRunningAnalysis(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                <BrainCircuit className="h-6 w-6" />
              </div>
              Centro de Análisis
            </h1>
            <p className="text-gray-500 mt-1">
              Analiza tus capas geoespaciales con IA y agentes especializados
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 shadow-lg"
          >
            <PlusCircle className="h-4 w-4" />
            Crear Agente
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 flex-wrap">
          {[
            { id: 'llm', label: 'IA Generativa', icon: Bot, color: 'from-purple-500 to-pink-500' },
            { id: 'builtin', label: 'Predeterminados', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
            { id: 'custom', label: 'Mis Agentes', icon: Code, count: agents.length },
            { id: 'history', label: 'Historial', icon: History, count: localResults.length + executions.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? `bg-linear-to-br ${tab.color || 'from-purple-500 to-pink-500'} text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'llm' && (
        <div className="bg-white rounded-xl border p-6">
          <LLMAnalysisPanel layers={layers} />
        </div>
      )}

      {activeTab === 'builtin' && (
        <div className="space-y-6">
          {/* Selector de capa */}
          <div className="bg-white rounded-xl border p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona una capa para analizar
            </label>
            <select
              value={selectedBuiltinLayer || ''}
              onChange={(e) => setSelectedBuiltinLayer(Number(e.target.value) || null)}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una capa</option>
              {layers.map((layer: Layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name} ({layer.feature_count} features)
                </option>
              ))}
            </select>
            {selectedBuiltinLayer && (
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>Cargando datos: {loadingBuiltinGeojson ? <Loader2 className="h-4 w-4 animate-spin inline" /> : builtinGeojson ? '✓ Listo' : '⚠️ Error'}</span>
              </div>
            )}
          </div>

          {/* Grid de análisis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUILTIN_ANALYSES.map((analysis) => {
              const Icon = analysis.icon;
              const isRunning = runningAnalysis === analysis.id;
              return (
                <div
                  key={analysis.id}
                  className="bg-white rounded-xl border p-5 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${analysis.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{analysis.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{analysis.description}</p>
                  <button
                    onClick={() => runBuiltinAnalysis(analysis)}
                    disabled={!selectedBuiltinLayer || !builtinGeojson || isRunning}
                    className={`w-full py-2 rounded-lg text-white text-sm font-medium bg-linear-to-br ${analysis.color} hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ejecutando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Ejecutar
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <>
          {loadingAgents ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <Code className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No tienes agentes</h3>
              <p className="text-gray-500 mb-4">Crea tu primer agente con código Python</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear Agente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent: any) => (
                <div key={agent.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BrainCircuit className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      {agent.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{agent.description || 'Sin descripción'}</p>
                  <button
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Ejecutar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {localResults.length} análisis locales + {executions.length} ejecuciones backend
            </span>
            <button
              onClick={() => refetchExecutions()}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>

          {localResults.length === 0 && executions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900">Sin historial</h3>
              <p className="text-gray-500">Ejecuta un análisis para ver resultados aquí</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Análisis</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Capa</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Resultados locales */}
                  {localResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{result.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{result.layerName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === 'completed' ? 'bg-green-100 text-green-700' :
                          result.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {result.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                          {result.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">Frontend</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {result.timestamp.toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLocalResult(result)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Ejecuciones del backend */}
                  {executions.map((exec: Execution) => (
                    <tr key={`exec-${exec.id}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {exec.agent_name || `Agente #${exec.agent}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{exec.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          exec.status === 'completed' ? 'bg-green-100 text-green-700' :
                          exec.status === 'running' ? 'bg-blue-100 text-blue-700' :
                          exec.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {exec.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">Backend</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(exec.created_at).toLocaleString('es-CO')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedExecution(exec)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['agents'] })}
        />
      )}

      {selectedAgent && (
        <ExecuteAgentModal
          agent={selectedAgent}
          layers={layers}
          onClose={() => setSelectedAgent(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['executions'] });
            setActiveTab('history');
          }}
        />
      )}

      {selectedLocalResult && (
        <LocalResultModal
          result={selectedLocalResult}
          onClose={() => setSelectedLocalResult(null)}
        />
      )}

      {selectedExecution && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedExecution(null)} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedExecution.name || `Ejecución #${selectedExecution.id}`}
                </h2>
                <button onClick={() => setSelectedExecution(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedExecution.result && (
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedExecution.result, null, 2)}
                  </pre>
                )}
                {selectedExecution.error_message && (
                  <pre className="bg-red-50 text-red-800 p-4 rounded-lg text-xs border border-red-200">
                    {selectedExecution.error_message}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}