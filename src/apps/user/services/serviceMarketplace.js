import { apiRequest } from './api';
import { authenticatedRequest } from './auth';

export function getServiceCatalog() {
  return apiRequest('/services/catalog');
}

export function getServiceProviders({ categoryId, page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams();
  if (categoryId) query.set('categoryId', String(categoryId));
  query.set('page', String(page));
  query.set('limit', String(limit));
  return apiRequest(`/services/providers?${query.toString()}`);
}

export function createServiceBooking(payload) {
  return authenticatedRequest('/services/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getMyServiceBookings() {
  return authenticatedRequest('/services/bookings/my');
}

export function cancelServiceBooking(id, reason) {
  return authenticatedRequest(`/services/bookings/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}

export function acceptServiceRevisit(id, scheduledAt) {
  return authenticatedRequest(`/services/bookings/${id}/revisit/accept`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduledAt }),
  });
}

export function reviewServiceBooking(id, rating, review) {
  return authenticatedRequest(`/services/bookings/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, review }),
  });
}
