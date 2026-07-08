import { authenticatedRequest } from './auth';

export function getMyOrders(page = 1, limit = 20) {
  return authenticatedRequest(`/orders/my?page=${page}&limit=${limit}`);
}

export function getMyOrder(orderId) {
  return authenticatedRequest(`/orders/my/${orderId}`);
}

export function reorderOrder(orderId) {
  return authenticatedRequest(`/orders/${orderId}/reorder`, {
    method: 'POST',
    timeoutMs: 20000,
  });
}

export function placeOrder({
  addressId,
  address,
  paymentMethod = 'COD',
  couponCode,
  deliveryMode,
  scheduledDeliveryAt,
  deliverySlotLabel,
}) {
  return authenticatedRequest('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addressId,
      address,
      paymentMethod,
      couponCode,
      deliveryMode,
      scheduledDeliveryAt,
      deliverySlotLabel,
    }),
    timeoutMs: 20000,
  });
}

export function previewOrder({
  addressId,
  address,
  paymentMethod = 'COD',
  couponCode,
}) {
  return authenticatedRequest('/orders/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addressId,
      address,
      paymentMethod,
      couponCode,
    }),
    timeoutMs: 20000,
  });
}
