/**
 * Notification system for user feedback
 * Provides consistent notifications for success, error, warning, and info messages
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  timestamp: Date;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

/**
 * Simple in-memory notification store
 * In a real app, this could be replaced with Zustand or React Context
 */
class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    this.notifications.push(newNotification);
    this.notify();

    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, duration);
    }

    return newNotification.id;
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  clearAll() {
    this.notifications = [];
    this.notify();
  }

  getNotifications() {
    return [...this.notifications];
  }
}

// Singleton instance
export const notificationManager = new NotificationManager();

/**
 * Helper functions for common notification types
 */
export const notify = {
  success: (title: string, message: string, duration?: number) => {
    return notificationManager.addNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  },

  error: (title: string, message: string, actions?: NotificationAction[], duration?: number) => {
    return notificationManager.addNotification({
      type: 'error',
      title,
      message,
      actions,
      duration: duration ?? 8000, // Errors stay longer by default
    });
  },

  warning: (title: string, message: string, duration?: number) => {
    return notificationManager.addNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  },

  info: (title: string, message: string, duration?: number) => {
    return notificationManager.addNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  },
};

/**
 * Error notification with retry functionality
 */
export function notifyError(
  title: string,
  message: string,
  retryFn?: () => void,
  duration?: number
) {
  const actions: NotificationAction[] = [];
  
  if (retryFn) {
    actions.push({
      label: 'Retry',
      onClick: retryFn,
      variant: 'primary',
    });
  }

  return notify.error(title, message, actions, duration);
}

/**
 * Success notification for operations
 */
export function notifySuccess(operation: string, entity?: string) {
  const message = entity 
    ? `${entity} ${operation} successfully`
    : `${operation} completed successfully`;
  
  return notify.success('Success', message);
}

/**
 * Loading state notifications
 */
export function notifyLoading(operation: string, entity?: string) {
  const message = entity
    ? `${operation} ${entity}...`
    : `${operation}...`;
  
  return notify.info('Loading', message, 0); // Duration 0 means manual removal
}

/**
 * Network error notification with retry
 */
export function notifyNetworkError(retryFn?: () => void) {
  return notifyError(
    'Connection Error',
    'Unable to connect to the server. Please check your internet connection.',
    retryFn
  );
}

/**
 * Validation error notification
 */
export function notifyValidationError(fields: string[]) {
  const message = `Please check the following fields: ${fields.join(', ')}`;
  return notify.error('Validation Error', message);
}

/**
 * Session expired notification
 */
export function notifySessionExpired(loginFn?: () => void) {
  const actions: NotificationAction[] = [];
  
  if (loginFn) {
    actions.push({
      label: 'Login',
      onClick: loginFn,
      variant: 'primary',
    });
  }

  return notify.error(
    'Session Expired',
    'Your session has expired. Please log in again.',
    actions,
    10000
  );
}