import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { Notification, NotificationPreferences, PaginatedResponse } from '../types';

export interface NotificationFilters {
  is_read?: boolean;
  notification_type?: 'info' | 'success' | 'warning' | 'error';
  ordering?: string;
}

export const notificationService = {
  // ============================================================================
  // Notifications
  // ============================================================================

  /**
   * Get all notifications for current user
   */
  getNotifications: async (filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> => {
    const { data } = await api.get<PaginatedResponse<Notification>>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      { params: filters }
    );
    return data;
  },

  /**
   * Get a single notification
   */
  getNotification: async (id: number): Promise<Notification> => {
    const { data } = await api.get<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)
    );
    return data;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: number): Promise<Notification> => {
    const { data } = await api.post<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
    );
    return data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const { data } = await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return data;
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return data;
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id));
  },

  // ============================================================================
  // Notification Preferences
  // ============================================================================

  /**
   * Get notification preferences for current user
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await api.get<NotificationPreferences>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return data;
  },

  /**
   * Update notification preferences
   */
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    const { data } = await api.put<NotificationPreferences>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      preferences
    );
    return data;
  },

  /**
   * Test email notification
   */
  testEmail: async (): Promise<{ message: string }> => {
    const { data } = await api.post(`${API_ENDPOINTS.NOTIFICATIONS.PREFERENCES}/test-email/`);
    return data;
  },

  /**
   * Test SMS notification
   */
  testSMS: async (): Promise<{ message: string }> => {
    const { data } = await api.post(`${API_ENDPOINTS.NOTIFICATIONS.PREFERENCES}/test-sms/`);
    return data;
  },

  // ============================================================================
  // Real-time notifications (WebSocket)
  // ============================================================================

  /**
   * Connect to WebSocket for real-time notifications
   * Note: This requires WebSocket implementation
   */
  connectWebSocket: (userId: number, onMessage: (notification: Notification) => void) => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws/notifications/${userId}/`);

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      onMessage(notification);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return ws;
  },
};
