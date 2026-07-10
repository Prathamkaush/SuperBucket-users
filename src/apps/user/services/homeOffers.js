import { apiRequest } from './api';
import { authenticatedRequest } from './auth';

export function getHomeOffers() {
  return apiRequest('/home-offers');
}

export function submitBusinessAd(payload) {
  return authenticatedRequest('/home-offers/advertise-business', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
