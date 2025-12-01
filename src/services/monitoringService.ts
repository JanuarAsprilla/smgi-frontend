import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { 
  MonitoringProject, 
  Monitor, 
  Detection, 
  ChangeRecord,
  PaginatedResponse 
} from '../types';

export interface MonitoringProjectFilters {
  status?: 'active' | 'paused' | 'completed';
  search?: string;
  ordering?: string;
}

export interface MonitorFilters {
  project?: number;
  monitor_type?: string;
  is_active?: boolean;
  ordering?: string;
}

export interface DetectionFilters {
  monitor?: number;
  status?: 'pending' | 'confirmed' | 'false_positive' | 'resolved';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ordering?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  area_of_interest?: any; // GeoJSON geometry
  start_date: string;
  end_date?: string;
}

export interface CreateMonitorPayload {
  project: number;
  name: string;
  description?: string;
  monitor_type: 'change_detection' | 'threshold' | 'pattern' | 'anomaly';
  layer: number;
  check_interval: number; // minutes
  configuration?: Record<string, any>;
  is_active?: boolean;
}

export interface ReviewDetectionPayload {
  status: 'confirmed' | 'false_positive' | 'resolved';
  review_notes?: string;
}

export const monitoringService = {
  // ============================================================================
  // Monitoring Projects
  // ============================================================================

  /**
   * Get all monitoring projects
   */
  getProjects: async (filters?: MonitoringProjectFilters): Promise<PaginatedResponse<MonitoringProject>> => {
    const { data } = await api.get<PaginatedResponse<MonitoringProject>>(
      API_ENDPOINTS.MONITORING.PROJECTS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single monitoring project
   */
  getProject: async (id: number): Promise<MonitoringProject> => {
    const { data } = await api.get<MonitoringProject>(
      API_ENDPOINTS.MONITORING.PROJECT_DETAIL(id)
    );
    return data;
  },

  /**
   * Create a new monitoring project
   */
  createProject: async (payload: CreateProjectPayload): Promise<MonitoringProject> => {
    const { data } = await api.post<MonitoringProject>(
      API_ENDPOINTS.MONITORING.PROJECTS,
      payload
    );
    return data;
  },

  /**
   * Update a monitoring project
   */
  updateProject: async (id: number, payload: Partial<CreateProjectPayload>): Promise<MonitoringProject> => {
    const { data } = await api.put<MonitoringProject>(
      API_ENDPOINTS.MONITORING.PROJECT_DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Delete a monitoring project
   */
  deleteProject: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.MONITORING.PROJECT_DETAIL(id));
  },

  // ============================================================================
  // Monitors
  // ============================================================================

  /**
   * Get all monitors
   */
  getMonitors: async (filters?: MonitorFilters): Promise<PaginatedResponse<Monitor>> => {
    const { data } = await api.get<PaginatedResponse<Monitor>>(
      API_ENDPOINTS.MONITORING.MONITORS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single monitor
   */
  getMonitor: async (id: number): Promise<Monitor> => {
    const { data } = await api.get<Monitor>(
      API_ENDPOINTS.MONITORING.MONITOR_DETAIL(id)
    );
    return data;
  },

  /**
   * Create a new monitor
   */
  createMonitor: async (payload: CreateMonitorPayload): Promise<Monitor> => {
    const { data } = await api.post<Monitor>(
      API_ENDPOINTS.MONITORING.MONITORS,
      payload
    );
    return data;
  },

  /**
   * Update a monitor
   */
  updateMonitor: async (id: number, payload: Partial<CreateMonitorPayload>): Promise<Monitor> => {
    const { data } = await api.put<Monitor>(
      API_ENDPOINTS.MONITORING.MONITOR_DETAIL(id),
      payload
    );
    return data;
  },

  /**
   * Delete a monitor
   */
  deleteMonitor: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.MONITORING.MONITOR_DETAIL(id));
  },

  /**
   * Execute a monitor manually
   */
  executeMonitor: async (id: number): Promise<{ message: string; detection_count: number }> => {
    const { data } = await api.post(API_ENDPOINTS.MONITORING.MONITOR_EXECUTE(id));
    return data;
  },

  /**
   * Pause a monitor
   */
  pauseMonitor: async (id: number): Promise<Monitor> => {
    const { data } = await api.post<Monitor>(
      API_ENDPOINTS.MONITORING.MONITOR_PAUSE(id)
    );
    return data;
  },

  /**
   * Resume a monitor
   */
  resumeMonitor: async (id: number): Promise<Monitor> => {
    const { data } = await api.post<Monitor>(
      API_ENDPOINTS.MONITORING.MONITOR_RESUME(id)
    );
    return data;
  },

  // ============================================================================
  // Detections
  // ============================================================================

  /**
   * Get all detections
   */
  getDetections: async (filters?: DetectionFilters): Promise<PaginatedResponse<Detection>> => {
    const { data } = await api.get<PaginatedResponse<Detection>>(
      API_ENDPOINTS.MONITORING.DETECTIONS,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single detection
   */
  getDetection: async (id: number): Promise<Detection> => {
    const { data } = await api.get<Detection>(
      API_ENDPOINTS.MONITORING.DETECTION_DETAIL(id)
    );
    return data;
  },

  /**
   * Review a detection
   */
  reviewDetection: async (id: number, payload: ReviewDetectionPayload): Promise<Detection> => {
    const { data } = await api.post<Detection>(
      API_ENDPOINTS.MONITORING.DETECTION_REVIEW(id),
      payload
    );
    return data;
  },

  /**
   * Get detection dashboard statistics
   */
  getDetectionDashboard: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.MONITORING.DETECTION_DASHBOARD);
    return data;
  },

  // ============================================================================
  // Change Records
  // ============================================================================

  /**
   * Get all change records
   */
  getChangeRecords: async (filters?: { detection?: number }): Promise<PaginatedResponse<ChangeRecord>> => {
    const { data } = await api.get<PaginatedResponse<ChangeRecord>>(
      API_ENDPOINTS.MONITORING.CHANGES,
      { params: filters }
    );
    return data;
  },

  // ============================================================================
  // Reports
  // ============================================================================

  /**
   * Get monitoring reports
   */
  getReports: async (filters?: { project?: number }): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.MONITORING.REPORTS,
      { params: filters }
    );
    return data;
  },

  /**
   * Create a monitoring report
   */
  createReport: async (payload: {
    project: number;
    name: string;
    report_type: string;
    date_range?: { start: string; end: string };
  }): Promise<any> => {
    const { data } = await api.post(API_ENDPOINTS.MONITORING.REPORTS, payload);
    return data;
  },

  // ============================================================================
  // Baselines
  // ============================================================================

  /**
   * Get baselines
   */
  getBaselines: async (filters?: { monitor?: number }): Promise<PaginatedResponse<any>> => {
    const { data } = await api.get<PaginatedResponse<any>>(
      API_ENDPOINTS.MONITORING.BASELINES,
      { params: filters }
    );
    return data;
  },

  /**
   * Create a baseline
   */
  createBaseline: async (payload: {
    monitor: number;
    name: string;
    baseline_data: any;
  }): Promise<any> => {
    const { data } = await api.post(API_ENDPOINTS.MONITORING.BASELINES, payload);
    return data;
  },

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get monitoring statistics
   */
  getStatistics: async (): Promise<any> => {
    const { data } = await api.get(API_ENDPOINTS.MONITORING.STATISTICS);
    return data;
  },
};
