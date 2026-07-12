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
