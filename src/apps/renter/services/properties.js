import { authenticatedRequest } from './auth';

export function normalizeSpace(item) {
  if (!item) return null;
  if ('location' in item) return item;
  return {
    ...item,
    status: item.status === 'LIVE' ? 'Live' : (item.status === 'REVIEW' ? 'Review' : 'Draft'),
    location: item.address,
    priceLabel: item.mode === 'SELL' || item.mode === 'Sell'
      ? `Rs ${parseFloat(item.price).toLocaleString('en-IN')}`
      : `Rs ${parseFloat(item.price).toLocaleString('en-IN')}/mo`,
    verification: item.verification === 'VERIFIED' ? 'Verified' : (item.verification === 'DOCS_PENDING' ? 'Docs pending' : 'Not submitted'),
    leads: item._count?.leads || 0,
  };
}

export function getMyProperties() {
  return authenticatedRequest('/properties/my/listings');
}

export function getMyLeads() {
  return authenticatedRequest('/properties/my/leads');
}

export function createProperty(formData) {
  // Since it includes file uploads, it is sent as FormData
  return authenticatedRequest('/properties', {
    method: 'POST',
    body: formData,
  });
}

export function updateProperty(id, formData) {
  return authenticatedRequest(`/properties/${id}`, {
    method: 'PATCH',
    body: formData,
  });
}

export function deleteProperty(id) {
  return authenticatedRequest(`/properties/${id}`, {
    method: 'DELETE',
  });
}

export function advertiseProperty(id) {
  return authenticatedRequest(`/properties/${id}/advertise`, {
    method: 'PATCH',
  });
}


export function updateLeadStatus(leadId, status) {
  return authenticatedRequest(`/properties/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
