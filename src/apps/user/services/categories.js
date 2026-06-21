import { apiRequest, getUploadUrl } from './api';

export async function getCategories() {
  const categories = await apiRequest('/categories');

  return (Array.isArray(categories) ? categories : []).map((category) => ({
    ...category,
    imageUrl: getUploadUrl('categories', category.image),
  }));
}
