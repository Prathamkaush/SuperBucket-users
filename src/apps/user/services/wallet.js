import { authenticatedRequest } from './auth';

export function getWallet() {
  return authenticatedRequest('/wallet/me');
}

export function addWalletCredit(amount) {
  return authenticatedRequest('/wallet/add-credit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, label: 'Money added to wallet' }),
  });
}
