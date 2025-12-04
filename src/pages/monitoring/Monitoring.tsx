/**
 * Monitoring Page - Monitoreo Geoespacial
 * SMGI Frontend - Versión 3.0 FUNCIONAL
 * 
 * Módulo para gestión de monitoreo:
 * - Proyectos de monitoreo
 * - Monitores activos
 * - Detecciones de cambios
 * - Reportes y estadísticas
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monitoringService, layerService } from '../../services';
import { useToast } from '../../components/ui/Toast';
import {
  Activity,
  Eye,
  EyeOff,
  Play,
  Pause,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  BarChart3,
  Target,
  X,
  ChevronRight,
  Radar,
  Satellite,
  AlertCircle,
  Check,
  FolderOpen,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  area_of_interest?: any;
  start_date: string;
  end_date?: string;
  monitors_count?: number;
  detections_count?: number;
  created_by?: number;
  created_at: string;
  updated_at?: string;
}

interface Monitor {
  id: number;
  project?: number;
  project_name?: string;
  name: string;
  description?: string;
  monitor_type: string;
  layer?: number;
  layer_name?: string;
  status?: string;
  check_interval: number;
  last_check?: string;
  next_check?: string;
  check_count?: number;
  detection_count?: number;
  total_checks?: number;
  detections_count?: number;
  is_active: boolean;
  configuration?: Record<string, any>;
  parameters?: Record<string, any>;
  agent?: { id: number; name: string };
  layers?: number[];
  created_by?: number;
  created_at?: string;
}

interface Detection {
  id: number;
  monitor: number;
  monitor_name?: string;
  title: string;
  description?: string;
  detection_type?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'confirmed' | 'false_positive' | 'resolved' | 'investigating' | 'new' | 'ignored';
  location?: any;
  area_affected?: number;
  confidence?: number;
  metadata?: Record<string, any>;
  analysis_data?: Record<string, any>;
  detected_at: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
}

// ============================================================================
// Stats Card
// ============================================================================

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, color, onClick }) => (
  <div 
    className={`bg-white rounded-xl border p-5 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-linear-to-br ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// ============================================================================
// Project Card
// ============================================================================

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onToggleStatus: (id: number, status: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onView, onToggleStatus }) => {
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-linear-to-br ${
            project.status === 'active' ? 'from-green-500 to-emerald-500' :
            project.status === 'paused' ? 'from-yellow-500 to-orange-500' :
            'from-blue-500 to-cyan-500'
          }`}>
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4 py-3 bg-gray-50 rounded-lg px-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{project.monitors_count || 0}</p>
          <p className="text-xs text-gray-500">Monitores</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <p className="text-lg font-bold text-gray-900">{project.detections_count || 0}</p>
          <p className="text-xs text-gray-500">Detecciones</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-gray-700">
            {new Date(project.start_date).toLocaleDateString('es-CO')}
          </p>
          <p className="text-xs text-gray-500">Inicio</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(project)}
          className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Ver
        </button>
        <button
          onClick={() => onToggleStatus(project.id, project.status === 'active' ? 'paused' : 'active')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
            project.status === 'active'
              ? 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50'
              : 'bg-linear-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
          }`}
        >
          {project.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {project.status === 'active' ? 'Pausar' : 'Activar'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Monitor Row
// ============================================================================

interface MonitorRowProps {
  monitor: Monitor;
  onExecute: (id: number) => void;
  onToggle: (id: number, pause: boolean) => void;
  isExecuting?: boolean;
}

const MonitorRow: React.FC<MonitorRowProps> = ({ monitor, onExecute, onToggle, isExecuting }) => {
  const typeIcons: Record<string, React.ElementType> = {
    change_detection: Radar,
    threshold: Target,
    pattern: Activity,
    anomaly: AlertTriangle,
  };

  const TypeIcon = typeIcons[monitor.monitor_type] || Activity;

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            monitor.status === 'active' ? 'bg-green-100' : 
            monitor.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            <TypeIcon className={`h-4 w-4 ${
              monitor.status === 'active' ? 'text-green-600' :
              monitor.status === 'error' ? 'text-red-600' : 'text-gray-600'
            }`} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{monitor.name}</p>
            <p className="text-xs text-gray-500">{monitor.project_name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[monitor.status || 'active']}`}>
          {monitor.status || 'active'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {monitor.layer_name || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {monitor.check_count || 0} / {monitor.detection_count || 0}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {monitor.last_check ? new Date(monitor.last_check).toLocaleString('es-CO') : 'Nunca'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onExecute(monitor.id)}
            disabled={monitor.status !== 'active' || isExecuting}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
            title="Ejecutar ahora"
          >
            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onToggle(monitor.id, monitor.status === 'active')}
            className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
            title={monitor.status === 'active' ? 'Pausar' : 'Activar'}
          >
            {monitor.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// Detection Card
// ============================================================================

interface DetectionCardProps {
  detection: Detection;
  onReview: (detection: Detection) => void;
}

const DetectionCard: React.FC<DetectionCardProps> = ({ detection, onReview }) => {
  const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  };

  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    new: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
    confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    false_positive: { color: 'bg-gray-100 text-gray-700', icon: XCircle },
    resolved: { color: 'bg-purple-100 text-purple-700', icon: Check },
    ignored: { color: 'bg-gray-100 text-gray-500', icon: EyeOff },
  };

  const severity = severityColors[detection.severity];
  const status = statusConfig[detection.status];
  const StatusIcon = status.icon;

  return (
    <div className={`rounded-xl border ${severity.border} ${severity.bg} p-4 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${severity.text} bg-white`}>
            {detection.severity}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
            {detection.status}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(detection.detected_at).toLocaleString('es-CO')}
        </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-1">{detection.title}</h4>
      {detection.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{detection.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Radar className="h-3 w-3" />
            {detection.monitor_name}
          </span>
          {detection.confidence && (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {Math.round(detection.confidence * 100)}%
            </span>
          )}
        </div>
        
        {detection.status === 'new' && (
          <button
            onClick={() => onReview(detection)}
            className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Revisar
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Create Project Modal
// ============================================================================

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  const createMutation = useMutation({
    mutationFn: () => monitoringService.createProject(formData),
    onSuccess: () => {
      toast.success('Proyecto creado', 'El proyecto de monitoreo se ha creado correctamente');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al crear proyecto');
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div className="bg-linear-to-r from-emerald-500 to-teal-500 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nuevo Proyecto</h2>
                  <p className="text-emerald-100 text-sm">Crea un proyecto de monitoreo</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Monitoreo Zona Norte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe el propósito del monitoreo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
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
                disabled={!formData.name || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Crear Proyecto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Create Monitor Modal
// ============================================================================

interface CreateMonitorModalProps {
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMonitorModal: React.FC<CreateMonitorModalProps> = ({ projects, onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    project: '',
    name: '',
    description: '',
    monitor_type: 'change_detection' as 'change_detection' | 'threshold' | 'pattern' | 'anomaly',
    layer: '',
    check_interval: 60,
  });

  const { data: layersData } = useQuery({
    queryKey: ['layers-for-monitor'],
    queryFn: () => layerService.getLayers({ page_size: 100 }),
  });

  const layers = layersData?.results || [];

  const createMutation = useMutation({
    mutationFn: () => {
      const payload: any = {
        ...formData,
        project: Number(formData.project),
      };
      if (formData.layer) {
        payload.layer = Number(formData.layer);
      }
      return monitoringService.createMonitor(payload);
    },
    onSuccess: () => {
      toast.success('Monitor creado', 'El monitor se ha creado correctamente');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al crear monitor');
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Radar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nuevo Monitor</h2>
                  <p className="text-blue-100 text-sm">Configura un monitor de cambios</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Monitor de deforestación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Monitor
              </label>
              <select
                value={formData.monitor_type}
                onChange={(e) => setFormData({ ...formData, monitor_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="change_detection">Detección de Cambios</option>
                <option value="threshold">Umbral</option>
                <option value="pattern">Patrón</option>
                <option value="anomaly">Anomalía</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capa a Monitorear
              </label>
              <select
                value={formData.layer}
                onChange={(e) => setFormData({ ...formData, layer: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una capa</option>
                {layers.map((layer: any) => (
                  <option key={layer.id} value={layer.id}>{layer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo de Verificación (minutos)
              </label>
              <input
                type="number"
                value={formData.check_interval}
                onChange={(e) => setFormData({ ...formData, check_interval: Number(e.target.value) })}
                min={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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
                disabled={!formData.name || !formData.project || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Crear Monitor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Review Detection Modal
// ============================================================================

interface ReviewDetectionModalProps {
  detection: Detection;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewDetectionModal: React.FC<ReviewDetectionModalProps> = ({ detection, onClose, onSuccess }) => {
  const toast = useToast();
  const [status, setStatus] = useState<'confirmed' | 'false_positive' | 'resolved'>('confirmed');
  const [notes, setNotes] = useState('');

  const reviewMutation = useMutation({
    mutationFn: () => monitoringService.reviewDetection(detection.id, {
      status,
      review_notes: notes,
    }),
    onSuccess: () => {
      toast.success('Detección revisada', 'El estado se ha actualizado');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al revisar');
    },
  });

  const severityColors: Record<string, string> = {
    low: 'from-blue-500 to-cyan-500',
    medium: 'from-yellow-500 to-orange-500',
    high: 'from-orange-500 to-red-500',
    critical: 'from-red-500 to-rose-500',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div className={`bg-linear-to-r ${severityColors[detection.severity]} p-6 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Revisar Detección</h2>
                  <p className="text-white/80 text-sm">Severidad: {detection.severity.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">{detection.title}</h4>
              {detection.description && (
                <p className="text-sm text-gray-600 mt-1">{detection.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Monitor</p>
                <p className="font-medium">{detection.monitor_name}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Detectado</p>
                <p className="font-medium">{new Date(detection.detected_at).toLocaleString('es-CO')}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultado de la Revisión
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'confirmed', label: 'Confirmar', icon: CheckCircle2, color: 'green' },
                  { value: 'false_positive', label: 'Falso Positivo', icon: XCircle, color: 'gray' },
                  { value: 'resolved', label: 'Resuelto', icon: Check, color: 'purple' },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setStatus(option.value as any)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        status === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-1 ${
                        status === option.value ? `text-${option.color}-600` : 'text-gray-400'
                      }`} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas de Revisión
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Agrega observaciones sobre esta detección..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={reviewMutation.isPending}
                className="flex-1 px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reviewMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Guardar Revisión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function Monitoring() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'monitors' | 'detections'>('overview');
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateMonitorModal, setShowCreateMonitorModal] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [executingMonitor, setExecutingMonitor] = useState<number | null>(null);

  // Queries
  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ['monitoring-projects'],
    queryFn: () => monitoringService.getProjects(),
  });

  const { data: monitorsData, isLoading: loadingMonitors } = useQuery({
    queryKey: ['monitors'],
    queryFn: () => monitoringService.getMonitors(),
  });

  const { data: detectionsData, isLoading: loadingDetections, refetch: refetchDetections } = useQuery({
    queryKey: ['detections', severityFilter, statusFilter],
    queryFn: () => monitoringService.getDetections({
      severity: severityFilter as any || undefined,
      status: statusFilter as any || undefined,
      ordering: '-detected_at',
    }),
    refetchInterval: 30000,
  });

  const projects = projectsData?.results || [];
  const monitors = monitorsData?.results || [];
  const detections = detectionsData?.results || [];

  // Mutations
  const executeMonitorMutation = useMutation({
    mutationFn: (id: number) => monitoringService.executeMonitor(id),
    onSuccess: (data) => {
      toast.success('Monitor ejecutado', `Se detectaron ${data.detection_count || 0} cambios`);
      queryClient.invalidateQueries({ queryKey: ['detections'] });
      setExecutingMonitor(null);
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.error || 'Error al ejecutar');
      setExecutingMonitor(null);
    },
  });

  const pauseMonitorMutation = useMutation({
    mutationFn: (id: number) => monitoringService.pauseMonitor(id),
    onSuccess: () => {
      toast.success('Monitor pausado');
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });

  const resumeMonitorMutation = useMutation({
    mutationFn: (id: number) => monitoringService.resumeMonitor(id),
    onSuccess: () => {
      toast.success('Monitor activado');
      queryClient.invalidateQueries({ queryKey: ['monitors'] });
    },
  });

  // Stats
  const stats = {
    totalProjects: projects.length,
    activeMonitors: monitors.filter((m: Monitor) => m.status === 'active').length,
    totalDetections: detections.length,
    pendingDetections: detections.filter((d: Detection) => d.status === 'new').length,
    criticalDetections: detections.filter((d: Detection) => d.severity === 'critical').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl text-white">
                <Satellite className="h-6 w-6" />
              </div>
              Centro de Monitoreo
            </h1>
            <p className="text-gray-500 mt-1">
              Supervisa cambios en tiempo real en tus áreas de interés
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateMonitorModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50"
            >
              <Radar className="h-4 w-4" />
              Nuevo Monitor
            </button>
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Proyectos"
          value={stats.totalProjects}
          icon={FolderOpen}
          color="from-purple-500 to-indigo-500"
          onClick={() => setActiveTab('projects')}
        />
        <StatsCard
          title="Monitores Activos"
          value={stats.activeMonitors}
          icon={Radar}
          color="from-green-500 to-emerald-500"
          onClick={() => setActiveTab('monitors')}
        />
        <StatsCard
          title="Detecciones"
          value={stats.totalDetections}
          icon={AlertCircle}
          color="from-blue-500 to-cyan-500"
          onClick={() => setActiveTab('detections')}
        />
        <StatsCard
          title="Por Revisar"
          value={stats.pendingDetections}
          subtitle="Detecciones nuevas"
          icon={Eye}
          color="from-yellow-500 to-orange-500"
          onClick={() => { setActiveTab('detections'); setStatusFilter('new'); }}
        />
        <StatsCard
          title="Críticas"
          value={stats.criticalDetections}
          subtitle="Requieren atención"
          icon={AlertTriangle}
          color="from-red-500 to-rose-500"
          onClick={() => { setActiveTab('detections'); setSeverityFilter('critical'); }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'projects', label: 'Proyectos', icon: FolderOpen, count: projects.length },
          { id: 'monitors', label: 'Monitores', icon: Radar, count: monitors.length },
          { id: 'detections', label: 'Detecciones', icon: AlertCircle, count: detections.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Detections */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Detecciones Recientes</h3>
              <button
                onClick={() => setActiveTab('detections')}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Ver todas <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {detections.slice(0, 5).map((detection: Detection) => (
                <DetectionCard
                  key={detection.id}
                  detection={detection}
                  onReview={setSelectedDetection}
                />
              ))}
              {detections.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay detecciones recientes</p>
              )}
            </div>
          </div>

          {/* Active Monitors */}
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Monitores Activos</h3>
              <button
                onClick={() => setActiveTab('monitors')}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Ver todos <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {monitors.filter((m: Monitor) => m.status === 'active').slice(0, 5).map((monitor: Monitor) => (
                <div key={monitor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Radar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{monitor.name}</p>
                      <p className="text-xs text-gray-500">{monitor.layer_name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {monitor.detection_count || 0} detecciones
                  </span>
                </div>
              ))}
              {monitors.filter((m: Monitor) => m.status === 'active').length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay monitores activos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <>
          {loadingProjects ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No hay proyectos</h3>
              <p className="text-gray-500 mb-4">Crea tu primer proyecto de monitoreo</p>
              <button
                onClick={() => setShowCreateProjectModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Crear Proyecto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: Project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={() => {}}
                  onToggleStatus={() => {}}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'monitors' && (
        <>
          {loadingMonitors ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : monitors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <Radar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No hay monitores</h3>
              <p className="text-gray-500 mb-4">Configura tu primer monitor de cambios</p>
              <button
                onClick={() => setShowCreateMonitorModal(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Crear Monitor
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Monitor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Capa</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Checks/Det.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Último Check</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {monitors.map((monitor: Monitor) => (
                    <MonitorRow
                      key={monitor.id}
                      monitor={monitor}
                      onExecute={(id) => {
                        setExecutingMonitor(id);
                        executeMonitorMutation.mutate(id);
                      }}
                      onToggle={(id, pause) => {
                        if (pause) pauseMonitorMutation.mutate(id);
                        else resumeMonitorMutation.mutate(id);
                      }}
                      isExecuting={executingMonitor === monitor.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'detections' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas las severidades</option>
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todos los estados</option>
                <option value="new">Nueva</option>
                <option value="confirmed">Confirmada</option>
                <option value="false_positive">Falso Positivo</option>
                <option value="resolved">Resuelta</option>
              </select>
              <button
                onClick={() => refetchDetections()}
                className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>

          {loadingDetections ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : detections.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sin detecciones</h3>
              <p className="text-gray-500">No hay detecciones que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detections.map((detection: Detection) => (
                <DetectionCard
                  key={detection.id}
                  detection={detection}
                  onReview={setSelectedDetection}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showCreateProjectModal && (
        <CreateProjectModal
          onClose={() => setShowCreateProjectModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['monitoring-projects'] })}
        />
      )}

      {showCreateMonitorModal && (
        <CreateMonitorModal
          projects={projects}
          onClose={() => setShowCreateMonitorModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['monitors'] })}
        />
      )}

      {selectedDetection && (
        <ReviewDetectionModal
          detection={selectedDetection}
          onClose={() => setSelectedDetection(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['detections'] })}
        />
      )}
    </div>
  );
}