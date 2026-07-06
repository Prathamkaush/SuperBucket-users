import * as SecureStore from 'expo-secure-store';
import { apiRequest } from './api';
import { registerForPushNotifications } from './notifications';

async function persistAuth(data) {
  await SecureStore.setItemAsync('auth_token', data.token);
  await SecureStore.setItemAsync('auth_user', JSON.stringify(data.user));
  registerForPushNotifications(data.token, 'user').catch(() => undefined);
  return data;
}

export function getAuthToken() {
  return SecureStore.getItemAsync('auth_token');
}

export async function getStoredUser() {
  const value = await SecureStore.getItemAsync('auth_user');
  return value ? JSON.parse(value) : null;
}

export async function updateStoredUser(user) {
  await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
  return user;
}

export async function clearAuth() {
  await Promise.all([
    SecureStore.deleteItemAsync('auth_token'),
    SecureStore.deleteItemAsync('auth_user'),
  ]);
}

export async function authenticatedRequest(path, options = {}) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Please log in again');
  }

  return apiRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function exchangeGoogleIdToken(idToken) {
  const data = await apiRequest('/auth/google/mobile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  return persistAuth(data);
}

export function sendPhoneOtp(phone) {
  return apiRequest('/auth/phone/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });
}

export async function verifyPhoneOtp(challengeToken, otp) {
  const data = await apiRequest('/auth/phone/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ challengeToken, otp }),
  });

  return persistAuth(data);
}
