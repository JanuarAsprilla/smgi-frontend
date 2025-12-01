// Configuración del backend API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login/',
    REFRESH: '/auth/refresh/',
    VERIFY: '/auth/verify/',
  },
  
  // Users
  USERS: {
    LIST: '/users/users/',
    ME: '/users/users/me/',
    REGISTER: '/users/users/register/',
    VERIFY_EMAIL: '/users/users/verify-email/',
    PENDING_APPROVALS: '/users/users/pending-approvals/',
    APPROVE_REJECT: (id: number) => `/users/users/${id}/approve-reject/`,
    ACTIVITY_LOG: (id: number) => `/users/users/${id}/activity-log/`,
    ROLES: '/users/roles/',
    AREAS: '/users/areas/',
  },
  
  // Geodata
  GEODATA: {
    DATASOURCES: '/geodata/datasources/',
    LAYERS: '/geodata/layers/',
    LAYER_DETAIL: (id: number) => `/geodata/layers/${id}/`,
    LAYER_UPLOAD: '/geodata/layers/upload/',
    LAYER_EXPORT: (id: number) => `/geodata/layers/${id}/export/`,
    LAYER_DOWNLOAD_SHP: (id: number) => `/geodata/layers/${id}/download/shapefile/`,
    LAYER_DOWNLOAD_GEOJSON: (id: number) => `/geodata/layers/${id}/download/geojson/`,
    FEATURES: '/geodata/features/',
    DATASETS: '/geodata/datasets/',
    DATASET_EXPORT: (id: number) => `/geodata/datasets/${id}/export/`,
    SYNC_LOGS: '/geodata/synclogs/',
  },
  
  // Agents
  AGENTS: {
    LIST: '/agents/agents/',
    DETAIL: (id: number) => `/agents/agents/${id}/`,
    EXECUTE: (id: number) => `/agents/agents/${id}/execute/`,
    PUBLISH: (id: number) => `/agents/agents/${id}/publish/`,
    ARCHIVE: (id: number) => `/agents/agents/${id}/archive/`,
    CLONE: (id: number) => `/agents/agents/${id}/clone/`,
    RATE: (id: number) => `/agents/agents/${id}/rate/`,
    RATINGS: (id: number) => `/agents/agents/${id}/ratings/`,
    EXECUTIONS: (id: number) => `/agents/agents/${id}/executions/`,
    MARKETPLACE: '/agents/agents/marketplace/',
    STATISTICS: '/agents/agents/statistics/',
    CATEGORIES: '/agents/categories/',
    EXECUTIONS_LIST: '/agents/executions/',
    EXECUTION_DETAIL: (id: number) => `/agents/executions/${id}/`,
    EXECUTION_CANCEL: (id: number) => `/agents/executions/${id}/cancel/`,
    EXECUTION_RETRY: (id: number) => `/agents/executions/${id}/retry/`,
    SCHEDULES: '/agents/schedules/',
    TEMPLATES: '/agents/templates/',
    // AI Providers endpoints
    PROVIDERS: '/agents/agents/providers/',
    CONFIGURE_PROVIDER: '/agents/agents/configure-provider/',
    TEST_PROVIDER: '/agents/agents/test-provider/',
    // Prebuilt & Upload
    PREBUILT: '/agents/agents/prebuilt/',
    FROM_PREBUILT: '/agents/agents/from-prebuilt/',
    UPLOAD: '/agents/agents/upload/',
    MY_AGENTS: '/agents/agents/my-agents/',
  },
  
  // Monitoring
  MONITORING: {
    PROJECTS: '/monitoring/projects/',
    PROJECT_DETAIL: (id: number) => `/monitoring/projects/${id}/`,
    MONITORS: '/monitoring/monitors/',
    MONITOR_DETAIL: (id: number) => `/monitoring/monitors/${id}/`,
    MONITOR_EXECUTE: (id: number) => `/monitoring/monitors/${id}/execute/`,
    MONITOR_PAUSE: (id: number) => `/monitoring/monitors/${id}/pause/`,
    MONITOR_RESUME: (id: number) => `/monitoring/monitors/${id}/resume/`,
    DETECTIONS: '/monitoring/detections/',
    DETECTION_DETAIL: (id: number) => `/monitoring/detections/${id}/`,
    DETECTION_REVIEW: (id: number) => `/monitoring/detections/${id}/review/`,
    DETECTION_DASHBOARD: '/monitoring/detections/dashboard/',
    CHANGES: '/monitoring/changes/',
    REPORTS: '/monitoring/reports/',
    BASELINES: '/monitoring/baselines/',
    STATISTICS: '/monitoring/statistics/',
  },
  
  // Alerts
  ALERTS: {
    LIST: '/alerts/alerts/',
    DETAIL: (id: number) => `/alerts/alerts/${id}/`,
    ACKNOWLEDGE: (id: number) => `/alerts/alerts/${id}/acknowledge/`,
    RESOLVE: (id: number) => `/alerts/alerts/${id}/resolve/`,
    DASHBOARD: '/alerts/alerts/dashboard/',
    RULES: '/alerts/rules/',
    CHANNELS: '/alerts/channels/',
    SUBSCRIPTIONS: '/alerts/subscriptions/',
    TEMPLATES: '/alerts/templates/',
    STATISTICS: '/alerts/statistics/',
  },
  
  // Automation
  AUTOMATION: {
    WORKFLOWS: '/automation/workflows/',
    WORKFLOW_DETAIL: (id: number) => `/automation/workflows/${id}/`,
    WORKFLOW_EXECUTE: (id: number) => `/automation/workflows/${id}/execute/`,
    WORKFLOW_ACTIVATE: (id: number) => `/automation/workflows/${id}/activate/`,
    WORKFLOW_PAUSE: (id: number) => `/automation/workflows/${id}/pause/`,
    WORKFLOW_STATISTICS: (id: number) => `/automation/workflows/${id}/statistics/`,
    TASKS: '/automation/tasks/',
    EXECUTIONS: '/automation/executions/',
    RULES: '/automation/rules/',
    SCHEDULES: '/automation/schedules/',
    STATISTICS: '/automation/statistics/',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    DETAIL: (id: number) => `/notifications/${id}/`,
    MARK_READ: (id: number) => `/notifications/${id}/mark-as-read/`,
    MARK_ALL_READ: '/notifications/mark-all-as-read/',
    UNREAD_COUNT: '/notifications/unread-count/',
    PREFERENCES: '/notifications/preferences/',
  },
};
