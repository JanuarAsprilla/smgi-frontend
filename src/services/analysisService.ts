import api from './api';
import type { Analysis, PaginatedResponse } from '../types';
import { mockAnalyses } from './mockData';

const DEMO_MODE = false;

// Mock agents para demo
const mockAgents = [
  { id: 1, name: 'Gemini Pro', agent_type: 'gemini' as const, model: 'gemini-pro', is_active: true },
  { id: 2, name: 'GPT-4', agent_type: 'gpt' as const, model: 'gpt-4', is_active: true },
  { id: 3, name: 'Claude 3', agent_type: 'claude' as const, model: 'claude-3-sonnet', is_active: true },
];

export const analysisService = {
  getAnalyses: async (): Promise<PaginatedResponse<Analysis>> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        count: mockAnalyses.length,
        results: mockAnalyses,
      };
    }
    const { data } = await api.get<PaginatedResponse<Analysis>>('/agents/analyses/');
    return data;
  },

  getAnalysis: async (id: number): Promise<Analysis> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const analysis = mockAnalyses.find(a => a.id === id);
      if (!analysis) throw new Error('Analysis not found');
      return analysis;
    }
    const { data } = await api.get<Analysis>(`/agents/analyses/${id}/`);
    return data;
  },

  getAgents: async (): Promise<PaginatedResponse<any>> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        count: mockAgents.length,
        results: mockAgents,
      };
    }
    const { data } = await api.get('/agents/agents/');
    return data;
  },

  createAnalysis: async (payload: {
    agent_id: number;
    layer_id: number;
    analysis_type: string;
    prompt?: string;
  }): Promise<Analysis> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newAnalysis: Analysis = {
        id: Math.max(...mockAnalyses.map(a => a.id)) + 1,
        layer: payload.layer_id,
        status: 'running',
        analysis_type: payload.analysis_type,
        started_at: new Date().toISOString(),
      };
      mockAnalyses.unshift(newAnalysis);
      
      // Simular que se completa después de 3 segundos
      setTimeout(() => {
        newAnalysis.status = 'completed';
        newAnalysis.completed_at = new Date().toISOString();
        newAnalysis.result = {
          summary: 'Análisis completado exitosamente',
          insights: ['Patrón detectado en zona norte', 'Densidad alta en área central'],
        };
      }, 3000);
      
      return newAnalysis;
    }
    const { data } = await api.post<Analysis>('/agents/analyze/', payload);
    return data;
  },
};
