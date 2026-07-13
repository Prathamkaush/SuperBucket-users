import { apiRequest, getUploadUrl } from './api';
import { authenticatedRequest } from './auth';

export async function getHomeOffers() {
  const offers = await apiRequest('/home-offers');
  return offers.map((offer) => ({
    ...offer,
    imageUrl: getUploadUrl('business-ads', offer.imageUrl),
  }));
}

export function submitBusinessAd(payload) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  return authenticatedRequest('/home-offers/advertise-business', {
    method: 'POST',
    body: form,
  });
}

export function getBusinessAdPlans() {
  return apiRequest('/home-offers/business-ad-plans');
}

export function getMyBusinessAds() {
  return authenticatedRequest('/home-offers/business-ads/my');
}

export function updateBusinessAd(id, payload) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  return authenticatedRequest(`/home-offers/business-ads/${id}`, { method: 'PATCH', body: form });
}

export function deleteBusinessAd(id) {
  return authenticatedRequest(`/home-offers/business-ads/${id}`, { method: 'DELETE' });
}

export function payBusinessAdWithWallet(id) {
  return authenticatedRequest(`/home-offers/business-ads/${id}/pay/wallet`, { method: 'POST' });
}

export function createBusinessAdRazorpayOrder(id) {
  return authenticatedRequest(`/home-offers/business-ads/${id}/pay/razorpay/create`, { method: 'POST' });
}

export function verifyBusinessAdRazorpayPayment(id, payload) {
  return authenticatedRequest(`/home-offers/business-ads/${id}/pay/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function registerBusinessAdClick(id) {
  return apiRequest(`/home-offers/business-ads/${id}/click`, { method: 'POST' });
}
