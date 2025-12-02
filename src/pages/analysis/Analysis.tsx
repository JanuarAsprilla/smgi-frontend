/**
 * Analysis Page - Análisis con Agentes de IA
 * SMGI Frontend - Versión 2.0
 * 
 * Incluye:
 * - Agentes predeterminados (templates)
 * - Subir archivo .py
 * - Mis agentes personalizados
 * - Historial de ejecuciones
 * 
 * REEMPLAZA tu archivo /src/pages/analysis/Analysis.tsx con este
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
  Clock,
  Play,
  Eye,
  Search,
  RefreshCw,
  Layers,
  Code,
  Upload,
  Sparkles,
  AlertTriangle,
  X,
  FileCode,
  Zap,
  History,
  PlusCircle,
  Download,
  Star,
  TrendingUp,
  BarChart3,
  MapPin,
  Ruler,
  GitCompare,
  Shield,
  FileText,
  Calculator,
  Filter,
  Database,
  Globe,
  Cpu,
  Package,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Agent {
  id: number;
  name: string;
  description?: string;
  agent_type: string;
  category?: { id: number; name: string };
  status: string;
  is_public: boolean;
  rating?: number;
  execution_count?: number;
  created_at: string;
  code?: string;
}

interface AgentTemplate {
  id: number;
  name: string;
  description?: string;
  agent_type: string;
  category?: { id: number; name: string };
  code_template: string;
  parameters_schema?: Record<string, any>;
  usage_count: number;
  is_featured: boolean;
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

// ============================================================================
// Agentes Predeterminados del Sistema (Frontend fallback)
// ============================================================================

const BUILTIN_AGENTS = [
  {
    id: 'stats',
    name: 'Análisis Estadístico',
    description: 'Calcula estadísticas completas: área total, perímetro, centroide, distribución de valores.',
    icon: BarChart3,
    color: 'bg-blue-500',
    agent_type: 'statistics',
    code: `import logging
import json
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa de entrada")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

# Estadísticas básicas
total_features = features.count()
total_area = 0
total_perimeter = 0

for feature in features:
    if feature.geometry:
        if hasattr(feature.geometry, 'area'):
            total_area += feature.geometry.area
        if hasattr(feature.geometry, 'length'):
            total_perimeter += feature.geometry.length

# Análisis de atributos
attribute_stats = {}
if total_features > 0:
    sample = features.first()
    if sample and sample.properties:
        for key, value in sample.properties.items():
            if isinstance(value, (int, float)):
                values = [f.properties.get(key, 0) for f in features if f.properties]
                numeric_values = [v for v in values if isinstance(v, (int, float))]
                if numeric_values:
                    attribute_stats[key] = {
                        'min': min(numeric_values),
                        'max': max(numeric_values),
                        'avg': sum(numeric_values) / len(numeric_values),
                        'sum': sum(numeric_values)
                    }

output_data['layer_name'] = layer.name
output_data['geometry_type'] = layer.geometry_type
output_data['total_features'] = total_features
output_data['total_area_m2'] = round(total_area, 2)
output_data['total_area_ha'] = round(total_area / 10000, 2)
output_data['total_area_km2'] = round(total_area / 1000000, 4)
output_data['total_perimeter_m'] = round(total_perimeter, 2)
output_data['attribute_statistics'] = attribute_stats

logger.info(f"Análisis completado: {total_features} features, {total_area:.2f} m²")
`,
  },
  {
    id: 'validator',
    name: 'Validador de Datos',
    description: 'Detecta geometrías inválidas, atributos faltantes, duplicados y problemas de calidad.',
    icon: Shield,
    color: 'bg-green-500',
    agent_type: 'validation',
    code: `import logging
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa de entrada")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

issues = []
valid_count = 0
invalid_geometries = 0
null_geometries = 0
empty_properties = 0

for feature in features:
    feature_issues = []
    
    # Validar geometría
    if feature.geometry is None:
        null_geometries += 1
        feature_issues.append("Geometría nula")
    elif not feature.geometry.valid:
        invalid_geometries += 1
        feature_issues.append(f"Geometría inválida: {feature.geometry.valid_reason}")
    
    # Validar propiedades
    if not feature.properties or len(feature.properties) == 0:
        empty_properties += 1
        feature_issues.append("Sin propiedades/atributos")
    
    if feature_issues:
        issues.append({
            'feature_id': feature.id,
            'issues': feature_issues
        })
    else:
        valid_count += 1

output_data['layer_name'] = layer.name
output_data['total_features'] = features.count()
output_data['valid_features'] = valid_count
output_data['invalid_geometries'] = invalid_geometries
output_data['null_geometries'] = null_geometries
output_data['empty_properties'] = empty_properties
output_data['issues'] = issues[:50]  # Primeros 50 problemas
output_data['quality_score'] = round((valid_count / features.count()) * 100, 2) if features.count() > 0 else 0

logger.info(f"Validación completada: {valid_count}/{features.count()} válidos ({output_data['quality_score']}%)")
`,
  },
  {
    id: 'coverage',
    name: 'Análisis de Cobertura',
    description: 'Calcula distribución de tipos, porcentajes de cobertura y genera resumen por categoría.',
    icon: Globe,
    color: 'bg-purple-500',
    agent_type: 'analysis',
    code: `import logging
from collections import defaultdict
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa de entrada")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

# Parámetro: campo de clasificación
class_field = parameters.get('class_field', 'tipo')

# Calcular cobertura por tipo
coverage_by_type = defaultdict(lambda: {'count': 0, 'area': 0})
total_area = 0

for feature in features:
    area = feature.geometry.area if feature.geometry else 0
    total_area += area
    
    # Obtener tipo/clase del feature
    tipo = 'Sin clasificar'
    if feature.properties:
        tipo = feature.properties.get(class_field, 
               feature.properties.get('clase',
               feature.properties.get('category',
               feature.properties.get('type', 'Sin clasificar'))))
    
    coverage_by_type[str(tipo)]['count'] += 1
    coverage_by_type[str(tipo)]['area'] += area

# Calcular porcentajes
coverage_summary = []
for tipo, data in sorted(coverage_by_type.items(), key=lambda x: x[1]['area'], reverse=True):
    percentage = (data['area'] / total_area * 100) if total_area > 0 else 0
    coverage_summary.append({
        'type': tipo,
        'count': data['count'],
        'area_m2': round(data['area'], 2),
        'area_ha': round(data['area'] / 10000, 2),
        'percentage': round(percentage, 2)
    })

output_data['layer_name'] = layer.name
output_data['total_features'] = features.count()
output_data['total_area_ha'] = round(total_area / 10000, 2)
output_data['unique_types'] = len(coverage_by_type)
output_data['coverage_by_type'] = coverage_summary
output_data['dominant_type'] = coverage_summary[0]['type'] if coverage_summary else None

logger.info(f"Análisis de cobertura completado: {len(coverage_by_type)} tipos encontrados")
`,
  },
  {
    id: 'buffer',
    name: 'Análisis de Buffer',
    description: 'Crea zonas de influencia alrededor de features y calcula áreas afectadas.',
    icon: Ruler,
    color: 'bg-orange-500',
    agent_type: 'transformation',
    code: `import logging
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa de entrada")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

# Parámetro: distancia del buffer en metros
buffer_distance = parameters.get('buffer_distance', 100)

buffer_results = []
total_buffer_area = 0

for feature in features:
    if feature.geometry:
        try:
            # Crear buffer
            buffer_geom = feature.geometry.buffer(buffer_distance)
            buffer_area = buffer_geom.area
            total_buffer_area += buffer_area
            
            buffer_results.append({
                'feature_id': feature.id,
                'original_area_m2': round(feature.geometry.area, 2),
                'buffer_area_m2': round(buffer_area, 2),
                'area_increase': round(buffer_area - feature.geometry.area, 2)
            })
        except Exception as e:
            logger.warning(f"Error creando buffer para feature {feature.id}: {e}")

output_data['layer_name'] = layer.name
output_data['buffer_distance_m'] = buffer_distance
output_data['total_features'] = features.count()
output_data['processed_features'] = len(buffer_results)
output_data['total_buffer_area_m2'] = round(total_buffer_area, 2)
output_data['total_buffer_area_ha'] = round(total_buffer_area / 10000, 2)
output_data['buffer_details'] = buffer_results[:20]  # Primeros 20

logger.info(f"Buffer de {buffer_distance}m aplicado a {len(buffer_results)} features")
`,
  },
  {
    id: 'comparison',
    name: 'Comparador de Capas',
    description: 'Compara dos capas temporales para detectar cambios en área, cantidad y distribución.',
    icon: GitCompare,
    color: 'bg-red-500',
    agent_type: 'change_detection',
    code: `import logging
logger = logging.getLogger(__name__)

if len(input_layers) < 2:
    raise ValueError("Se requieren exactamente 2 capas para comparar")

layer1 = input_layers[0]
layer2 = input_layers[1]

features1 = layer1.features.filter(is_active=True)
features2 = layer2.features.filter(is_active=True)

# Calcular métricas de cada capa
def get_layer_metrics(features):
    total_area = 0
    for f in features:
        if f.geometry:
            total_area += f.geometry.area
    return {
        'count': features.count(),
        'total_area': total_area
    }

metrics1 = get_layer_metrics(features1)
metrics2 = get_layer_metrics(features2)

# Calcular diferencias
count_diff = metrics2['count'] - metrics1['count']
area_diff = metrics2['total_area'] - metrics1['total_area']

count_change_pct = ((metrics2['count'] - metrics1['count']) / metrics1['count'] * 100) if metrics1['count'] > 0 else 0
area_change_pct = ((metrics2['total_area'] - metrics1['total_area']) / metrics1['total_area'] * 100) if metrics1['total_area'] > 0 else 0

output_data['layer1'] = {
    'name': layer1.name,
    'feature_count': metrics1['count'],
    'total_area_ha': round(metrics1['total_area'] / 10000, 2)
}
output_data['layer2'] = {
    'name': layer2.name,
    'feature_count': metrics2['count'],
    'total_area_ha': round(metrics2['total_area'] / 10000, 2)
}
output_data['changes'] = {
    'feature_count_diff': count_diff,
    'feature_count_change_pct': round(count_change_pct, 2),
    'area_diff_ha': round(area_diff / 10000, 2),
    'area_change_pct': round(area_change_pct, 2)
}
output_data['summary'] = f"{'Aumento' if area_diff > 0 else 'Disminución'} de {abs(round(area_change_pct, 1))}% en área"

logger.info(f"Comparación completada: {count_diff:+d} features, {area_change_pct:+.1f}% área")
`,
  },
  {
    id: 'report',
    name: 'Generador de Reporte',
    description: 'Genera un reporte completo en formato estructurado con todas las métricas de la capa.',
    icon: FileText,
    color: 'bg-teal-500',
    agent_type: 'export',
    code: `import logging
from datetime import datetime
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa de entrada")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

# Recopilar información completa
report = {
    'metadata': {
        'report_date': datetime.now().isoformat(),
        'layer_name': layer.name,
        'layer_id': layer.id,
        'geometry_type': layer.geometry_type,
        'srid': layer.srid,
        'created_at': layer.created_at.isoformat() if layer.created_at else None,
    },
    'statistics': {
        'total_features': features.count(),
        'total_area_m2': 0,
        'total_area_ha': 0,
        'total_perimeter_m': 0,
        'avg_area_m2': 0,
    },
    'attributes': {
        'fields': [],
        'sample_values': {}
    },
    'quality': {
        'valid_geometries': 0,
        'invalid_geometries': 0,
        'features_with_attributes': 0,
    }
}

# Calcular estadísticas
total_area = 0
total_perimeter = 0
valid_geoms = 0
with_attrs = 0

for feature in features:
    if feature.geometry:
        if feature.geometry.valid:
            valid_geoms += 1
        total_area += feature.geometry.area if hasattr(feature.geometry, 'area') else 0
        total_perimeter += feature.geometry.length if hasattr(feature.geometry, 'length') else 0
    
    if feature.properties and len(feature.properties) > 0:
        with_attrs += 1
        # Recopilar campos
        for key in feature.properties.keys():
            if key not in report['attributes']['fields']:
                report['attributes']['fields'].append(key)
                report['attributes']['sample_values'][key] = feature.properties[key]

report['statistics']['total_area_m2'] = round(total_area, 2)
report['statistics']['total_area_ha'] = round(total_area / 10000, 2)
report['statistics']['total_perimeter_m'] = round(total_perimeter, 2)
report['statistics']['avg_area_m2'] = round(total_area / features.count(), 2) if features.count() > 0 else 0

report['quality']['valid_geometries'] = valid_geoms
report['quality']['invalid_geometries'] = features.count() - valid_geoms
report['quality']['features_with_attributes'] = with_attrs
report['quality']['quality_score'] = round((valid_geoms / features.count()) * 100, 1) if features.count() > 0 else 0

output_data.update(report)

logger.info(f"Reporte generado para '{layer.name}': {features.count()} features")
`,
  },
  {
    id: 'centroid',
    name: 'Calculador de Centroides',
    description: 'Calcula el centroide de cada feature y el centroide general de la capa.',
    icon: MapPin,
    color: 'bg-pink-500',
    agent_type: 'transformation',
    code: `import logging
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa de entrada")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

centroids = []
all_x = []
all_y = []

for feature in features:
    if feature.geometry:
        try:
            centroid = feature.geometry.centroid
            centroids.append({
                'feature_id': feature.id,
                'x': round(centroid.x, 6),
                'y': round(centroid.y, 6),
                'coordinates': [round(centroid.x, 6), round(centroid.y, 6)]
            })
            all_x.append(centroid.x)
            all_y.append(centroid.y)
        except Exception as e:
            logger.warning(f"Error calculando centroide para feature {feature.id}: {e}")

# Centroide general (promedio de centroides)
general_centroid = None
if all_x and all_y:
    general_centroid = {
        'x': round(sum(all_x) / len(all_x), 6),
        'y': round(sum(all_y) / len(all_y), 6)
    }

output_data['layer_name'] = layer.name
output_data['total_features'] = features.count()
output_data['centroids_calculated'] = len(centroids)
output_data['general_centroid'] = general_centroid
output_data['feature_centroids'] = centroids[:50]  # Primeros 50

logger.info(f"Centroides calculados: {len(centroids)} features")
`,
  },
  {
    id: 'filter',
    name: 'Filtro por Atributos',
    description: 'Filtra features basado en condiciones sobre sus atributos.',
    icon: Filter,
    color: 'bg-indigo-500',
    agent_type: 'classification',
    code: `import logging
logger = logging.getLogger(__name__)

if not input_layers:
    raise ValueError("Se requiere al menos una capa de entrada")

layer = input_layers[0]
features = layer.features.filter(is_active=True)

# Parámetros de filtro
field_name = parameters.get('field_name', '')
operator = parameters.get('operator', 'equals')  # equals, contains, greater, less
filter_value = parameters.get('value', '')

if not field_name:
    raise ValueError("Debe especificar 'field_name' en los parámetros")

matching_features = []
non_matching = 0

for feature in features:
    if not feature.properties:
        non_matching += 1
        continue
    
    field_value = feature.properties.get(field_name)
    if field_value is None:
        non_matching += 1
        continue
    
    matches = False
    
    if operator == 'equals':
        matches = str(field_value) == str(filter_value)
    elif operator == 'contains':
        matches = str(filter_value).lower() in str(field_value).lower()
    elif operator == 'greater':
        try:
            matches = float(field_value) > float(filter_value)
        except (ValueError, TypeError):
            pass
    elif operator == 'less':
        try:
            matches = float(field_value) < float(filter_value)
        except (ValueError, TypeError):
            pass
    elif operator == 'not_equals':
        matches = str(field_value) != str(filter_value)
    
    if matches:
        matching_features.append({
            'feature_id': feature.id,
            'value': field_value
        })
    else:
        non_matching += 1

output_data['layer_name'] = layer.name
output_data['total_features'] = features.count()
output_data['filter_criteria'] = {
    'field': field_name,
    'operator': operator,
    'value': filter_value
}
output_data['matching_count'] = len(matching_features)
output_data['non_matching_count'] = non_matching
output_data['match_percentage'] = round((len(matching_features) / features.count()) * 100, 2) if features.count() > 0 else 0
output_data['matching_features'] = matching_features[:100]

logger.info(f"Filtro aplicado: {len(matching_features)}/{features.count()} features coinciden")
`,
  },
];

// ============================================================================
// Execute Agent Modal (mejorado)
// ============================================================================

interface ExecuteModalProps {
  agent: Agent | typeof BUILTIN_AGENTS[0];
  onClose: () => void;
  onSuccess: () => void;
  isBuiltin?: boolean;
}

const ExecuteAgentModal: React.FC<ExecuteModalProps> = ({ agent, onClose, onSuccess, isBuiltin }) => {
  const toast = useToast();
  const [selectedLayers, setSelectedLayers] = useState<number[]>([]);
  const [parameters, setParameters] = useState<Record<string, string>>({});

  const { data: layersData } = useQuery({
    queryKey: ['layers'],
    queryFn: () => layerService.getLayers({ page_size: 100 }),
  });

  // Para agentes predeterminados, primero creamos el agente y luego lo ejecutamos
  const createAndExecuteMutation = useMutation({
    mutationFn: async () => {
      if (isBuiltin) {
        // Crear agente desde código predeterminado
        const builtinAgent = agent as typeof BUILTIN_AGENTS[0];
        const newAgent = await agentService.createAgent({
          name: builtinAgent.name,
          description: builtinAgent.description,
          agent_type: builtinAgent.agent_type,
          code: builtinAgent.code,
          is_public: false,
        });
        
        // Publicar el agente
        await agentService.publishAgent(newAgent.id);
        
        // Ejecutar
        return agentService.executeAgent(newAgent.id, {
          parameters: {
            ...parameters,
            input_layers: selectedLayers,
          },
        });
      } else {
        // Ejecutar agente existente
        return agentService.executeAgent((agent as Agent).id, {
          parameters: {
            ...parameters,
            input_layers: selectedLayers,
          },
        });
      }
    },
    onSuccess: () => {
      toast.success('Ejecución iniciada', `El agente "${agent.name}" está procesando...`);
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.error || error.message || 'Error al ejecutar');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLayers.length === 0) {
      toast.warning('Atención', 'Selecciona al menos una capa');
      return;
    }
    createAndExecuteMutation.mutate();
  };

  const toggleLayer = (layerId: number) => {
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // Parámetros específicos por tipo de agente
  const getParameterFields = () => {
    const agentType = agent.agent_type;
    
    if (agentType === 'transformation' && agent.name.includes('Buffer')) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distancia del Buffer (metros)
          </label>
          <input
            type="number"
            value={parameters.buffer_distance || '100'}
            onChange={(e) => setParameters({ ...parameters, buffer_distance: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="100"
          />
        </div>
      );
    }
    
    if (agentType === 'classification' || agent.name.includes('Filtro')) {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campo a filtrar
            </label>
            <input
              type="text"
              value={parameters.field_name || ''}
              onChange={(e) => setParameters({ ...parameters, field_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="tipo, clase, category..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operador
            </label>
            <select
              value={parameters.operator || 'equals'}
              onChange={(e) => setParameters({ ...parameters, operator: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="equals">Igual a</option>
              <option value="not_equals">Diferente de</option>
              <option value="contains">Contiene</option>
              <option value="greater">Mayor que</option>
              <option value="less">Menor que</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <input
              type="text"
              value={parameters.value || ''}
              onChange={(e) => setParameters({ ...parameters, value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Valor a buscar..."
            />
          </div>
        </>
      );
    }
    
    if (agentType === 'analysis' && agent.name.includes('Cobertura')) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campo de clasificación
          </label>
          <input
            type="text"
            value={parameters.class_field || 'tipo'}
            onChange={(e) => setParameters({ ...parameters, class_field: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="tipo, clase, category..."
          />
        </div>
      );
    }
    
    return null;
  };

  const Icon = isBuiltin ? (agent as typeof BUILTIN_AGENTS[0]).icon : BrainCircuit;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className={`${isBuiltin ? (agent as typeof BUILTIN_AGENTS[0]).color : 'bg-purple-600'} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Ejecutar Agente</h2>
                  <p className="text-white/80 text-sm">{agent.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Agent Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">{agent.description}</p>
            </div>

            {/* Select Layers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capas de Entrada <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                {layersData?.results?.length ? (
                  layersData.results.map((layer: any) => (
                    <label
                      key={layer.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLayers.includes(layer.id)}
                        onChange={() => toggleLayer(layer.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <Layers className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{layer.name}</p>
                        <p className="text-xs text-gray-500">
                          {layer.feature_count || 0} features • {layer.geometry_type}
                        </p>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="p-4 text-sm text-gray-500 text-center">No hay capas disponibles</p>
                )}
              </div>
              {selectedLayers.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {selectedLayers.length} capa(s) seleccionada(s)
                </p>
              )}
            </div>

            {/* Dynamic Parameters */}
            {getParameterFields() && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Parámetros
                </label>
                {getParameterFields()}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createAndExecuteMutation.isPending || selectedLayers.length === 0}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 ${
                  isBuiltin ? (agent as typeof BUILTIN_AGENTS[0]).color : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {createAndExecuteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Ejecutar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Create Agent Modal (con subida de archivo)
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
  const [uploadMode, setUploadMode] = useState<'code' | 'file'>('code');
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
output_data['message'] = f'Procesadas {count} features'

logger.info(f"Análisis completado: {count} features")
`);

  const { data: categories } = useQuery({
    queryKey: ['agent-categories'],
    queryFn: () => agentService.getCategories(),
  });

  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');

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
        setUploadMode('file');
        if (!name) {
          setName(file.name.replace('.py', ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const agent = await agentService.createAgent({
        name,
        description,
        agent_type: agentType,
        code,
        category: selectedCategory as number,
        is_public: false,
      });
      
      // Publicar automáticamente
      await agentService.publishAgent(agent.id);
      
      return agent;
    },
    onSuccess: () => {
      toast.success('Agente creado', 'El agente se ha creado y publicado correctamente');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.error || error.response?.data?.code?.[0] || 'Error al crear el agente');
    },
  });

  const agentTypes = [
    { value: 'statistics', label: 'Estadísticas', desc: 'Cálculos y métricas' },
    { value: 'classification', label: 'Clasificación', desc: 'Categorización' },
    { value: 'detection', label: 'Detección', desc: 'Identificar patrones' },
    { value: 'transformation', label: 'Transformación', desc: 'Modificar datos' },
    { value: 'analysis', label: 'Análisis', desc: 'Análisis general' },
    { value: 'validation', label: 'Validación', desc: 'Verificar datos' },
    { value: 'export', label: 'Exportación', desc: 'Generar archivos' },
    { value: 'change_detection', label: 'Cambios', desc: 'Detectar cambios' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-green-600 to-teal-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileCode className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Crear Agente Personalizado</h2>
                  <p className="text-green-100 text-sm">Escribe código o sube un archivo .py</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            {/* Upload Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setUploadMode('code')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'code'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="h-4 w-4 inline mr-2" />
                Escribir Código
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Subir Archivo .py
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".py"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* File indicator */}
            {uploadMode === 'file' && fileName && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Archivo cargado: {fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMode('code');
                    setFileName('');
                  }}
                  className="ml-auto text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Agente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Mi Agente de Análisis"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Describe qué hace tu agente..."
              />
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Agente <span className="text-red-500">*</span>
                </label>
                <select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  {agentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.desc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Sin categoría</option>
                  {categories?.results?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Código Python <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500">
                  {code.split('\n').length} líneas
                </span>
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    {fileName || 'agent_code.py'}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none resize-y"
                  spellCheck={false}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Variables disponibles: <code className="bg-gray-100 px-1 rounded">input_layers</code>, 
                <code className="bg-gray-100 px-1 rounded ml-1">parameters</code>, 
                <code className="bg-gray-100 px-1 rounded ml-1">output_data</code>, 
                <code className="bg-gray-100 px-1 rounded ml-1">logger</code>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!name || !code || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Crear y Publicar
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
// Execution Detail Modal
// ============================================================================

interface ExecutionDetailModalProps {
  execution: Execution;
  onClose: () => void;
}

const ExecutionDetailModal: React.FC<ExecutionDetailModalProps> = ({ execution, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const statusConfig = {
    pending: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Pendiente' },
    running: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Ejecutando' },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Completado' },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Fallido' },
    cancelled: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, label: 'Cancelado' },
  };

  const config = statusConfig[execution.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const copyResult = () => {
    if (execution.result) {
      navigator.clipboard.writeText(JSON.stringify(execution.result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <StatusIcon className={`h-5 w-5 ${execution.status === 'running' ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {execution.name || `Ejecución #${execution.id}`}
                  </h2>
                  <p className="text-sm text-gray-500">{execution.agent_name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Estado</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color} mt-1`}>
                  <StatusIcon className={`h-3 w-3 ${execution.status === 'running' ? 'animate-spin' : ''}`} />
                  {config.label}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Duración</p>
                <p className="font-medium text-gray-900 mt-1">
                  {execution.duration ? `${execution.duration.toFixed(2)}s` : '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Iniciado</p>
                <p className="text-sm text-gray-900 mt-1">
                  {execution.started_at ? new Date(execution.started_at).toLocaleString('es-CO') : '-'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Completado</p>
                <p className="text-sm text-gray-900 mt-1">
                  {execution.completed_at ? new Date(execution.completed_at).toLocaleString('es-CO') : '-'}
                </p>
              </div>
            </div>

            {/* Result */}
            {execution.result && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Resultado</h3>
                  <button
                    onClick={copyResult}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-96">
                  {JSON.stringify(execution.result, null, 2)}
                </pre>
              </div>
            )}

            {/* Error */}
            {execution.error_message && (
              <div>
                <h3 className="text-sm font-medium text-red-700 mb-2">Error</h3>
                <pre className="bg-red-50 text-red-800 p-4 rounded-lg text-xs overflow-x-auto border border-red-200">
                  {execution.error_message}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Builtin Agent Card
// ============================================================================

interface BuiltinAgentCardProps {
  agent: typeof BUILTIN_AGENTS[0];
  onExecute: () => void;
}

const BuiltinAgentCard: React.FC<BuiltinAgentCardProps> = ({ agent, onExecute }) => {
  const Icon = agent.icon;
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-gray-300 group">
      <div className="flex items-start gap-4">
        <div className={`p-3 ${agent.color} rounded-xl text-white shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
              <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full mt-1">
                Predeterminado
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {agent.description}
          </p>
          <button
            onClick={onExecute}
            className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 ${agent.color} text-white text-sm rounded-lg hover:opacity-90 transition-all`}
          >
            <Play className="h-4 w-4" />
            Ejecutar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function Analysis() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom' | 'executions'>('builtin');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | typeof BUILTIN_AGENTS[0] | null>(null);
  const [isBuiltinAgent, setIsBuiltinAgent] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  // Queries
  const { data: agentsData, isLoading: loadingAgents } = useQuery({
    queryKey: ['agents', searchTerm],
    queryFn: () => agentService.getAgents({
      search: searchTerm || undefined,
    }),
  });

  const { data: executionsData, isLoading: loadingExecutions, refetch: refetchExecutions } = useQuery({
    queryKey: ['executions'],
    queryFn: () => agentService.getExecutions({ ordering: '-created_at' }),
    refetchInterval: 5000,
  });

  const agents = agentsData?.results || [];
  const executions = executionsData?.results || [];

  // Filter builtin agents by search
  const filteredBuiltinAgents = BUILTIN_AGENTS.filter(agent =>
    !searchTerm || 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Pendiente' },
      running: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Ejecutando' },
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Completado' },
      failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Fallido' },
      cancelled: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle, label: 'Cancelado' },
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl text-white">
                <BrainCircuit className="h-6 w-6" />
              </div>
              Análisis con IA
            </h1>
            <p className="text-gray-500 mt-1">
              Ejecuta análisis inteligentes sobre tus capas geoespaciales
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-lg shadow-green-500/25"
          >
            <PlusCircle className="h-4 w-4" />
            Crear Agente
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('builtin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'builtin'
                ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Predeterminados ({BUILTIN_AGENTS.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'custom'
                ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            <Code className="h-4 w-4" />
            Mis Agentes ({agents.length})
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'executions'
                ? 'bg-linear-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
          >
            <History className="h-4 w-4" />
            Historial ({executions.length})
          </button>
        </div>
      </div>

      {/* Search */}
      {(activeTab === 'builtin' || activeTab === 'custom') && (
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
      )}

      {/* Content */}
      {activeTab === 'builtin' && (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Agentes listos para usar - optimizados para análisis geoespacial
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuiltinAgents.map((agent) => (
              <BuiltinAgentCard
                key={agent.id}
                agent={agent}
                onExecute={() => {
                  setSelectedAgent(agent);
                  setIsBuiltinAgent(true);
                }}
              />
            ))}
          </div>
        </>
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
              <h3 className="font-semibold text-gray-900 mb-2">No tienes agentes personalizados</h3>
              <p className="text-gray-500 mb-4">Crea tu primer agente o sube un archivo .py</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Crear Agente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent: Agent) => (
                <div key={agent.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BrainCircuit className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <p className="text-xs text-gray-500">{agent.agent_type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      agent.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description || 'Sin descripción'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedAgent(agent);
                      setIsBuiltinAgent(false);
                    }}
                    disabled={agent.status !== 'published'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {activeTab === 'executions' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {executions.length} ejecuciones
            </p>
            <button
              onClick={() => refetchExecutions()}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>

          {loadingExecutions ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sin ejecuciones</h3>
              <p className="text-gray-500">Ejecuta un agente para ver el historial aquí</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Agente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Duración</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {executions.map((exec: Execution) => {
                    const config = getStatusConfig(exec.status);
                    const StatusIcon = config.icon;
                    return (
                      <tr key={exec.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{exec.agent_name || `Agente #${exec.agent}`}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            <StatusIcon className={`h-3 w-3 ${exec.status === 'running' ? 'animate-spin' : ''}`} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {exec.duration ? `${exec.duration.toFixed(2)}s` : '-'}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedAgent && (
        <ExecuteAgentModal
          agent={selectedAgent}
          isBuiltin={isBuiltinAgent}
          onClose={() => {
            setSelectedAgent(null);
            setIsBuiltinAgent(false);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['executions'] });
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            setActiveTab('executions');
          }}
        />
      )}

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            setActiveTab('custom');
          }}
        />
      )}

      {selectedExecution && (
        <ExecutionDetailModal
          execution={selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}
    </div>
  );
}