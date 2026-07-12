import { apiRequest } from './api';

export function getAvailableCoupons() {
  return apiRequest('/coupons/available');
}
