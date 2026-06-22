import { apiRequest } from './api';
import { authenticatedRequest } from './auth';

export function getServiceCatalog() {
  return apiRequest('/services/catalog');
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

export function reviewServiceBooking(id, rating, review) {
  return authenticatedRequest(`/services/bookings/${id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, review }),
  });
}
