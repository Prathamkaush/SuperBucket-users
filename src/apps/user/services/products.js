import { apiRequest, getUploadUrl } from './api';

function mapVariant(variant) {
  const attributes = Array.isArray(variant.attributes)
    ? variant.attributes
    : [];

  return {
    id: variant.id,
    label:
      variant.name ||
      attributes.map((attribute) => attribute.value).filter(Boolean).join(' / ') ||
      variant.weightLabel ||
      variant.flavour ||
      'Default',
    name: variant.name,
    sku: variant.sku,
    barcode: variant.barcode,
    attributes,
    price: Number(variant.price || 0),
    mrp: Number(variant.mrp || variant.price || 0),
    stock: Number(variant.stock || 0),
    isDefault: Boolean(variant.isDefault),
    imageUrl: getUploadUrl('products', variant.image1),
  };
}

export function mapProduct(product) {
  const variants = (Array.isArray(product.variants) ? product.variants : []).map(
    mapVariant,
  );
  const defaultVariant =
    variants.find((variant) => variant.isDefault) || variants[0];
  const images = [product.img1, product.img2, product.img3, product.img4]
    .filter(Boolean)
    .map((fileName) => getUploadUrl('products', fileName));

  return {
    id: product.id,
    slug: product.slug,
    name: product.title,
    title: product.title,
    brand: product.brandName,
    description: product.description,
    shortDescription: product.shortDescription,
    category: product.category?.name || 'Product',
    categoryId: product.categoryId,
    type: product.type?.name || null,
    typeId: product.typeId,
    price: defaultVariant?.price ?? Number(product.finalPrice || product.price || 0),
    mrp: defaultVariant?.mrp ?? Number(product.price || 0),
    stock: Number(product.stock || 0),
    imageUrl: images[0] || null,
    images,
    variants,
    sizes: (Array.isArray(product.sizes) ? product.sizes : []).map((size) => ({
      id: size.id,
      label: size.size,
      stock: Number(size.stock || 0),
    })),
    specifications: Array.isArray(product.specifications)
      ? product.specifications
      : [],
    warranty: product.warranty,
    shelfLife: product.shelfLife,
    storageInstructions: product.storageInstructions,
    countryOfOrigin: product.countryOfOrigin,
    freeShipping: Boolean(product.freeShipping),
    isTrending: Boolean(product.isTrending),
    averageRating: Number(product.averageRating || 0),
    reviewCount: Number(product.reviewCount || 0),
  };
}

export async function getProducts(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  const response = await apiRequest(`/products${query ? `?${query}` : ''}`);

  return {
    ...response,
    products: (response?.products || []).map(mapProduct),
  };
}

export async function getProduct(identifier) {
  return mapProduct(await apiRequest(`/products/${identifier}`));
}

export async function getProductTypes(categoryId) {
  const query = categoryId ? `?categoryId=${categoryId}` : '';
  const response = await apiRequest(`/product-types${query}`);
  return Array.isArray(response) ? response : response ? [response] : [];
}
