/**
 * Analysis Service - Redirige a agentService
 * SMGI Frontend
 * 
 * REEMPLAZA tu archivo /src/services/analysisService.ts con este
 * 
 * NOTA: El módulo de "análisis" realmente usa el sistema de Agentes del backend.
 * Este servicio es un wrapper para mantener compatibilidad.
 */

import { agentService } from './agentService';
import type { AgentExecution, PaginatedResponse } from '../types';

export interface CreateAnalysisPayload {
  agent_id: number;
  layer_ids?: number[];
  parameters?: Record<string, any>;
  name?: string;
}

export const analysisService = {
  /**
   * Get all analyses (executions)
   * Los "análisis" son en realidad ejecuciones de agentes
   */
  getAnalyses: async (): Promise<PaginatedResponse<AgentExecution>> => {
    return agentService.getExecutions({ ordering: '-created_at' });
  },

  /**
   * Get a single analysis (execution)
   */
  getAnalysis: async (id: number): Promise<AgentExecution> => {
    return agentService.getExecution(id);
  },

  /**
   * Create analysis = Execute an agent
   */
  createAnalysis: async (payload: CreateAnalysisPayload): Promise<AgentExecution> => {
    return agentService.executeAgent(payload.agent_id, {
      parameters: {
        ...payload.parameters,
        input_layers: payload.layer_ids,
        name: payload.name,
      },
    });
  },

  /**
   * Cancel a running analysis
   */
  cancelAnalysis: async (id: number): Promise<AgentExecution> => {
    return agentService.cancelExecution(id);
  },

  /**
   * Retry a failed analysis
   */
  retryAnalysis: async (id: number): Promise<AgentExecution> => {
    return agentService.retryExecution(id);
  },
};

export default analysisService;