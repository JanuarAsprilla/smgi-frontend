import api from './api';
import type { Analysis, PaginatedResponse } from '../types';

export const analysisService = {
  getAnalyses: async (): Promise<PaginatedResponse<Analysis>> => {
    const { data } = await api.get<PaginatedResponse<Analysis>>('/agents/analyses/');
    return data;
  },
};
