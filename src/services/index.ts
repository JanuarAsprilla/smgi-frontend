/**
 * Central export for all API services
 * Import services from here for better organization
 */

export { authService } from './authService';
export { userService } from './userService';
export { layerService } from './layerService';
export { agentService } from './agentService';
export { monitoringService } from './monitoringService';
export { alertService } from './alertService';
export { automationService } from './automationService';
export { notificationService } from './notificationService';
export { analysisService } from './analysisService';

// Export the configured axios instance
export { default as api } from './api';

// Re-export types for convenience
export type { 
  RegisterData,
  PendingUser,
  ApprovalData 
} from './userService';

export type {
  LayerFilters,
  FeatureFilters,
  ExportLayerPayload,
} from './layerService';

export type {
  AgentFilters,
  ExecuteAgentPayload,
  RateAgentPayload,
  CreateAgentPayload,
  CreateSchedulePayload,
} from './agentService';

export type {
  MonitoringProjectFilters,
  MonitorFilters,
  DetectionFilters,
  CreateProjectPayload,
  CreateMonitorPayload,
  ReviewDetectionPayload,
} from './monitoringService';

export type {
  AlertFilters,
  AlertRuleFilters,
  CreateAlertChannelPayload,
  CreateAlertRulePayload,
  CreateAlertSubscriptionPayload,
} from './alertService';

export type {
  WorkflowFilters,
  WorkflowExecutionFilters,
  AutomationRuleFilters,
  CreateWorkflowPayload,
  ExecuteWorkflowPayload,
  CreateAutomationRulePayload,
  CreateWorkflowSchedulePayload,
} from './automationService';

export type {
  NotificationFilters,
} from './notificationService';
