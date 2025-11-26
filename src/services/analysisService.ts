import api from './api';
import { Analysis, PaginatedResponse } from '../types';

export const analysisService = {
  getAnalyses: async (): Promise<PaginatedResponse<Analysis>> => {
    const { data } = await api.get<PaginatedResponse<Analysis>>('/agents/analyses/');
    return data;
  },
};
