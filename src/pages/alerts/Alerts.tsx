/**
 * Alerts Page - Sistema de Monitoreo Geoespacial Inteligente
 * Página principal para gestión de alertas del sistema
 * 
 * Compatible con el backend SMGI existente
 */

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Eye,
  CheckCheck,
  XCircle,
  Zap,
  Shield,
  Send,
  Mail,
  Smartphone,
  Globe,
  TestTube,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { alertService } from '../../services/alertService';
import type { Alert, AlertRule, AlertChannel } from '../../types';

// ============================================================================
// Types - Usando los del backend
// ============================================================================

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertStatus = 'pending' | 'sent' | 'acknowledged' | 'resolved' | 'failed';

interface AlertFilters {
  status?: AlertStatus;
  severity?: AlertSeverity;
  rule?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

interface AlertStatistics {
  total_alerts: number;
  active_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  alerts_today: number;
  alerts_this_week?: number;
  alerts_this_month?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getSeverityConfig = (severity: AlertSeverity) => {
  const configs = {
    critical: {
      bg: 'bg-red-100',
      border: 'border-red-500',
      text: 'text-red-800',
      badge: 'bg-red-500 text-white',
      icon: AlertCircle,
      pulse: 'animate-pulse',
    },
    high: {
      bg: 'bg-orange-100',
      border: 'border-orange-500',
      text: 'text-orange-800',
      badge: 'bg-orange-500 text-white',
      icon: AlertTriangle,
      pulse: '',
    },
    medium: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-500',
      text: 'text-yellow-800',
      badge: 'bg-yellow-500 text-white',
      icon: Bell,
      pulse: '',
    },
    low: {
      bg: 'bg-blue-100',
      border: 'border-blue-500',
      text: 'text-blue-800',
      badge: 'bg-blue-500 text-white',
      icon: Bell,
      pulse: '',
    },
  };
  return configs[severity] || configs.low;
};

const getStatusConfig = (status: AlertStatus) => {
  const configs = {
    pending: { bg: 'bg-red-100', text: 'text-red-700', label: 'Pendiente' },
    sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Enviada' },
    acknowledged: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Reconocida' },
    resolved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Resuelta' },
    failed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Fallida' },
  };
  return configs[status] || configs.pending;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Hace un momento';
  if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
  if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)} días`;
  return date.toLocaleDateString('es-ES');
};

// ============================================================================
// Alert Detail Modal Component
// ============================================================================

interface AlertDetailModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (id: number) => void;
  onResolve: (id: number, notes: string) => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onAcknowledge,
  onResolve,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);

  if (!isOpen || !alert) return null;

  const severityConfig = getSeverityConfig(alert.severity as AlertSeverity);
  const statusConfig = getStatusConfig(alert.status as AlertStatus);
  const SeverityIcon = severityConfig.icon;

  const handleResolve = () => {
    onResolve(alert.id, resolutionNotes);
    setResolutionNotes('');
    setShowResolveForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className={`${severityConfig.bg} rounded-t-2xl p-6 border-b-4 ${severityConfig.border}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl ${severityConfig.badge} ${severityConfig.pulse}`}>
                  <SeverityIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${severityConfig.text}`}>
                    {(alert as any).title || `Alerta #${alert.id}`}
                  </h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityConfig.badge}`}>
                      {(alert.severity || 'low').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <XCircle className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Message */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Mensaje
              </h3>
              <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">
                {alert.message || 'Sin mensaje adicional'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">ID</h4>
                <p className="text-gray-800 font-medium">#{alert.id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Regla</h4>
                <p className="text-gray-800 font-medium">{(alert as any).rule_name || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Creada</h4>
                <p className="text-gray-800 font-medium">
                  {new Date(alert.created_at).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Tiempo</h4>
                <p className="text-gray-800 font-medium">{formatTimeAgo(alert.created_at)}</p>
              </div>
            </div>

            {/* Acknowledgement Info */}
            {(alert as any).acknowledged_at && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">✓ Reconocida</h4>
                <p className="text-sm text-yellow-700">
                  Por <strong>{(alert as any).acknowledged_by_username || 'Usuario'}</strong> el{' '}
                  {new Date((alert as any).acknowledged_at).toLocaleString('es-ES')}
                </p>
              </div>
            )}

            {/* Resolution Info */}
            {(alert as any).resolved_at && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2">✓ Resuelta</h4>
                <p className="text-sm text-green-700">
                  Por <strong>{(alert as any).resolved_by_username || 'Usuario'}</strong> el{' '}
                  {new Date((alert as any).resolved_at).toLocaleString('es-ES')}
                </p>
                {(alert as any).resolution_notes && (
                  <p className="text-sm text-green-700 mt-2 bg-green-100 p-2 rounded">
                    <strong>Notas:</strong> {(alert as any).resolution_notes}
                  </p>
                )}
              </div>
            )}

            {/* Resolution Form */}
            {showResolveForm && alert.status !== 'resolved' && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Notas de Resolución</h4>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe cómo se resolvió esta alerta..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowResolveForm(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirmar Resolución
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cerrar
            </button>
            <div className="flex space-x-3">
              {(alert.status === 'pending' || alert.status === 'sent') && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center space-x-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Reconocer</span>
                </button>
              )}
              {alert.status !== 'resolved' && (
                <button
                  onClick={() => setShowResolveForm(true)}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Resolver</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Statistics Cards Component
// ============================================================================

const StatisticsCards: React.FC<{ stats: AlertStatistics | undefined; isLoading: boolean }> = ({
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Pendientes',
      value: stats?.active_alerts || stats?.total_alerts || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      label: 'Críticas',
      value: stats?.critical_alerts || 0,
      icon: Zap,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      label: 'Hoy',
      value: stats?.alerts_today || 0,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'Resueltas',
      value: stats?.resolved_alerts || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bg} ${card.border} border rounded-xl p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// Alert Card Component
// ============================================================================

const AlertCard: React.FC<{
  alert: Alert;
  onView: (alert: Alert) => void;
  onAcknowledge: (id: number) => void;
  onResolve: (id: number) => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
}> = ({ alert, onView, onAcknowledge, onResolve, isSelected, onSelect }) => {
  const severityConfig = getSeverityConfig(alert.severity as AlertSeverity);
  const statusConfig = getStatusConfig(alert.status as AlertStatus);
  const SeverityIcon = severityConfig.icon;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 ${severityConfig.border} 
        hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(alert.id)}
              className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />

            <div className={`p-2 rounded-lg ${severityConfig.bg} ${severityConfig.pulse}`}>
              <SeverityIcon className={`h-5 w-5 ${severityConfig.text}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {(alert as any).title || `Alerta #${alert.id}`}
                </h3>
                {alert.severity === 'critical' && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full animate-pulse">
                    CRÍTICA
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {alert.message || 'Sin mensaje'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityConfig.badge}`}>
                  {(alert.severity || 'low').toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeAgo(alert.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={() => onView(alert)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </button>
            {(alert.status === 'pending' || alert.status === 'sent') && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Reconocer"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}
            {alert.status !== 'resolved' && (
              <button
                onClick={() => onResolve(alert.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Resolver"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Alert Rules Section Component
// ============================================================================

const AlertRulesSection: React.FC<{ rules: AlertRule[]; isLoading: boolean }> = ({
  rules,
  isLoading,
}) => {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      alertService.toggleRuleStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => alertService.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
    },
  });

  const testMutation = useMutation({
    mutationFn: (id: number) => alertService.testRule(id),
    onSuccess: (data) => {
      alert(`Prueba completada: ${data.message}`);
    },
  });

  const getRuleTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      threshold: 'Umbral',
      pattern: 'Patrón',
      anomaly: 'Anomalía',
      schedule: 'Programada',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reglas de Alertas</h2>
          <p className="text-sm text-gray-500">
            Configura las condiciones que disparan alertas automáticas
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2.5 bg-linear-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all shadow-lg">
          <Zap className="h-4 w-4" />
          <span>Nueva Regla</span>
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay reglas configuradas
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primera regla para empezar a recibir alertas automáticas.
          </p>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            Crear primera regla
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule) => {
            const severityConfig = getSeverityConfig(rule.severity as AlertSeverity);
            return (
              <div
                key={rule.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${severityConfig.border} overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            rule.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rule.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {rule.description || 'Sin descripción'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${severityConfig.badge}`}>
                          {(rule.severity || 'low').toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {getRuleTypeLabel(rule.rule_type)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMutation.mutate({ id: rule.id, isActive: !rule.is_active })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Creada: {new Date(rule.created_at).toLocaleDateString('es-ES')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => testMutation.mutate(rule.id)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="Probar regla"
                    >
                      <TestTube className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar esta regla?')) {
                          deleteMutation.mutate(rule.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Alert Channels Section Component
// ============================================================================

const AlertChannelsSection: React.FC = () => {
  const { data: channelsData, isLoading } = useQuery({
    queryKey: ['alert-channels'],
    queryFn: () => alertService.getChannels(),
  });

  const testMutation = useMutation({
    mutationFn: (id: number) => alertService.testChannel(id),
    onSuccess: (data) => {
      alert(data.success ? '✅ Canal probado exitosamente' : '❌ Error al probar el canal');
    },
  });

  const getChannelIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      email: Mail,
      sms: Smartphone,
      webhook: Globe,
      slack: Send,
      telegram: Send,
    };
    return icons[type] || Send;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const channels = channelsData?.results || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Canales de Notificación</h2>
          <p className="text-sm text-gray-500">Configura cómo recibir las alertas</p>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay canales configurados
          </h3>
          <p className="text-gray-500">
            Configura canales para recibir notificaciones de alertas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {channels.map((channel: AlertChannel) => {
            const Icon = getChannelIcon(channel.channel_type);
            return (
              <div key={channel.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${channel.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-6 w-6 ${channel.is_active ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    channel.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {channel.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{channel.name}</h3>
                <p className="text-sm text-gray-500 mb-3 capitalize">{channel.channel_type}</p>
                <button
                  onClick={() => testMutation.mutate(channel.id)}
                  disabled={!channel.is_active || testMutation.isPending}
                  className="w-full py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {testMutation.isPending ? 'Probando...' : 'Probar canal'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Alerts Page Component
// ============================================================================

const Alerts: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState<AlertFilters>({
    ordering: '-created_at',
    page: 1,
    page_size: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'channels'>('alerts');

  // Queries
  const { data: alertsData, isLoading: isLoadingAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => alertService.getAlerts(filters),
    refetchInterval: 30000,
  });

  const { data: dashboardData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['alert-dashboard'],
    queryFn: () => alertService.getDashboard(),
    refetchInterval: 60000,
  });

  const { data: rulesData, isLoading: isLoadingRules } = useQuery({
    queryKey: ['alert-rules'],
    queryFn: () => alertService.getRules(),
    enabled: activeTab === 'rules',
  });

  // Mutations
  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => alertService.acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-dashboard'] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      alertService.resolveAlert(id, { resolution_notes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-dashboard'] });
      setShowDetailModal(false);
    },
  });

  // Handlers
  const handleSearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  }, [searchTerm]);

  const handleFilterChange = (key: keyof AlertFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  const handleAcknowledge = (id: number) => {
    acknowledgeMutation.mutate(id);
  };

  const handleResolve = (id: number, notes: string = '') => {
    resolveMutation.mutate({ id, notes });
  };

  const handleSelectAlert = (id: number) => {
    setSelectedAlerts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (alertsData?.results) {
      if (selectedAlerts.length === alertsData.results.length) {
        setSelectedAlerts([]);
      } else {
        setSelectedAlerts(alertsData.results.map((a) => a.id));
      }
    }
  };

  const handleBulkAcknowledge = async () => {
    for (const id of selectedAlerts) {
      await acknowledgeMutation.mutateAsync(id);
    }
    setSelectedAlerts([]);
  };

  const handleBulkResolve = async () => {
    for (const id of selectedAlerts) {
      await resolveMutation.mutateAsync({ id, notes: 'Resuelto en lote' });
    }
    setSelectedAlerts([]);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Calculate pagination
  const totalPages = alertsData ? Math.ceil(alertsData.count / (filters.page_size || 10)) : 0;

  // Get statistics from dashboard
  const statistics: AlertStatistics | undefined = dashboardData?.statistics;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-linear-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Centro de Alertas</h1>
                  <p className="text-sm text-gray-500">
                    Monitorea y gestiona las alertas del sistema
                  </p>
                </div>
              </div>
              <button
                onClick={() => refetchAlerts()}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={`h-5 w-5 ${isLoadingAlerts ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeTab === 'alerts'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Alertas</span>
                  {statistics?.active_alerts ? (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {statistics.active_alerts}
                    </span>
                  ) : null}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeTab === 'rules'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Reglas</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('channels')}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                  activeTab === 'channels'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Send className="h-4 w-4" />
                  <span>Canales</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'alerts' && (
          <>
            {/* Statistics */}
            <StatisticsCards stats={statistics} isLoading={isLoadingStats} />

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar alertas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filters.severity || ''}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Todas las severidades</option>
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>

                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="sent">Enviadas</option>
                    <option value="acknowledged">Reconocidas</option>
                    <option value="resolved">Resueltas</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedAlerts.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedAlerts.length} alerta(s) seleccionada(s)
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleBulkAcknowledge}
                      className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Reconocer todas
                    </button>
                    <button
                      onClick={handleBulkResolve}
                      className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Resolver todas
                    </button>
                    <button
                      onClick={() => setSelectedAlerts([])}
                      className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Alert List */}
            <div className="space-y-3">
              {isLoadingAlerts ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : alertsData?.results.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¡Todo en orden!
                  </h3>
                  <p className="text-gray-500">
                    No hay alertas que coincidan con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedAlerts.length === alertsData?.results.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Seleccionar todas</span>
                  </div>

                  {alertsData?.results.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onView={handleViewAlert}
                      onAcknowledge={handleAcknowledge}
                      onResolve={(id) => handleResolve(id)}
                      isSelected={selectedAlerts.includes(alert.id)}
                      onSelect={handleSelectAlert}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-600">
                  Mostrando {((filters.page || 1) - 1) * (filters.page_size || 10) + 1} -{' '}
                  {Math.min((filters.page || 1) * (filters.page_size || 10), alertsData?.count || 0)} de{' '}
                  {alertsData?.count || 0} alertas
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={(filters.page || 1) <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">
                    Página {filters.page || 1} de {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={(filters.page || 1) >= totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'rules' && (
          <AlertRulesSection rules={rulesData?.results || []} isLoading={isLoadingRules} />
        )}

        {activeTab === 'channels' && <AlertChannelsSection />}
      </div>

      {/* Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
};

export default Alerts;