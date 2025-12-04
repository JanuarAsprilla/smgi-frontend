/**
 * Alerts Page - Centro de Alertas
 * SMGI Frontend - Versión 3.0 FUNCIONAL
 * 
 * Módulo para gestión de alertas:
 * - Ver y gestionar alertas
 * - Crear reglas de alertas
 * - Configurar canales de notificación
 * - Estadísticas y dashboard
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../../services';
import { useToast } from '../../components/ui/Toast';
import {
  Bell,
  BellOff,
  BellRing,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  X,
  MoreVertical,
  Mail,
  MessageSquare,
  Webhook,
  Smartphone,
  Send,
  TrendingUp,
  BarChart3,
  Shield,
  Play,
  Loader2,
  Check,
  Trash2,
  Edit,
  Volume2,
  VolumeX,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Alert {
  id: number;
  rule?: number;
  rule_name?: string;
  title: string;
  message?: string;
  notification_type?: 'info' | 'success' | 'warning' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved' | 'failed';
  is_read?: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  action_url?: string;
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  triggered_at?: string;
}

interface AlertRule {
  id: number;
  name: string;
  description?: string;
  rule_type: 'threshold' | 'pattern' | 'anomaly' | 'schedule';
  conditions?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  trigger_count?: number;
  last_triggered?: string;
  channels?: number[];
  created_at: string;
}

interface AlertChannel {
  id: number;
  name: string;
  description?: string;
  channel_type: 'email' | 'sms' | 'webhook' | 'slack' | 'telegram';
  configuration?: Record<string, any>;
  is_active: boolean;
  created_at: string;
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
// Alert Card
// ============================================================================

interface AlertCardProps {
  alert: Alert;
  onAcknowledge: (id: number) => void;
  onResolve: (alert: Alert) => void;
  onView: (alert: Alert) => void;
  isAcknowledging?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onResolve, onView, isAcknowledging }) => {
  const severityConfig: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
    low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: AlertCircle },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertTriangle },
    high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle },
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: BellRing },
  };

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pendiente' },
    sent: { color: 'bg-blue-100 text-blue-700', label: 'Enviada' },
    acknowledged: { color: 'bg-purple-100 text-purple-700', label: 'Reconocida' },
    resolved: { color: 'bg-green-100 text-green-700', label: 'Resuelta' },
    failed: { color: 'bg-red-100 text-red-700', label: 'Fallida' },
  };

  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const SeverityIcon = severity.icon;

  return (
    <div className={`rounded-xl border-2 ${severity.border} ${severity.bg} p-4 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <SeverityIcon className={`h-5 w-5 ${severity.text}`} />
          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${severity.text} bg-white`}>
            {alert.severity}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(alert.created_at).toLocaleString('es-CO')}
        </span>
      </div>

      <h4 className="font-semibold text-gray-900 mb-1">{alert.title}</h4>
      {alert.message && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{alert.message}</p>
      )}

      {alert.rule_name && (
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Regla: {alert.rule_name}
        </p>
      )}

      <div className="flex gap-2">
        {alert.status === 'pending' || alert.status === 'sent' ? (
          <>
            <button
              onClick={() => onAcknowledge(alert.id)}
              disabled={isAcknowledging}
              className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAcknowledging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Reconocer
            </button>
            <button
              onClick={() => onResolve(alert)}
              className="flex-1 py-2 px-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Resolver
            </button>
          </>
        ) : (
          <button
            onClick={() => onView(alert)}
            className="flex-1 py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver Detalles
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Rule Card
// ============================================================================

interface RuleCardProps {
  rule: AlertRule;
  onToggle: (id: number, active: boolean) => void;
  onEdit: (rule: AlertRule) => void;
  onDelete: (id: number) => void;
  onTest: (id: number) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({ rule, onToggle, onEdit, onDelete, onTest }) => {
  const [showMenu, setShowMenu] = useState(false);

  const typeIcons: Record<string, React.ElementType> = {
    threshold: BarChart3,
    pattern: TrendingUp,
    anomaly: AlertTriangle,
    schedule: Clock,
  };

  const TypeIcon = typeIcons[rule.rule_type] || Shield;

  const severityColors: Record<string, string> = {
    low: 'from-blue-500 to-cyan-500',
    medium: 'from-yellow-500 to-orange-500',
    high: 'from-orange-500 to-red-500',
    critical: 'from-red-500 to-rose-500',
  };

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-linear-to-br ${severityColors[rule.severity]}`}>
            <TypeIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{rule.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                rule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {rule.is_active ? 'Activa' : 'Inactiva'}
              </span>
              <span className="text-xs text-gray-500 capitalize">{rule.rule_type}</span>
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
                  onClick={() => { onEdit(rule); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" /> Editar
                </button>
                <button
                  onClick={() => { onTest(rule.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Play className="h-4 w-4" /> Probar
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => { onDelete(rule.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {rule.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{rule.description}</p>
      )}

      <div className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{rule.trigger_count || 0}</p>
          <p className="text-xs text-gray-500">Disparos</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-gray-700">
            {rule.last_triggered 
              ? new Date(rule.last_triggered).toLocaleDateString('es-CO')
              : 'Nunca'}
          </p>
          <p className="text-xs text-gray-500">Último</p>
        </div>
      </div>

      <button
        onClick={() => onToggle(rule.id, !rule.is_active)}
        className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
          rule.is_active
            ? 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50'
            : 'bg-linear-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
        }`}
      >
        {rule.is_active ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {rule.is_active ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  );
};

// ============================================================================
// Channel Card
// ============================================================================

interface ChannelCardProps {
  channel: AlertChannel;
  onToggle: (id: number, active: boolean) => void;
  onTest: (id: number) => void;
  onDelete: (id: number) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onToggle, onTest }) => {
  const channelIcons: Record<string, React.ElementType> = {
    email: Mail,
    sms: Smartphone,
    webhook: Webhook,
    slack: MessageSquare,
    telegram: Send,
  };

  const channelColors: Record<string, string> = {
    email: 'from-blue-500 to-cyan-500',
    sms: 'from-green-500 to-emerald-500',
    webhook: 'from-purple-500 to-indigo-500',
    slack: 'from-pink-500 to-rose-500',
    telegram: 'from-cyan-500 to-blue-500',
  };

  const ChannelIcon = channelIcons[channel.channel_type] || Bell;

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-linear-to-br ${channelColors[channel.channel_type]}`}>
            <ChannelIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{channel.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              channel.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {channel.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500 capitalize">{channel.channel_type}</span>
      </div>

      {channel.description && (
        <p className="text-sm text-gray-500 mb-4">{channel.description}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onTest(channel.id)}
          className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Play className="h-4 w-4" />
          Probar
        </button>
        <button
          onClick={() => onToggle(channel.id, !channel.is_active)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
            channel.is_active
              ? 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {channel.is_active ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {channel.is_active ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Resolve Alert Modal
// ============================================================================

interface ResolveAlertModalProps {
  alert: Alert;
  onClose: () => void;
  onSuccess: () => void;
}

const ResolveAlertModal: React.FC<ResolveAlertModalProps> = ({ alert, onClose, onSuccess }) => {
  const toast = useToast();
  const [notes, setNotes] = useState('');

  const resolveMutation = useMutation({
    mutationFn: () => alertService.resolveAlert(alert.id, { resolution_notes: notes }),
    onSuccess: () => {
      toast.success('Alerta resuelta', 'La alerta se ha marcado como resuelta');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al resolver');
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
          <div className={`bg-linear-to-r ${severityColors[alert.severity]} p-6 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Resolver Alerta</h2>
                  <p className="text-white/80 text-sm">Severidad: {alert.severity.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
              {alert.message && (
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-500">Creada</p>
              <p className="font-medium">{new Date(alert.created_at).toLocaleString('es-CO')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas de Resolución
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Describe cómo se resolvió esta alerta..."
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
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
                className="flex-1 px-4 py-2 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {resolveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Resolver Alerta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Create Rule Modal
// ============================================================================

interface CreateRuleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rule_type: 'threshold' as 'threshold' | 'pattern' | 'anomaly' | 'schedule',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    conditions: {},
  });

  const createMutation = useMutation({
    mutationFn: () => alertService.createRule({
      ...formData,
      channels: [],
    }),
    onSuccess: () => {
      toast.success('Regla creada', 'La regla de alerta se ha creado correctamente');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al crear regla');
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full">
          <div className="bg-linear-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nueva Regla</h2>
                  <p className="text-orange-100 text-sm">Configura una regla de alerta</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Alerta de umbral crítico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Describe cuándo debe dispararse esta regla..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Regla
                </label>
                <select
                  value={formData.rule_type}
                  onChange={(e) => setFormData({ ...formData, rule_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="threshold">Umbral</option>
                  <option value="pattern">Patrón</option>
                  <option value="anomaly">Anomalía</option>
                  <option value="schedule">Programada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severidad
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
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
                className="flex-1 px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Crear Regla
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

export default function Alerts() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'channels'>('alerts');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState<Alert | null>(null);
  const [acknowledgingAlert, setAcknowledgingAlert] = useState<number | null>(null);

  // Queries
  const { data: alertsData, isLoading: loadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts', severityFilter, statusFilter],
    queryFn: () => alertService.getAlerts({
      severity: severityFilter as any || undefined,
      status: statusFilter as any || undefined,
      ordering: '-created_at',
    }),
    refetchInterval: 30000,
  });

  const { data: rulesData, isLoading: loadingRules } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: () => alertService.getRules(),
  });

  const { data: channelsData, isLoading: loadingChannels } = useQuery({
    queryKey: ['alert-channels'],
    queryFn: () => alertService.getChannels(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['alert-stats'],
    queryFn: () => alertService.getStatistics(),
  });

  const alerts = alertsData?.results || [];
  const rules = rulesData?.results || [];
  const channels = channelsData?.results || [];

  // Mutations
  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => alertService.acknowledgeAlert(id),
    onSuccess: () => {
      toast.success('Alerta reconocida', 'La alerta ha sido reconocida');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setAcknowledgingAlert(null);
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al reconocer');
      setAcknowledgingAlert(null);
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      active ? alertService.enableRule(id) : alertService.disableRule(id),
    onSuccess: () => {
      toast.success('Regla actualizada');
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const testRuleMutation = useMutation({
    mutationFn: (id: number) => alertService.testRule(id),
    onSuccess: (data) => {
      toast.success('Prueba completada', data.message);
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al probar regla');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => alertService.deleteRule(id),
    onSuccess: () => {
      toast.success('Regla eliminada');
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const testChannelMutation = useMutation({
    mutationFn: (id: number) => alertService.testChannel(id),
    onSuccess: (data) => {
      toast.success('Prueba enviada', data.message);
    },
    onError: (error: any) => {
      toast.error('Error', error.response?.data?.detail || 'Error al probar canal');
    },
  });

  // Stats
  const stats = {
    totalAlerts: statsData?.total_alerts || alerts.length,
    pendingAlerts: statsData?.active_alerts || alerts.filter(a => a.status === 'pending').length,
    criticalAlerts: statsData?.critical_alerts || alerts.filter(a => a.severity === 'critical').length,
    activeRules: rules.filter((r: AlertRule) => r.is_active).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-orange-500 to-red-500 rounded-xl text-white">
                <Bell className="h-6 w-6" />
              </div>
              Centro de Alertas
            </h1>
            <p className="text-gray-500 mt-1">
              Gestiona alertas y configura reglas de notificación
            </p>
          </div>

          <button
            onClick={() => setShowCreateRuleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Nueva Regla
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Alertas"
          value={stats.totalAlerts}
          icon={Bell}
          color="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Pendientes"
          value={stats.pendingAlerts}
          subtitle="Requieren atención"
          icon={Clock}
          color="from-yellow-500 to-orange-500"
          onClick={() => setStatusFilter('pending')}
        />
        <StatsCard
          title="Críticas"
          value={stats.criticalAlerts}
          subtitle="Alta prioridad"
          icon={AlertTriangle}
          color="from-red-500 to-rose-500"
          onClick={() => setSeverityFilter('critical')}
        />
        <StatsCard
          title="Reglas Activas"
          value={stats.activeRules}
          icon={Shield}
          color="from-green-500 to-emerald-500"
          onClick={() => setActiveTab('rules')}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'alerts', label: 'Alertas', icon: Bell, count: alerts.length },
          { id: 'rules', label: 'Reglas', icon: Shield, count: rules.length },
          { id: 'channels', label: 'Canales', icon: Send, count: channels.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg'
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
      {activeTab === 'alerts' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="acknowledged">Reconocida</option>
                <option value="resolved">Resuelta</option>
              </select>
              <button
                onClick={() => refetchAlerts()}
                className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>

          {loadingAlerts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sin alertas</h3>
              <p className="text-gray-500">No hay alertas que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert: Alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={(id) => {
                    setAcknowledgingAlert(id);
                    acknowledgeMutation.mutate(id);
                  }}
                  onResolve={setAlertToResolve}
                  onView={() => {}}
                  isAcknowledging={acknowledgingAlert === alert.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'rules' && (
        <>
          {loadingRules ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sin reglas</h3>
              <p className="text-gray-500 mb-4">Crea tu primera regla de alerta</p>
              <button
                onClick={() => setShowCreateRuleModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Crear Regla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rules.map((rule: AlertRule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={(id, active) => toggleRuleMutation.mutate({ id, active })}
                  onEdit={() => {}}
                  onDelete={(id) => {
                    if (confirm('¿Estás seguro de eliminar esta regla?')) {
                      deleteRuleMutation.mutate(id);
                    }
                  }}
                  onTest={(id) => testRuleMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'channels' && (
        <>
          {loadingChannels ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
              <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sin canales</h3>
              <p className="text-gray-500 mb-4">Configura canales para recibir alertas</p>
              <p className="text-sm text-orange-600">
                Próximamente: Crear canales de notificación
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((channel: AlertChannel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onToggle={() => {}}
                  onTest={(id) => testChannelMutation.mutate(id)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showCreateRuleModal && (
        <CreateRuleModal
          onClose={() => setShowCreateRuleModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['alert-rules'] })}
        />
      )}

      {alertToResolve && (
        <ResolveAlertModal
          alert={alertToResolve}
          onClose={() => setAlertToResolve(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['alerts'] })}
        />
      )}
    </div>
  );
}