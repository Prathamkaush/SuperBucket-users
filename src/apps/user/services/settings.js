import { apiRequest } from './api';

export function getSettings() {
  return apiRequest('/settings');
}
