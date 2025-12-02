import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  Alert, 
  AlertRule, 
  AlertChannel, 
  PaginatedResponse 
} from '../types';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'pending' | 'sent' | 'acknowledged' | 'resolved' | 'failed';
export type AlertRuleType = 'threshold' | 'pattern' | 'anomaly' | 'schedule';

export interface AlertFilters {
  status?: AlertStatus;
  severity?: AlertSeverity;
  rule?: number;
  search?: string;
  created_at__gte?: string;
  created_at__lte?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface AlertRuleFilters {
  rule_type?: AlertRuleType;
  is_active?: boolean;
  severity?: AlertSeverity;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CreateAlertChannelPayload {
  name: string;
  description?: string;
  channel_type: 'email' | 'sms' | 'webhook' | 'slack' | 'telegram';
  configuration: Record<string, any>;
  is_active?: boolean;
}

export interface CreateAlertRulePayload {
  name: string;
  description?: string;
  rule_type: AlertRuleType;
  conditions: Record<string, any>;
  severity: AlertSeverity;
  channels: number[];
  cooldown_minutes?: number;
  is_active?: boolean;
}

export interface AlertStatistics {
  total_alerts: number;
  active_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  alerts_today: number;
  alerts_this_week: number;
  alerts_this_month: number;
  by_severity: Record<string, number>;
  by_status: Record<string, number>;
}

export interface CreateAlertSubscriptionPayload {
  channels: number[];
  projects?: number[];
  monitors?: number[];
  severity_filter?: string[];
  is_active?: boolean;
}

// ============================================================================
// Alert Service
// ============================================================================

export const alertService = {
  // ============================================================================
  // Alerts
  // ============================================================================

  /**
   * Get all alerts
   */
  getAlerts: async (filters?: AlertFilters): Promise<PaginatedResponse<Alert>> => {
    const { data } = await api.get<PaginatedResponse<Alert>>(
      API_ENDPOINTS.ALERTS.LIST,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single alert
   */
  getAlert: async (id: number): Promise<Alert> => {
    const { data } = await api.get<Alert>(API_ENDPOINTS.ALERTS.DETAIL(id));
    return data;
  },

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert: async (id: number, notes?: string): Promise<Alert> => {
    const { data } = await api.post<Alert>(
      API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id),
      { notes }
    );
    return data;
  },

  /**
   * Resolve an alert
   */
  resolveAlert: async (id: number, payload?: { resolution_notes?: string }): Promise<Alert> => {
    const { data } = await api.post<Alert>(
      API_ENDPOINTS.ALERTS.RESOLVE(id),
      payload
    );
    return data;
  },

  /**
   * Get alert dashboard statistics
   */
  getDashboard: async (): Promise<{
    statistics: AlertStatistics;
    recent_alerts: Alert[];
  }> => {
    const { data } = await api.get(API_ENDPOINTS.ALERTS.DASHBOARD);
    return data;
  },

  /**
   * Get alert statistics
   */
  getStatistics: async (): Promise<AlertStatistics> => {
    const { data } = await api.get(API_ENDPOINTS.ALERTS.STATISTICS);
    return data;
  },

  /**
   * Get active alerts count
   */
  getActiveCount: async (): Promise<{ count: number }> => {
    const { data } = await api.get<PaginatedResponse<Alert>>(
      API_ENDPOINTS.ALERTS.LIST,
      { params: { status: 'pending', page_size: 1 } }
    );
    return { count: data.count };
  },

  /**
   * Get critical alerts
   */
  getCriticalAlerts: async (): Promise<Alert[]> => {
    const { data } = await api.get<PaginatedResponse<Alert>>(
      API_ENDPOINTS.ALERTS.LIST,
      { params: { severity: 'critical', status: 'pending', ordering: '-created_at' } }
    );
    return data.results;
  },

  // ============================================================================
  // Alert Rules
  // ============================================================================

  /**
   * Get all alert rules
   */
  getRules: async (filters?: AlertRuleFilters): Promise<PaginatedResponse<AlertRule>> => {
    const { data } = await api.get<PaginatedResponse<AlertRule>>(
      API_ENDPOINTS.ALERTS.RULES,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single alert rule
   */
  getRule: async (id: number): Promise<AlertRule> => {
    const { data } = await api.get<AlertRule>(`${API_ENDPOINTS.ALERTS.RULES}${id}/`);
    return data;
  },

  /**
   * Create a new alert rule
   */
  createRule: async (payload: CreateAlertRulePayload): Promise<AlertRule> => {
    const { data } = await api.post<AlertRule>(
      API_ENDPOINTS.ALERTS.RULES,
      payload
    );
    return data;
  },

  /**
   * Update an alert rule
   */
  updateRule: async (id: number, payload: Partial<CreateAlertRulePayload>): Promise<AlertRule> => {
    const { data } = await api.patch<AlertRule>(
      `${API_ENDPOINTS.ALERTS.RULES}${id}/`,
      payload
    );
    return data;
  },

  /**
   * Delete an alert rule
   */
  deleteRule: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.ALERTS.RULES}${id}/`);
  },

  /**
   * Toggle alert rule status
   */
  toggleRuleStatus: async (id: number, isActive: boolean): Promise<AlertRule> => {
    if (isActive) {
      const { data } = await api.post<AlertRule>(
        `${API_ENDPOINTS.ALERTS.RULES}${id}/enable/`
      );
      return data;
    } else {
      const { data } = await api.post<AlertRule>(
        `${API_ENDPOINTS.ALERTS.RULES}${id}/disable/`
      );
      return data;
    }
  },

  /**
   * Enable an alert rule
   */
  enableRule: async (id: number): Promise<AlertRule> => {
    const { data } = await api.post<AlertRule>(
      `${API_ENDPOINTS.ALERTS.RULES}${id}/enable/`
    );
    return data;
  },

  /**
   * Disable an alert rule
   */
  disableRule: async (id: number): Promise<AlertRule> => {
    const { data } = await api.post<AlertRule>(
      `${API_ENDPOINTS.ALERTS.RULES}${id}/disable/`
    );
    return data;
  },

  /**
   * Test an alert rule
   */
  testRule: async (id: number): Promise<{ message: string; result: any }> => {
    const { data } = await api.post(
      `${API_ENDPOINTS.ALERTS.RULES}${id}/test/`
    );
    return data;
  },

  // ============================================================================
  // Alert Channels
  // ============================================================================

  /**
   * Get all alert channels
   */
  getChannels: async (): Promise<PaginatedResponse<AlertChannel>> => {
    const { data } = await api.get<PaginatedResponse<AlertChannel>>(
      API_ENDPOINTS.ALERTS.CHANNELS
    );
    return data;
  },

  /**
   * Get a single alert channel
   */
  getChannel: async (id: number): Promise<AlertChannel> => {
    const { data } = await api.get<AlertChannel>(
      `${API_ENDPOINTS.ALERTS.CHANNELS}${id}/`
    );
    return data;
  },

  /**
   * Create a new alert channel
   */
  createChannel: async (payload: CreateAlertChannelPayload): Promise<AlertChannel> => {
    const { data } = await api.post<AlertChannel>(
      API_ENDPOINTS.ALERTS.CHANNELS,
      payload
    );
    return data;
  },

  /**
   * Update an alert channel
   */
  updateChannel: async (id: number, payload: Partial<CreateAlertChannelPayload>): Promise<AlertChannel> => {
    const { data } = await api.put<AlertChannel>(
      `${API_ENDPOINTS.ALERTS.CHANNELS}${id}/`,
      payload
    );
    return data;
  },

  /**
   * Delete an alert channel
   */
  deleteChannel: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.ALERTS.CHANNELS}${id}/`);
  },

  /**
   * Test an alert channel
   */
  testChannel: async (id: number): Promise<{ message: string; success: boolean }> => {
    const { data } = await api.post(
      `${API_ENDPOINTS.ALERTS.CHANNELS}${id}/test/`
    );
    return data;
  },

  // ============================================================================
  // Alert Subscriptions
  // ============================================================================

  /**
   * Get current user's subscriptions
   */
  getSubscriptions: async (): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.ALERTS.SUBSCRIPTIONS
    );
    return data;
  },

  /**
   * Get current user's subscription
   */
  getMySubscription: async (): Promise<any> => {
    const { data } = await api.get(
      `${API_ENDPOINTS.ALERTS.SUBSCRIPTIONS}me/`
    );
    return data;
  },

  /**
   * Create a subscription
   */
  createSubscription: async (payload: CreateAlertSubscriptionPayload): Promise<any> => {
    const { data } = await api.post(
      API_ENDPOINTS.ALERTS.SUBSCRIPTIONS,
      payload
    );
    return data;
  },

  /**
   * Update a subscription
   */
  updateSubscription: async (id: number, payload: Partial<CreateAlertSubscriptionPayload>): Promise<any> => {
    const { data } = await api.put(
      `${API_ENDPOINTS.ALERTS.SUBSCRIPTIONS}${id}/`,
      payload
    );
    return data;
  },

  /**
   * Delete a subscription
   */
  deleteSubscription: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.ALERTS.SUBSCRIPTIONS}${id}/`);
  },

  // ============================================================================
  // Alert Templates
  // ============================================================================

  /**
   * Get alert templates
   */
  getTemplates: async (): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.ALERTS.TEMPLATES
    );
    return data;
  },

  /**
   * Use a template to create a rule
   */
  useTemplate: async (id: number, payload: { name: string }): Promise<AlertRule> => {
    const { data } = await api.post<AlertRule>(
      `${API_ENDPOINTS.ALERTS.TEMPLATES}${id}/use/`,
      payload
    );
    return data;
  },

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Acknowledge multiple alerts
   */
  bulkAcknowledge: async (ids: number[]): Promise<{ acknowledged: number }> => {
    const results = await Promise.all(
      ids.map(id => alertService.acknowledgeAlert(id))
    );
    return { acknowledged: results.length };
  },

  /**
   * Resolve multiple alerts
   */
  bulkResolve: async (ids: number[], notes?: string): Promise<{ resolved: number }> => {
    const results = await Promise.all(
      ids.map(id => alertService.resolveAlert(id, { resolution_notes: notes }))
    );
    return { resolved: results.length };
  },
};

export default alertService;