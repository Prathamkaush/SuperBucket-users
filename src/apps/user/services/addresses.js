import { authenticatedRequest } from './auth';

export function getAddresses() {
  return authenticatedRequest('/addresses');
}

export function createAddress(address) {
  return authenticatedRequest('/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  }).then(res => {
    console.log('createAddress response:', JSON.stringify(res));
    return res;
  }).catch(err => {
    console.error('createAddress error:', err?.message, err?.status, err);
    throw err;
  });
}

export function setDefaultAddress(addressId) {
  return authenticatedRequest(`/addresses/${addressId}/default`, {
    method: 'PUT',
  });
}

export function updateAddress(addressId, address) {
  return authenticatedRequest(`/addresses/${addressId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  }).then(res => {
    console.log('updateAddress response:', JSON.stringify(res));
    return res;
  }).catch(err => {
    console.error('updateAddress error:', err?.message, err?.status, err);
    throw err;
  });
}

export function deleteAddress(addressId) {
  return authenticatedRequest(`/addresses/${addressId}`, {
    method: 'DELETE',
  });
}
