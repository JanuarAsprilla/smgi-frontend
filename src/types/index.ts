// ============================================================================
// User & Auth Types
// ============================================================================

export interface Role {
  id: number;
  name: string;
  role_type: 'system' | 'custom';
  description?: string;
  permissions: string[];
  is_system_role: boolean;
}

export interface Area {
  id: number;
  name: string;
  description?: string;
  parent_area?: number;
  is_active: boolean;
}

export interface UserProfile {
  id: number;
  user: number;
  phone?: string;
  organization?: string;
  department?: string;
  position?: string;
  role: Role;
  area?: Area;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  access_justification?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  profile?: UserProfile;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: User;
}

// ============================================================================
// Geodata Types
// ============================================================================

export interface DataSource {
  id: number;
  name: string;
  description?: string;
  source_type: 'postgres' | 'geoserver' | 'api' | 'file' | 'other';
  connection_params: Record<string, any>;
  is_active: boolean;
  last_sync?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Layer {
  id: number;
  name: string;
  description?: string;
  datasource?: number;
  layer_type: 'raster' | 'vector' | 'tile';
  geometry_type?: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
  srid: number;
  bbox?: number[];
  feature_count?: number;
  features?: Feature[]; // Features de la capa (cuando se carga desde API)
  metadata?: Record<string, any>;
  styling?: Record<string, any>;
  is_active: boolean;
  is_public: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: number;
  layer: number;
  geometry: any; // GeoJSON geometry
  properties: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: number;
  name: string;
  description?: string;
  layers: number[];
  metadata?: Record<string, any>;
  is_public: boolean;
  created_by: number;
  created_at: string;
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  created_by: number;
  created_at: string;
}

export interface Agent {
  id: number;
  name: string;
  description?: string;
  category: number;
  agent_type: 'data_import' | 'data_processing' | 'analysis' | 'monitoring' | 'export' | 'notification' | 'statistics' | 'classification' | 'custom';
  status: 'draft' | 'published' | 'archived';
  version: string;
  code: string;
  model?: string; // Modelo de IA utilizado (opcional)
  configuration?: Record<string, any>;
  parameters_schema?: Record<string, any>;
  is_public: boolean;
  rating_avg?: number;
  rating_count?: number;
  execution_count?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface AgentExecution {
  id: number;
  agent: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  parameters?: Record<string, any>;
  result?: any;
  error_message?: string;
  logs?: string;
  started_at?: string;
  completed_at?: string;
  created_by: number;
  created_at: string;
}

export interface AgentSchedule {
  id: number;
  agent: number;
  name: string;
  schedule_type: 'cron' | 'interval';
  schedule_config: Record<string, any>;
  parameters?: Record<string, any>;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  created_by: number;
  created_at: string;
}

// ============================================================================
// Monitoring Types
// ============================================================================

export interface MonitoringProject {
  id: number;
  name: string;
  description?: string;
  area_of_interest?: any; // GeoJSON geometry
  status: 'active' | 'paused' | 'completed';
  start_date: string;
  end_date?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Monitor {
  id: number;
  project?: number;
  name: string;
  description?: string;
  monitor_type: string;
  status?: string; // active, paused, error
  layer: number;
  layers?: number[]; // Multiple layers support
  check_interval: number; // minutes
  configuration?: Record<string, any>;
  parameters?: Record<string, any>;
  is_active: boolean;
  last_check?: string;
  next_check?: string;
  total_checks?: number;
  detections_count?: number;
  agent?: {
    id: number;
    name: string;
  };
  created_by?: number;
  created_at?: string;
}

export interface Detection {
  id: number;
  monitor: number;
  title: string;
  description: string;
  detection_type?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'confirmed' | 'false_positive' | 'resolved' | 'investigating';
  location?: any; // GeoJSON geometry
  metadata?: Record<string, any>;
  analysis_data?: Record<string, any>;
  detected_at: string;
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
}

export interface ChangeRecord {
  id: number;
  detection: number;
  change_type: string;
  old_value?: any;
  new_value?: any;
  confidence: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// ============================================================================
// Alert Types
// ============================================================================

export interface AlertChannel {
  id: number;
  name: string;
  description?: string;
  channel_type: 'email' | 'sms' | 'webhook' | 'slack' | 'telegram';
  configuration: Record<string, any>;
  is_active: boolean;
  created_by: number;
  created_at: string;
}

export interface AlertRule {
  id: number;
  name: string;
  description?: string;
  rule_type: 'threshold' | 'pattern' | 'anomaly' | 'schedule';
  conditions: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  channels: number[];
  created_by: number;
  created_at: string;
}

export interface Alert {
  id: number;
  rule: number;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'sent' | 'acknowledged' | 'resolved' | 'failed';
  metadata?: Record<string, any>;
  triggered_at: string;
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  created_at: string;
}

// ============================================================================
// Automation Types
// ============================================================================

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  trigger_type: 'manual' | 'schedule' | 'event' | 'webhook';
  workflow_definition: Record<string, any>;
  is_public: boolean;
  execution_count?: number;
  success_count?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: number;
  workflow: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger_type: string;
  context?: Record<string, any>;
  result?: any;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_by: number;
  created_at: string;
}

export interface AutomationRule {
  id: number;
  name: string;
  description?: string;
  rule_type: 'conditional' | 'scheduled' | 'reactive';
  conditions: Record<string, any>;
  actions: Record<string, any>;
  is_active: boolean;
  trigger_count?: number;
  created_by: number;
  created_at: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: number;
  user: number;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  action_url?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: number;
  user: number;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  preferences: Record<string, any>;
  // Tipos de notificaciones específicas
  notify_analysis_complete?: boolean;
  notify_analysis_failed?: boolean;
  notify_process_complete?: boolean;
  notify_alerts_critical?: boolean;
  notify_alerts_high?: boolean;
  notify_alerts_medium?: boolean;
  notify_alerts_low?: boolean;
  notify_resource_shared?: boolean;
  notify_weekly_report?: boolean;
  notify_system_updates?: boolean;
}

// ============================================================================
// Generic Types
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ErrorResponse {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: any;
}

// Legacy type for backward compatibility
export interface Analysis {
  id: number;
  layer: number;
  status: string;
  analysis_type: string;
  result?: any;
  started_at: string;
  completed_at?: string;
}