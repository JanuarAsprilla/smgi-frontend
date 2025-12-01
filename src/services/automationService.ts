import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  Workflow, 
  WorkflowExecution, 
  AutomationRule, 
  PaginatedResponse 
} from '../types';

export interface WorkflowFilters {
  status?: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type?: 'manual' | 'schedule' | 'event' | 'webhook';
  search?: string;
  ordering?: string;
}

export interface WorkflowExecutionFilters {
  workflow?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  ordering?: string;
}

export interface AutomationRuleFilters {
  rule_type?: 'conditional' | 'scheduled' | 'reactive';
  is_active?: boolean;
  ordering?: string;
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'paused';
  trigger_type: 'manual' | 'schedule' | 'event' | 'webhook';
  workflow_definition: Record<string, any>;
  is_public?: boolean;
}

export interface ExecuteWorkflowPayload {
  parameters?: Record<string, any>;
  context?: Record<string, any>;
}

export interface CreateAutomationRulePayload {
  name: string;
  description?: string;
  rule_type: 'conditional' | 'scheduled' | 'reactive';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  is_active?: boolean;
}

export interface CreateWorkflowSchedulePayload {
  workflow: number;
  name: string;
  schedule_type: 'cron' | 'interval';
  schedule_config: Record<string, any>;
  parameters?: Record<string, any>;
  is_active?: boolean;
}

export const automationService = {
  // ============================================================================
  // Workflows
  // ============================================================================

  /**
   * Get all workflows
   */
  getWorkflows: async (filters?: WorkflowFilters): Promise<PaginatedResponse<Workflow>> => {
    const { data } = await api.get<PaginatedResponse<Workflow>>(
      API_ENDPOINTS.AUTOMATION.WORKFLOWS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single workflow
   */
  getWorkflow: async (id: number): Promise<Workflow> => {
    const { data } = await api.get<Workflow>(
      API_ENDPOINTS.AUTOMATION.WORKFLOW_DETAIL(id)
    );
    return data;
  },

  /**
   * Create a new workflow
   */
  createWorkflow: async (payload: CreateWorkflowPayload): Promise<Workflow> => {
    const { data } = await api.post<Workflow>(
      API_ENDPOINTS.AUTOMATION.WORKFLOWS,
      payload
    );
    return data;
  },

  /**
   * Update a workflow
   */
  updateWorkflow: async (id: number, payload: Partial<CreateWorkflowPayload>): Promise<Workflow> => {
    const { data } = await api.put<Workflow>(
      API_ENDPOINTS.AUTOMATION.WORKFLOW_DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Delete a workflow
   */
  deleteWorkflow: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.AUTOMATION.WORKFLOW_DETAIL(id));
  },

  /**
   * Execute a workflow
   */
  executeWorkflow: async (id: number, payload?: ExecuteWorkflowPayload): Promise<WorkflowExecution> => {
    const { data } = await api.post<WorkflowExecution>(
      API_ENDPOINTS.AUTOMATION.WORKFLOW_EXECUTE(id),
      payload || {}
    );
    return data;
  },

  /**
   * Activate a workflow
   */
  activateWorkflow: async (id: number): Promise<Workflow> => {
    const { data } = await api.post<Workflow>(
      API_ENDPOINTS.AUTOMATION.WORKFLOW_ACTIVATE(id)
    );
    return data;
  },

  /**
   * Pause a workflow
   */
  pauseWorkflow: async (id: number): Promise<Workflow> => {
    const { data } = await api.post<Workflow>(
      API_ENDPOINTS.AUTOMATION.WORKFLOW_PAUSE(id)
    );
    return data;
  },

  /**
   * Get workflow statistics
   */
  getWorkflowStatistics: async (id: number): Promise<any> => {
    const { data } = await api.get(
      API_ENDPOINTS.AUTOMATION.WORKFLOW_STATISTICS(id)
    );
    return data;
  },

  /**
   * Clone a workflow
   */
  cloneWorkflow: async (id: number, newName?: string): Promise<Workflow> => {
    const { data } = await api.post<Workflow>(
      `${API_ENDPOINTS.AUTOMATION.WORKFLOW_DETAIL(id)}clone/`,
      { name: newName }
    );
    return data;
  },

  // ============================================================================
  // Workflow Tasks
  // ============================================================================

  /**
   * Get tasks for a workflow
   */
  getWorkflowTasks: async (workflowId: number): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.AUTOMATION.TASKS,
      { params: { workflow: workflowId } }
    );
    return data;
  },

  /**
   * Create a workflow task
   */
  createWorkflowTask: async (payload: {
    workflow: number;
    name: string;
    task_type: string;
    configuration: Record<string, any>;
    order: number;
  }): Promise<any> => {
    const { data } = await api.post(API_ENDPOINTS.AUTOMATION.TASKS, payload);
    return data;
  },

  /**
   * Update a workflow task
   */
  updateWorkflowTask: async (id: number, payload: any): Promise<any> => {
    const { data } = await api.put(`${API_ENDPOINTS.AUTOMATION.TASKS}${id}/`, payload);
    return data;
  },

  /**
   * Delete a workflow task
   */
  deleteWorkflowTask: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.AUTOMATION.TASKS}${id}/`);
  },

  // ============================================================================
  // Workflow Executions
  // ============================================================================

  /**
   * Get all workflow executions
   */
  getExecutions: async (filters?: WorkflowExecutionFilters): Promise<PaginatedResponse<WorkflowExecution>> => {
    const { data } = await api.get<PaginatedResponse<WorkflowExecution>>(
      API_ENDPOINTS.AUTOMATION.EXECUTIONS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single workflow execution
   */
  getExecution: async (id: number): Promise<WorkflowExecution> => {
    const { data } = await api.get<WorkflowExecution>(
      `${API_ENDPOINTS.AUTOMATION.EXECUTIONS}${id}/`
    );
    return data;
  },

  /**
   * Cancel a running execution
   */
  cancelExecution: async (id: number): Promise<WorkflowExecution> => {
    const { data } = await api.post<WorkflowExecution>(
      `${API_ENDPOINTS.AUTOMATION.EXECUTIONS}${id}/cancel/`
    );
    return data;
  },

  /**
   * Retry a failed execution
   */
  retryExecution: async (id: number): Promise<WorkflowExecution> => {
    const { data } = await api.post<WorkflowExecution>(
      `${API_ENDPOINTS.AUTOMATION.EXECUTIONS}${id}/retry/`
    );
    return data;
  },

  // ============================================================================
  // Automation Rules
  // ============================================================================

  /**
   * Get all automation rules
   */
  getRules: async (filters?: AutomationRuleFilters): Promise<PaginatedResponse<AutomationRule>> => {
    const { data } = await api.get<PaginatedResponse<AutomationRule>>(
      API_ENDPOINTS.AUTOMATION.RULES,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single automation rule
   */
  getRule: async (id: number): Promise<AutomationRule> => {
    const { data } = await api.get<AutomationRule>(
      `${API_ENDPOINTS.AUTOMATION.RULES}${id}/`
    );
    return data;
  },

  /**
   * Create an automation rule
   */
  createRule: async (payload: CreateAutomationRulePayload): Promise<AutomationRule> => {
    const { data } = await api.post<AutomationRule>(
      API_ENDPOINTS.AUTOMATION.RULES,
      payload
    );
    return data;
  },

  /**
   * Update an automation rule
   */
  updateRule: async (id: number, payload: Partial<CreateAutomationRulePayload>): Promise<AutomationRule> => {
    const { data } = await api.put<AutomationRule>(
      `${API_ENDPOINTS.AUTOMATION.RULES}${id}/`,
      payload
    );
    return data;
  },

  /**
   * Delete an automation rule
   */
  deleteRule: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.AUTOMATION.RULES}${id}/`);
  },

  /**
   * Enable an automation rule
   */
  enableRule: async (id: number): Promise<AutomationRule> => {
    const { data } = await api.post<AutomationRule>(
      `${API_ENDPOINTS.AUTOMATION.RULES}${id}/enable/`
    );
    return data;
  },

  /**
   * Disable an automation rule
   */
  disableRule: async (id: number): Promise<AutomationRule> => {
    const { data } = await api.post<AutomationRule>(
      `${API_ENDPOINTS.AUTOMATION.RULES}${id}/disable/`
    );
    return data;
  },

  /**
   * Test an automation rule
   */
  testRule: async (id: number): Promise<{ message: string; result: any }> => {
    const { data } = await api.post(
      `${API_ENDPOINTS.AUTOMATION.RULES}${id}/test/`
    );
    return data;
  },

  // ============================================================================
  // Workflow Schedules
  // ============================================================================

  /**
   * Get all workflow schedules
   */
  getSchedules: async (filters?: { workflow?: number }): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.AUTOMATION.SCHEDULES,
      { params: filters }
    );
    return data;
  },

  /**
   * Create a workflow schedule
   */
  createSchedule: async (payload: CreateWorkflowSchedulePayload): Promise<any> => {
    const { data } = await api.post(API_ENDPOINTS.AUTOMATION.SCHEDULES, payload);
    return data;
  },

  /**
   * Update a workflow schedule
   */
  updateSchedule: async (id: number, payload: Partial<CreateWorkflowSchedulePayload>): Promise<any> => {
    const { data } = await api.put(`${API_ENDPOINTS.AUTOMATION.SCHEDULES}${id}/`, payload);
    return data;
  },

  /**
   * Delete a workflow schedule
   */
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.AUTOMATION.SCHEDULES}${id}/`);
  },

  /**
   * Enable a schedule
   */
  enableSchedule: async (id: number): Promise<any> => {
    const { data } = await api.post(`${API_ENDPOINTS.AUTOMATION.SCHEDULES}${id}/enable/`);
    return data;
  },

  /**
   * Disable a schedule
   */
  disableSchedule: async (id: number): Promise<any> => {
    const { data } = await api.post(`${API_ENDPOINTS.AUTOMATION.SCHEDULES}${id}/disable/`);
    return data;
  },

  /**
   * Run a schedule immediately
   */
  runScheduleNow: async (id: number): Promise<WorkflowExecution> => {
    const { data } = await api.post<WorkflowExecution>(
      `${API_ENDPOINTS.AUTOMATION.SCHEDULES}${id}/run_now/`
    );
    return data;
  },

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get automation statistics
   */
  getStatistics: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.AUTOMATION.STATISTICS);
    return data;
  },
};
