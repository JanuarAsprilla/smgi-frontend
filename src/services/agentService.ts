import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  Agent, 
  AgentCategory,
  AgentExecution, 
  AgentSchedule, 
  PaginatedResponse 
} from '../types';

export interface AgentFilters {
  agent_type?: string;
  status?: string;
  category?: number;
  is_public?: boolean;
  search?: string;
  ordering?: string;
}

export interface ExecuteAgentPayload {
  parameters?: Record<string, any>;
}

export interface RateAgentPayload {
  rating: number; // 1-5
  comment?: string;
}

export interface CreateAgentPayload {
  name: string;
  description?: string;
  category: number;
  agent_type: string;
  code: string;
  configuration?: Record<string, any>;
  parameters_schema?: Record<string, any>;
  is_public?: boolean;
}

export interface CreateSchedulePayload {
  agent: number;
  name: string;
  schedule_type: 'cron' | 'interval';
  schedule_config: Record<string, any>;
  parameters?: Record<string, any>;
  is_active?: boolean;
}

export const agentService = {
  // ============================================================================
  // Categories
  // ============================================================================

  /**
   * Get all agent categories
   */
  getCategories: async (): Promise<PaginatedResponse<AgentCategory>> => {
    const { data } = await api.get<PaginatedResponse<AgentCategory>>(
      API_ENDPOINTS.AGENTS.CATEGORIES
    );
    return data;
  },

  /**
   * Create a new agent category
   */
  createCategory: async (payload: Partial<AgentCategory>): Promise<AgentCategory> => {
    const { data } = await api.post<AgentCategory>(
      API_ENDPOINTS.AGENTS.CATEGORIES,
      payload
    );
    return data;
  },

  // ============================================================================
  // Agents
  // ============================================================================

  /**
   * Get all agents with optional filters
   */
  getAgents: async (filters?: AgentFilters): Promise<PaginatedResponse<Agent>> => {
    const { data } = await api.get<PaginatedResponse<Agent>>(
      API_ENDPOINTS.AGENTS.LIST,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single agent by ID
   */
  getAgent: async (id: number): Promise<Agent> => {
    const { data } = await api.get<Agent>(API_ENDPOINTS.AGENTS.DETAIL(id));
    return data;
  },

  /**
   * Create a new agent
   */
  createAgent: async (payload: CreateAgentPayload): Promise<Agent> => {
    const { data } = await api.post<Agent>(API_ENDPOINTS.AGENTS.LIST, payload);
    return data;
  },

  /**
   * Update an existing agent
   */
  updateAgent: async (id: number, payload: Partial<CreateAgentPayload>): Promise<Agent> => {
    const { data } = await api.put<Agent>(
      API_ENDPOINTS.AGENTS.DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Delete an agent
   */
  deleteAgent: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.AGENTS.DETAIL(id));
  },

  /**
   * Publish an agent
   */
  publishAgent: async (id: number): Promise<Agent> => {
    const { data } = await api.post<Agent>(API_ENDPOINTS.AGENTS.PUBLISH(id));
    return data;
  },

  /**
   * Archive an agent
   */
  archiveAgent: async (id: number): Promise<Agent> => {
    const { data } = await api.post<Agent>(API_ENDPOINTS.AGENTS.ARCHIVE(id));
    return data;
  },

  /**
   * Clone an agent
   */
  cloneAgent: async (id: number, newName?: string): Promise<Agent> => {
    const { data } = await api.post<Agent>(API_ENDPOINTS.AGENTS.CLONE(id), {
      name: newName,
    });
    return data;
  },

  // ============================================================================
  // Agent Execution
  // ============================================================================

  /**
   * Execute an agent
   */
  executeAgent: async (id: number, payload: ExecuteAgentPayload): Promise<AgentExecution> => {
    const { data } = await api.post<AgentExecution>(
      API_ENDPOINTS.AGENTS.EXECUTE(id),
      payload
    );
    return data;
  },

  /**
   * Get executions for a specific agent
   */
  getAgentExecutions: async (id: number): Promise<PaginatedResponse<AgentExecution>> => {
    const { data } = await api.get<PaginatedResponse<AgentExecution>>(
      API_ENDPOINTS.AGENTS.EXECUTIONS(id)
    );
    return data;
  },

  /**
   * Get all executions with optional filters
   */
  getExecutions: async (filters?: {
    agent?: number;
    status?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<AgentExecution>> => {
    const { data } = await api.get<PaginatedResponse<AgentExecution>>(
      API_ENDPOINTS.AGENTS.EXECUTIONS_LIST,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single execution by ID
   */
  getExecution: async (id: number): Promise<AgentExecution> => {
    const { data } = await api.get<AgentExecution>(
      API_ENDPOINTS.AGENTS.EXECUTION_DETAIL(id)
    );
    return data;
  },

  /**
   * Cancel a running execution
   */
  cancelExecution: async (id: number): Promise<AgentExecution> => {
    const { data } = await api.post<AgentExecution>(
      API_ENDPOINTS.AGENTS.EXECUTION_CANCEL(id)
    );
    return data;
  },

  /**
   * Retry a failed execution
   */
  retryExecution: async (id: number): Promise<AgentExecution> => {
    const { data } = await api.post<AgentExecution>(
      API_ENDPOINTS.AGENTS.EXECUTION_RETRY(id)
    );
    return data;
  },

  // ============================================================================
  // Agent Rating
  // ============================================================================

  /**
   * Rate an agent
   */
  rateAgent: async (id: number, payload: RateAgentPayload): Promise<{ message: string }> => {
    const { data } = await api.post(API_ENDPOINTS.AGENTS.RATE(id), payload);
    return data;
  },

  /**
   * Get ratings for an agent
   */
  getAgentRatings: async (id: number): Promise<any[]> => {
    const { data } = await api.get(API_ENDPOINTS.AGENTS.RATINGS(id));
    return data;
  },

  // ============================================================================
  // Marketplace
  // ============================================================================

  /**
   * Get public agents from marketplace
   */
  getMarketplace: async (filters?: AgentFilters): Promise<PaginatedResponse<Agent>> => {
    const { data } = await api.get<PaginatedResponse<Agent>>(
      API_ENDPOINTS.AGENTS.MARKETPLACE,
      { params: filters }
    );
    return data;
  },

  /**
   * Get agent statistics
   */
  getStatistics: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.AGENTS.STATISTICS);
    return data;
  },

  // ============================================================================
  // Schedules
  // ============================================================================

  /**
   * Get all schedules
   */
  getSchedules: async (filters?: { agent?: number }): Promise<PaginatedResponse<AgentSchedule>> => {
    const { data } = await api.get<PaginatedResponse<AgentSchedule>>(
      API_ENDPOINTS.AGENTS.SCHEDULES,
      { params: filters }
    );
    return data;
  },

  /**
   * Create a schedule
   */
  createSchedule: async (payload: CreateSchedulePayload): Promise<AgentSchedule> => {
    const { data } = await api.post<AgentSchedule>(
      API_ENDPOINTS.AGENTS.SCHEDULES,
      payload
    );
    return data;
  },

  /**
   * Update a schedule
   */
  updateSchedule: async (id: number, payload: Partial<CreateSchedulePayload>): Promise<AgentSchedule> => {
    const { data } = await api.put<AgentSchedule>(
      `${API_ENDPOINTS.AGENTS.SCHEDULES}${id}/`,
      payload
    );
    return data;
  },

  /**
   * Delete a schedule
   */
  deleteSchedule: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.AGENTS.SCHEDULES}${id}/`);
  },

  /**
   * Enable a schedule
   */
  enableSchedule: async (id: number): Promise<AgentSchedule> => {
    const { data } = await api.post<AgentSchedule>(
      `${API_ENDPOINTS.AGENTS.SCHEDULES}${id}/enable/`
    );
    return data;
  },

  /**
   * Disable a schedule
   */
  disableSchedule: async (id: number): Promise<AgentSchedule> => {
    const { data } = await api.post<AgentSchedule>(
      `${API_ENDPOINTS.AGENTS.SCHEDULES}${id}/disable/`
    );
    return data;
  },

  /**
   * Run a schedule immediately
   */
  runScheduleNow: async (id: number): Promise<AgentExecution> => {
    const { data } = await api.post<AgentExecution>(
      `${API_ENDPOINTS.AGENTS.SCHEDULES}${id}/run_now/`
    );
    return data;
  },

  // ============================================================================
  // Templates
  // ============================================================================

  /**
   * Get agent templates
   */
  getTemplates: async (): Promise<PaginatedResponse<Agent>> => {
    const { data } = await api.get<PaginatedResponse<Agent>>(
      API_ENDPOINTS.AGENTS.TEMPLATES
    );
    return data;
  },

  /**
   * Use a template to create a new agent
   */
  useTemplate: async (id: number, payload: { name: string }): Promise<Agent> => {
    const { data } = await api.post<Agent>(
      `${API_ENDPOINTS.AGENTS.TEMPLATES}${id}/use/`,
      payload
    );
    return data;
  },

  // ============================================================================
  // AI Providers
  // ============================================================================

  /**
   * Get available AI providers
   */
  getProviders: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.AGENTS.PROVIDERS);
    return data;
  },

  /**
   * Configure AI provider
   */
  configureProvider: async (payload: {
    provider: string;
    api_key?: string;
    model?: string;
  }): Promise<any> => {
    const { data } = await api.post(
      API_ENDPOINTS.AGENTS.CONFIGURE_PROVIDER,
      payload
    );
    return data;
  },

  /**
   * Test AI provider connection
   */
  testProvider: async (payload: {
    provider: string;
    api_key?: string;
    model?: string;
  }): Promise<any> => {
    const { data } = await api.post(API_ENDPOINTS.AGENTS.TEST_PROVIDER, payload);
    return data;
  },

  // ============================================================================
  // Prebuilt Agents
  // ============================================================================

  /**
   * Get prebuilt agents
   */
  getPrebuiltAgents: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.AGENTS.PREBUILT);
    return data;
  },

  /**
   * Create agent from prebuilt template
   */
  createFromPrebuilt: async (prebuiltId: string): Promise<Agent> => {
    const { data } = await api.post<Agent>(API_ENDPOINTS.AGENTS.FROM_PREBUILT, {
      prebuilt_id: prebuiltId,
    });
    return data;
  },

  // ============================================================================
  // Upload & My Agents
  // ============================================================================

  /**
   * Upload custom agent
   */
  uploadAgent: async (formData: FormData): Promise<Agent> => {
    const { data } = await api.post<Agent>(
      API_ENDPOINTS.AGENTS.UPLOAD,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  },

  /**
   * Get my agents (user's own agents)
   */
  getMyAgents: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.AGENTS.MY_AGENTS);
    return data;
  },
};
