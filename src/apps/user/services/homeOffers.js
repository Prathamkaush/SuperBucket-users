import { apiRequest } from './api';

export function getHomeOffers() {
  return apiRequest('/home-offers');
}
