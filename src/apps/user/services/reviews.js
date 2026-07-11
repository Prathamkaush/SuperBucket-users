import { apiRequest } from './api';
import { authenticatedRequest } from './auth';

export function getProductReviews(productId) {
  return apiRequest(`/reviews/product/${productId}`);
}

export function createProductReview(productId, rating, comment) {
  return authenticatedRequest('/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, rating, comment: comment.trim() || undefined }),
  });
}
