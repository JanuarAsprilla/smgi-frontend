/**
 * Processes Page - Automatización y Workflows
 * SMGI Frontend - Versión 3.0 FUNCIONAL
 * 
 * Módulo para gestión de workflows automatizados:
 * - Crear y gestionar workflows
 * - Ejecutar procesos manualmente
 * - Ver historial de ejecuciones
 * - Programar ejecuciones automáticas
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationService } from '../../services';
import { useToast } from '../../components/ui/Toast';
import {
  Workflow,
  Play,
  Pause,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  MoreVertical,
  Zap,
  Calendar,
  History,
  TrendingUp,
  Activity,
  GitBranch,
  Copy,
  Trash2,
  X,
  AlertTriangle,
  Target,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface WorkflowType {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type: 'manual' | 'schedule' | 'event' | 'webhook';
  workflow_definition?: Record<string, any>;
  execution_count?: number;
  last_execution?: string;
  success_rate?: number;
  is_public?: boolean;
  created_by?: number | { username: string };
  created_at: string;
  updated_at?: string;
}

interface ExecutionType {
  id: number;
  workflow: number;
  workflow_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  duration?: number;
  created_by?: number | { username: string };
  created_at: string;
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; positive: boolean };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
            {trend.value}% vs mes anterior
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-linear-to-br ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// ============================================================================
// Workflow Card Component
// ============================================================================

interface WorkflowCardProps {
  workflow: WorkflowType;
  onExecute: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
  onView: (workflow: WorkflowType) => void;
  onClone: (id: number) => void;
  onDelete: (id: number) => void;
  isExecuting?: boolean;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onExecute,
  onToggleStatus,
  onView,
  onClone,
  onDelete,
  isExecuting,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-red-100 text-red-700',
  };

  const triggerIcons: Record<string, React.ElementType> = {
    manual: Play,
    schedule: Calendar,
    event: Zap,
    webhook: GitBranch,
  };

  const TriggerIcon = triggerIcons[workflow.trigger_type] || Play;

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-linear-to-br ${
            workflow.status === 'active' ? 'from-green-500 to-emerald-500' :
            workflow.status === 'paused' ? 'from-yellow-500 to-orange-500' :
            'from-gray-400 to-gray-500'
          }`}>
            <Workflow className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[workflow.status]}`}>
                {workflow.status}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <TriggerIcon className="h-3 w-3" />
                {workflow.trigger_type}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-20">
                <button
                  onClick={() => { onView(workflow); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" /> Ver detalles
                </button>
                <button
                  onClick={() => { onClone(workflow.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" /> Duplicar
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => { onDelete(workflow.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {workflow.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{workflow.description}</p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4 py-3 bg-gray-50 rounded-lg px-3">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{workflow.execution_count || 0}</p>
          <p className="text-xs text-gray-500">Ejecuciones</p>
        </div>
        <div className="text-center border-x border-gray-200">
          <p className="text-lg font-bold text-gray-900">
            {workflow.success_rate ? `${Math.round(workflow.success_rate)}%` : '-'}
          </p>
          <p className="text-xs text-gray-500">Éxito</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-gray-900">
            {workflow.last_execution 
              ? new Date(workflow.last_execution).toLocaleDateString('es-CO')
              : 'Nunca'}
          </p>
          <p className="text-xs text-gray-500">Última</p>
        </div>
      </div>

      <div className="flex gap-2">
        {workflow.status === 'active' ? (
          <button
            onClick={() => onToggleStatus(workflow.id, 'pause')}
            className="flex-1 py-2 px-3 border border-yellow-500 text-yellow-600 rounded-lg text-sm font-medium hover:bg-yellow-50 flex items-center justify-center gap-2"
          >
            <Pause className="h-4 w-4" />
            Pausar
          </button>
        ) : workflow.status === 'paused' ? (
          <button
            onClick={() => onToggleStatus(workflow.id, 'activate')}
            className="flex-1 py-2 px-3 border border-green-500 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            Activar
          </button>
        ) : null}
        
        <button
          onClick={() => onExecute(workflow.id)}
          disabled={workflow.status !== 'active' || isExecuting}
          className="flex-1 py-2 px-3 bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isExecuting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Ejecutar
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Execution Row Component
// ============================================================================

interface ExecutionRowProps {
  execution: ExecutionType;
  onView: (execution: ExecutionType) => void;
  onRetry: (id: number) => void;
  onCancel: (id: number) => void;
}

const ExecutionRow: React.FC<ExecutionRowProps> = ({ execution, onView, onRetry, onCancel }) => {
  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    pending: { color: 'bg-gray-100 text-gray-700', icon: Clock },
    running: { color: 'bg-blue-100 text-blue-700', icon: Loader2 },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle },
    cancelled: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  };

  const config = statusConfig[execution.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Workflow className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{execution.workflow_name || `Workflow #${execution.workflow}`}</p>
            <p className="text-xs text-gray-500">ID: {execution.id}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
          <StatusIcon className={`h-3 w-3 ${execution.status === 'running' ? 'animate-spin' : ''}`} />
          {execution.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {execution.duration ? `${execution.duration.toFixed(2)}s` : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {new Date(execution.created_at).toLocaleString('es-CO')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(execution)}
            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>
          {execution.status === 'failed' && (
            <button
              onClick={() => onRetry(execution.id)}
              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
              title="Reintentar"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {execution.status === 'running' && (
            <button
              onClick={() => onCancel(execution.id)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Cancelar"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// ============================================================================
// Create Workflow Modal
// ============================================================================

interface CreateWorkflowModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateWorkflowModal: React.FC<CreateWorkflowModalProps> = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'manual' as 'manual' | 'schedule' | 'event' | 'webhook',
    status: 'draft' as 'draft' | 'active',
  });

  const createMutation = useMutation({
    mutationFn: () => automationService.createWorkflow({
      ...formData,
      workflow_definition: {
        version: '1.0',
        tasks: [],
      },
    }),
    onSuccess: () => {
      toast.success('Workflow creado', 'El workflow se ha creado correctamente');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al crear workflow');
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div className="bg-linear-to-r from-purple-500 to-indigo-500 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Crear Workflow</h2>
                  <p className="text-purple-100 text-sm">Define un nuevo proceso automatizado</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mi workflow de análisis"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Describe qué hace este workflow..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Trigger
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'manual', label: 'Manual', icon: Play, desc: 'Ejecución manual' },
                  { value: 'schedule', label: 'Programado', icon: Calendar, desc: 'Por horario' },
                  { value: 'event', label: 'Evento', icon: Zap, desc: 'Al detectar cambios' },
                  { value: 'webhook', label: 'Webhook', icon: GitBranch, desc: 'Por API externa' },
                ].map((trigger) => {
                  const Icon = trigger.icon;
                  return (
                    <button
                      key={trigger.value}
                      onClick={() => setFormData({ ...formData, trigger_type: trigger.value as any })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.trigger_type === trigger.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${formData.trigger_type === trigger.value ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className="font-medium text-gray-900">{trigger.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{trigger.desc}</p>
                    </button>
                  );
                })}
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
                disabled={!formData.name || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Crear Workflow
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
  execution: ExecutionType;
  onClose: () => void;
}

const ExecutionDetailModal: React.FC<ExecutionDetailModalProps> = ({ execution, onClose }) => {
  const toast = useToast();

  const statusConfig: Record<string, { color: string; bgColor: string }> = {
    pending: { color: 'text-gray-700', bgColor: 'bg-gray-100' },
    running: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
    completed: { color: 'text-green-700', bgColor: 'bg-green-100' },
    failed: { color: 'text-red-700', bgColor: 'bg-red-100' },
    cancelled: { color: 'text-orange-700', bgColor: 'bg-orange-100' },
  };

  const config = statusConfig[execution.status];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className={`p-4 flex items-center justify-between ${
            execution.status === 'completed' ? 'bg-linear-to-r from-green-500 to-emerald-500' :
            execution.status === 'failed' ? 'bg-linear-to-r from-red-500 to-rose-500' :
            execution.status === 'running' ? 'bg-linear-to-r from-blue-500 to-cyan-500' :
            'bg-linear-to-r from-gray-500 to-gray-600'
          } text-white`}>
            <div className="flex items-center gap-3">
              <Workflow className="h-6 w-6" />
              <div>
                <h3 className="font-bold">{execution.workflow_name || `Workflow #${execution.workflow}`}</h3>
                <p className="text-sm opacity-90">Ejecución #{execution.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                {execution.status}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            {/* Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Inicio</p>
                <p className="font-medium text-gray-900">
                  {execution.started_at ? new Date(execution.started_at).toLocaleString('es-CO') : '-'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Duración</p>
                <p className="font-medium text-gray-900">
                  {execution.duration ? `${execution.duration.toFixed(2)} segundos` : '-'}
                </p>
              </div>
            </div>

            {/* Error */}
            {execution.error_message && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <pre className="text-sm text-red-600 whitespace-pre-wrap">{execution.error_message}</pre>
              </div>
            )}

            {/* Output */}
            {execution.output_data && Object.keys(execution.output_data).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Resultado</h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(execution.output_data, null, 2));
                      toast.success('Copiado', 'Resultado copiado al portapapeles');
                    }}
                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(execution.output_data, null, 2)}
                </pre>
              </div>
            )}

            {/* Input */}
            {execution.input_data && Object.keys(execution.input_data).length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Parámetros de Entrada</h4>
                <pre className="bg-gray-100 text-gray-700 p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(execution.input_data, null, 2)}
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
// Main Component
// ============================================================================

export default function Processes() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'workflows' | 'executions' | 'schedules'>('workflows');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionType | null>(null);
  const [executingWorkflow, setExecutingWorkflow] = useState<number | null>(null);

  // Queries
  const { data: workflowsData, isLoading: loadingWorkflows } = useQuery({
    queryKey: ['workflows', searchTerm, statusFilter],
    queryFn: () => automationService.getWorkflows({
      search: searchTerm || undefined,
      status: statusFilter as any || undefined,
      ordering: '-created_at',
    }),
  });

  const { data: executionsData, isLoading: loadingExecutions, refetch: refetchExecutions } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => automationService.getExecutions({ ordering: '-created_at' }),
    refetchInterval: 5000, // Auto-refresh
  });

  const { data: statsData } = useQuery({
    queryKey: ['automation-stats'],
    queryFn: () => automationService.getStatistics(),
  });

  const workflows = workflowsData?.results || [];
  const executions = executionsData?.results || [];

  // Mutations
  const executeMutation = useMutation({
    mutationFn: (id: number) => automationService.executeWorkflow(id),
    onSuccess: () => {
      toast.success('Ejecución iniciada', 'El workflow se está ejecutando');
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      setExecutingWorkflow(null);
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.error || 'Error al ejecutar');
      setExecutingWorkflow(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => automationService.activateWorkflow(id),
    onSuccess: () => {
      toast.success('Workflow activado', 'El workflow está ahora activo');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: number) => automationService.pauseWorkflow(id),
    onSuccess: () => {
      toast.success('Workflow pausado', 'El workflow ha sido pausado');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (id: number) => automationService.cloneWorkflow(id),
    onSuccess: () => {
      toast.success('Workflow duplicado', 'Se ha creado una copia del workflow');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => automationService.deleteWorkflow(id),
    onSuccess: () => {
      toast.success('Workflow eliminado', 'El workflow ha sido eliminado');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => automationService.cancelExecution(id),
    onSuccess: () => {
      toast.success('Ejecución cancelada', 'La ejecución ha sido cancelada');
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
    },
  });

  const retryMutation = useMutation({
    mutationFn: (id: number) => automationService.retryExecution(id),
    onSuccess: () => {
      toast.success('Reintentando', 'Se ha iniciado un nuevo intento');
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
    },
  });

  // Handlers
  const handleExecute = (id: number) => {
    setExecutingWorkflow(id);
    executeMutation.mutate(id);
  };

  const handleToggleStatus = (id: number, action: string) => {
    if (action === 'activate') {
      activateMutation.mutate(id);
    } else {
      pauseMutation.mutate(id);
    }
  };

  // Stats
  const stats = {
    totalWorkflows: statsData?.total_workflows || workflows.length,
    activeWorkflows: statsData?.active_workflows || workflows.filter(w => w.status === 'active').length,
    totalExecutions: statsData?.total_executions || executions.length,
    successRate: statsData?.success_rate || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-purple-500 to-indigo-500 rounded-xl text-white">
                <Workflow className="h-6 w-6" />
              </div>
              Centro de Procesos
            </h1>
            <p className="text-gray-500 mt-1">
              Automatiza y gestiona tus workflows de procesamiento geoespacial
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Crear Workflow
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Workflows"
          value={stats.totalWorkflows}
          icon={Workflow}
          color="from-purple-500 to-indigo-500"
        />
        <StatsCard
          title="Workflows Activos"
          value={stats.activeWorkflows}
          icon={Activity}
          color="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Ejecuciones Hoy"
          value={stats.totalExecutions}
          icon={Play}
          color="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Tasa de Éxito"
          value={`${stats.successRate}%`}
          icon={Target}
          color="from-orange-500 to-red-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'workflows', label: 'Workflows', icon: Workflow, count: workflows.length },
          { id: 'executions', label: 'Ejecuciones', icon: History, count: executions.length },
          { id: 'schedules', label: 'Programaciones', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
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
      {activeTab === 'workflows' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar workflows..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          {/* Workflows Grid */}
          {loadingWorkflows ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <Workflow className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No hay workflows</h3>
              <p className="text-gray-500 mb-4">Crea tu primer workflow para automatizar procesos</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Crear Workflow
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow: WorkflowType) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onExecute={handleExecute}
                  onToggleStatus={handleToggleStatus}
                  onView={() => {}}
                  onClone={(id) => cloneMutation.mutate(id)}
                  onDelete={(id) => {
                    if (confirm('¿Estás seguro de eliminar este workflow?')) {
                      deleteMutation.mutate(id);
                    }
                  }}
                  isExecuting={executingWorkflow === workflow.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'executions' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">{executions.length} ejecuciones</span>
            <button
              onClick={() => refetchExecutions()}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
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
              <h3 className="font-semibold text-gray-900">Sin ejecuciones</h3>
              <p className="text-gray-500">Ejecuta un workflow para ver el historial aquí</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Workflow</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Duración</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {executions.map((execution: ExecutionType) => (
                    <ExecutionRow
                      key={execution.id}
                      execution={execution}
                      onView={setSelectedExecution}
                      onRetry={(id) => retryMutation.mutate(id)}
                      onCancel={(id) => cancelMutation.mutate(id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'schedules' && (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Programaciones</h3>
          <p className="text-gray-500 mb-4">
            Configura ejecuciones automáticas de tus workflows
          </p>
          <p className="text-sm text-purple-600">
            Próximamente: Editor visual de programaciones
          </p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateWorkflowModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['workflows'] })}
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