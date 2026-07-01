import { authenticatedRequest } from './auth';

export function createRazorpayOrder(amount) {
  return authenticatedRequest('/payments/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
    timeoutMs: 20000,
  });
}

export function verifyRazorpayPayment(payload) {
  return authenticatedRequest('/payments/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeoutMs: 30000,
  });
}
