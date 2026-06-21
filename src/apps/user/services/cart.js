import { getUploadUrl } from './api';
import { authenticatedRequest } from './auth';

function mapCartItem(item) {
  return {
    ...item,
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
    gstRate: Number(item.gstRate || 0),
    gstAmount: Number(item.gstAmount || 0),
    imageUrl: item.variant?.image1
      ? getUploadUrl('products', item.variant.image1)
      : getUploadUrl('products', item.product?.img1),
    name: item.product?.title || 'Product',
    option:
      item.variant?.name ||
      item.variant?.weightLabel ||
      item.variant?.flavour ||
      item.size?.size ||
      null,
  };
}

export async function getCart() {
  const response = await authenticatedRequest('/cart');
  return (response?.items || []).map(mapCartItem);
}

export function addCartItem({ productId, variantId, sizeId, quantity = 1 }) {
  return authenticatedRequest('/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, variantId, sizeId, quantity }),
  });
}

export function updateCartItem(itemId, quantity) {
  return authenticatedRequest(`/cart/${itemId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId) {
  return authenticatedRequest(`/cart/${itemId}`, {
    method: 'DELETE',
  });
}
