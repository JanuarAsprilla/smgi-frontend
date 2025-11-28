import api from './api';

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notify_analysis_complete: boolean;
  notify_analysis_failed: boolean;
  notify_alerts_critical: boolean;
  notify_alerts_medium: boolean;
  notify_alerts_low: boolean;
  notify_resource_shared: boolean;
  notify_weekly_report: boolean;
}

export const notificationService = {
  // Obtener preferencias
  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await api.get('/notifications/preferences/');
    return data;
  },

  // Actualizar preferencias
  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    const { data } = await api.put('/notifications/update-preferences/', preferences);
    return data;
  },

  // Enviar email de prueba
  testEmail: async () => {
    const { data } = await api.post('/notifications/test-email/');
    return data;
  },

  // Enviar SMS de prueba
  testSMS: async () => {
    const { data } = await api.post('/notifications/test-sms/');
    return data;
  },
};
