import { apiRequest } from './api';

export function submitContact(payload) {
  return apiRequest('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
