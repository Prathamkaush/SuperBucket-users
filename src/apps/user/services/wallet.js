import { authenticatedRequest } from './auth';

export function getWallet() {
  return authenticatedRequest('/wallet/me');
}

export function createWalletTopupOrder(amount) {
  return authenticatedRequest('/wallet/topup/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
    timeoutMs: 20000,
  });
}

export function verifyWalletTopupPayment(payload) {
  return authenticatedRequest('/wallet/topup/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeoutMs: 30000,
  });
}
