import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(authToken, app = 'user') {
  if (Platform.OS === 'web') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Superbucket',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E30613',
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') return null;

  const deviceToken = await Notifications.getDevicePushTokenAsync();
  const token = deviceToken?.data;
  if (!token) return null;

  return apiRequest('/notifications/devices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      token,
      platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
      app,
    }),
  });
}

export function getNotifications(page = 1, limit = 30) {
  return authenticatedRequest(`/notifications/my?page=${page}&limit=${limit}`);
}

export function markNotificationRead(id) {
  return authenticatedRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return authenticatedRequest('/notifications/read-all', { method: 'PATCH' });
}

async function authenticatedRequest(path, options = {}) {
  const token = await SecureStore.getItemAsync('auth_token');
  if (!token) throw new Error('Please log in again');

  return apiRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
