import { apiRequest } from './api';
import { authenticatedRequest } from './auth';
export const getCatalog = () => apiRequest('/services/catalog');
export const getProfile = () => authenticatedRequest('/services/provider/profile');
export const saveProfile = (body) => authenticatedRequest('/services/provider/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const setAvailability = (isOnline) => authenticatedRequest('/services/provider/availability', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isOnline }) });
export const getAvailableJobs = () => authenticatedRequest('/services/provider/jobs/available');
export const getMyJobs = () => authenticatedRequest('/services/provider/jobs/my');
export const getJobDetails = (id) => authenticatedRequest(`/services/provider/jobs/${id}`);
export const acceptJob = (id) => authenticatedRequest(`/services/provider/jobs/${id}/accept`, { method: 'PATCH' });
export const updateJob = (id, status, completionOtp) => authenticatedRequest(`/services/provider/jobs/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, completionOtp }) });
export const requestRevisit = (id, reason) => authenticatedRequest(`/services/provider/jobs/${id}/revisit`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
export const submitServiceExtension = (id, payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  return authenticatedRequest(`/services/provider/jobs/${id}/extension`, { method: 'POST', body: form });
};
