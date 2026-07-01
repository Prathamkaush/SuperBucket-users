import { authenticatedRequest, updateStoredUser } from './auth';

export async function getProfile() {
  const response = await authenticatedRequest('/users/profile');
  return response.user;
}

export async function getProfileStats() {
  const response = await authenticatedRequest('/orders/my?page=1&limit=1');
  return {
    orders: Number(response?.total || 0),
  };
}

export async function saveProfile(formData) {
  const response = await authenticatedRequest('/users/profile', {
    method: 'PATCH',
    body: formData,
  });
  await updateStoredUser(response.user);
  return response;
}

export async function saveBankDetails(bankAccountNumber, bankIfsc, bankAccountName) {
  const response = await authenticatedRequest('/users/bank', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bankAccountNumber, bankIfsc, bankAccountName }),
  });
  await updateStoredUser(response.user);
  return response;
}
