import { apiRequest } from './api';
import { authenticatedRequest } from './auth';

export function getLiveProperties(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.mode) query.append('mode', params.mode);
  if (params.search) query.append('search', params.search);
  if (params.pincode) query.append('pincode', params.pincode);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  return apiRequest(`/properties?${query.toString()}`);
}

export function getPropertyDetail(id) {
  return apiRequest(`/properties/${id}`);
}

export function submitInquiry(propertyId, message, visitTime = null) {
  return authenticatedRequest(`/properties/${propertyId}/inquire`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, visitTime }),
  });
}
