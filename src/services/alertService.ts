import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  Alert, 
  AlertRule, 
  AlertChannel, 
  PaginatedResponse 
} from '../types';

export interface AlertFilters {
  status?: 'pending' | 'sent' | 'acknowledged' | 'resolved' | 'failed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  rule?: number;
  ordering?: string;
}

export interface AlertRuleFilters {
  rule_type?: 'threshold' | 'pattern' | 'anomaly' | 'schedule';
  is_active?: boolean;
  ordering?: string;
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
  rule_type: 'threshold' | 'pattern' | 'anomaly' | 'schedule';
  conditions: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: number[];
  is_active?: boolean;
}

export interface CreateAlertSubscriptionPayload {
  channels: number[];
  projects?: number[];
  monitors?: number[];
  severity_filter?: string[];
  is_active?: boolean;
}

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
  acknowledgeAlert: async (id: number): Promise<Alert> => {
    const { data } = await api.post<Alert>(
      API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id)
    );
    return data;
  },

  /**
   * Resolve an alert
   */
  resolveAlert: async (id: number, resolution_notes?: string): Promise<Alert> => {
    const { data } = await api.post<Alert>(
      API_ENDPOINTS.ALERTS.RESOLVE(id),
      { resolution_notes }
    );
    return data;
  },

  /**
   * Get alert dashboard statistics
   */
  getDashboard: async (): Promise<{
    statistics: any;
    recent_alerts: Alert[];
  }> => {
    const { data } = await api.get(API_ENDPOINTS.ALERTS.DASHBOARD);
    return data;
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
    const { data } = await api.put<AlertRule>(
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
  // Statistics
  // ============================================================================

  /**
   * Get alert statistics
   */
  getStatistics: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.ALERTS.STATISTICS);
    return data;
  },
};
