export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Layer {
  id: number;
  name: string;
  description?: string;
  layer_type: string;
  geometry_type?: string;
  srid: number;
  is_active: boolean;
  feature_count?: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  results: T[];
}

export interface Analysis {
  id: number;
  layer: number;
  status: string;
  analysis_type: string;
  result?: any;
  started_at: string;
  completed_at?: string;
}