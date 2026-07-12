import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import CartIconButton from '../components/CartIconButton';
import { useCartCount } from '../context/CartContext';
import { addCartItem } from '../services/cart';
import { getProduct, getProducts } from '../services/products';
import { createProductReview, getProductReviews } from '../services/reviews';

export default function ProductDetailScreen({ route, navigation }) {
  const { refreshCartCount } = useCartCount();
  const productId = route.params?.productId || route.params?.product?.id;
  const [product, setProduct] = useState(route.params?.product || null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState(
    route.params?.product?.variants?.find((variant) => variant.isDefault)?.id ||
      route.params?.product?.variants?.[0]?.id ||
      null,
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getProduct(productId)
      .then(async (response) => {
        if (!active) return;
        setProduct(response);
        const defaultVariant =
          response.variants.find((variant) => variant.isDefault) ||
          response.variants[0];
        setSelectedVariantId(defaultVariant?.id || null);
        setSelectedSizeId(response.sizes?.[0]?.id || null);
        const [reviewData, relatedData] = await Promise.all([
          getProductReviews(response.id).catch(() => ({ reviews: [] })),
          response.categoryId
            ? getProducts({ page: 1, limit: 8, categoryId: response.categoryId, stock: 'in' }).catch(() => ({ products: [] }))
            : Promise.resolve({ products: [] }),
        ]);
        if (!active) return;
        setReviews(reviewData.reviews || []);
        setRelatedProducts((relatedData.products || []).filter((item) => item.id !== response.id).slice(0, 6));
      })
      .catch((loadError) => {
        if (active) setError(loadError?.message || 'Unable to load product');
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [productId]);

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find((variant) => variant.id === selectedVariantId) ||
      product?.variants?.[0],
    [product, selectedVariantId],
  );
  const price = selectedVariant?.price ?? product?.price ?? 0;
  const mrp = selectedVariant?.mrp ?? product?.mrp ?? price;
  const stock = selectedVariant?.stock ?? product?.stock ?? 0;
  const selectedSize = product?.sizes?.find((size) => size.id === selectedSizeId);
  const availableStock = selectedVariant?.stock ?? selectedSize?.stock ?? stock;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const images = product?.images?.length
    ? product.images
    : product?.imageUrl
      ? [product.imageUrl]
      : [];

  const handleAddToCart = async () => {
    if (adding || !availableStock) return;

    try {
      setAdding(true);
      await addCartItem({
        productId: product.id,
        variantId: selectedVariant?.id,
        sizeId: selectedVariant ? undefined : selectedSize?.id,
        quantity,
      });
      await refreshCartCount();
      navigation.navigate('MainTabs', { screen: 'Cart' });
    } catch (addError) {
      Alert.alert('Could not add to cart', addError?.message || 'Please try again');
    } finally {
      setAdding(false);
    }
  };

  const submitReview = async () => {
    if (!reviewRating || submittingReview) {
      if (!reviewRating) Alert.alert('Choose a rating', 'Select between 1 and 5 stars.');
      return;
    }
    try {
      setSubmittingReview(true);
      await createProductReview(product.id, reviewRating, reviewComment);
      setReviewRating(0);
      setReviewComment('');
      Alert.alert('Review submitted', 'Your review will appear after approval.');
    } catch (reviewError) {
      Alert.alert('Could not submit review', reviewError?.message || 'Please try again');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !product) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.stateText}>Loading product...</Text>
      </View>
    );
  }

  if (!product || error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorTitle}>Product unavailable</Text>
        <Text style={styles.stateText}>{error || 'This product could not be found.'}</Text>
        <TouchableOpacity style={styles.backAction} onPress={() => navigation.goBack()}>
          <Text style={styles.backActionText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Product Details</Text>
        <CartIconButton navigation={navigation} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {images[selectedImage] ? (
            <Image
              source={{ uri: images[selectedImage] }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.imageFallback}>{product.name.charAt(0)}</Text>
          )}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {images.map((image, index) => (
              <TouchableOpacity
                key={image}
                onPress={() => setSelectedImage(index)}
                style={[
                  styles.thumbnail,
                  selectedImage === index && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.card}>
          {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
          <Text style={styles.productName}>{product.name}</Text>
          {product.reviewCount > 0 ? (
            <View style={styles.productRatingRow}>
              <Text style={styles.productRatingScore}>★ {product.averageRating.toFixed(1)}</Text>
              <Text style={styles.productRatingCount}>{product.reviewCount} ratings</Text>
            </View>
          ) : null}
          {product.shortDescription ? (
            <Text style={styles.description}>{product.shortDescription}</Text>
          ) : null}

          {product.variants.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.sectionLabel}>Choose variant</Text>
              <View style={styles.variantGrid}>
                {product.variants.map((variant) => {
                  const selected = variant.id === selectedVariant?.id;
                  return (
                    <TouchableOpacity
                      key={variant.id}
                      onPress={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      style={[
                        styles.variantOption,
                        selected && styles.variantOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.variantName,
                          selected && styles.variantNameActive,
                        ]}
                      >
                        {variant.label}
                      </Text>
                      <Text style={styles.variantPrice}>
                        Rs {variant.price.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {selectedVariant?.attributes?.length > 0 && (
            <View style={styles.attributeRow}>
              {selectedVariant.attributes.map((attribute) => (
                <View key={`${attribute.name}-${attribute.value}`} style={styles.attributeChip}>
                  <Text style={styles.attributeName}>{attribute.name}</Text>
                  <Text style={styles.attributeValue}>{attribute.value}</Text>
                </View>
              ))}
            </View>
          )}

          {product.sizes?.length > 0 && !selectedVariant ? (
            <View style={styles.variantSection}>
              <Text style={styles.sectionLabel}>Choose size</Text>
              <View style={styles.variantGrid}>
                {product.sizes.map((size) => {
                  const selected = size.id === selectedSizeId;
                  return (
                    <TouchableOpacity
                      key={size.id}
                      onPress={() => {
                        setSelectedSizeId(size.id);
                        setQuantity(1);
                      }}
                      style={[
                        styles.variantOption,
                        selected && styles.variantOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.variantName,
                          selected && styles.variantNameActive,
                        ]}
                      >
                        {size.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.priceRow}>
            <View>
              <View style={styles.priceLine}>
                <Text style={styles.price}>Rs {price.toLocaleString()}</Text>
                {discountPercent ? <Text style={styles.discountPill}>{discountPercent}% OFF</Text> : null}
              </View>
              {mrp > price && (
                <Text style={styles.mrp}>MRP Rs {mrp.toLocaleString()}</Text>
              )}
              <Text style={styles.taxCopy}>Inclusive of all taxes</Text>
              <Text style={[styles.stock, !stock && styles.outOfStock]}>
                {availableStock ? `${availableStock} available` : 'Out of stock'}
              </Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() =>
                  setQuantity((value) => Math.min(availableStock || 1, value + 1))
                }
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.trustStrip}>
          <TrustItem icon="shield" label="Authentic" sub="Quality checked" />
          <View style={styles.trustDivider} />
          <TrustItem icon="truck" label="Fast delivery" sub="Tracked order" />
          <View style={styles.trustDivider} />
          <TrustItem icon="refresh-cw" label="Support" sub="Easy assistance" />
        </View>

        {product.description ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.bodyText}>{product.description}</Text>
          </View>
        ) : null}

        {product.specifications.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Specifications</Text>
            {product.specifications.map((specification) => (
              <View
                key={`${specification.name}-${specification.value}`}
                style={styles.infoRow}
              >
                <Text style={styles.infoLabel}>{specification.name}</Text>
                <Text style={styles.infoValue}>{specification.value}</Text>
              </View>
            ))}
          </View>
        )}

        {(product.warranty ||
          product.shelfLife ||
          product.storageInstructions ||
          product.countryOfOrigin) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Additional details</Text>
            {[
              ['Warranty', product.warranty],
              ['Shelf life', product.shelfLife],
              ['Storage', product.storageInstructions],
              ['Country of origin', product.countryOfOrigin],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <View key={label} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value}</Text>
                </View>
              ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Write a product review</Text>
          <Text style={styles.reviewHelp}>Only customers who received this product can submit a review.</Text>
          <View style={styles.reviewStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setReviewRating(star)} accessibilityLabel={`${star} stars`}>
                <Text style={[styles.reviewStar, star <= reviewRating && styles.reviewStarActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.reviewInput}
            value={reviewComment}
            onChangeText={setReviewComment}
            placeholder="What did you like or dislike?"
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <TouchableOpacity style={[styles.reviewSubmit, submittingReview && styles.addButtonDisabled]} disabled={submittingReview} onPress={submitReview}>
            {submittingReview ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.reviewSubmitText}>Submit review</Text>}
          </TouchableOpacity>
        </View>

        {reviews.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer reviews</Text>
            {reviews.slice(0, 5).map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewItemHeader}>
                  <Text style={styles.reviewerName}>{review.user?.name || 'Verified customer'}</Text>
                  <Text style={styles.reviewItemStars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text>
                </View>
                {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                <Text style={styles.verifiedPurchase}>Verified purchase</Text>
              </View>
            ))}
          </View>
        ) : null}

        {relatedProducts.length > 0 ? (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>More products you may like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
              {relatedProducts.map((item) => (
                <TouchableOpacity key={item.id} style={styles.relatedCard} activeOpacity={0.86} onPress={() => navigation.push('ProductDetail', { productId: item.id, product: item })}>
                  <View style={styles.relatedImageBox}>
                    {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.relatedImage} resizeMode="contain" /> : <Text style={styles.relatedFallback}>{item.name.charAt(0)}</Text>}
                  </View>
                  <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                  {item.reviewCount > 0 ? <Text style={styles.relatedRating}>★ {item.averageRating.toFixed(1)} ({item.reviewCount})</Text> : null}
                  <Text style={styles.relatedPrice}>Rs {item.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            Rs {(price * quantity).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          disabled={!availableStock || adding}
          style={[
            styles.addButton,
            (!availableStock || adding) && styles.addButtonDisabled,
          ]}
          onPress={handleAddToCart}
        >
          {adding ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.addButtonText}>
              {availableStock ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TrustItem({ icon, label, sub }) {
  return (
    <View style={styles.trustItem}>
      <View style={styles.trustIcon}><Feather name={icon} size={16} color="#111827" /></View>
      <Text style={styles.trustLabel}>{label}</Text>
      <Text style={styles.trustSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F2' },
  header: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { flex: 1, color: '#111827', fontSize: FontSize.md, fontWeight: '800', textAlign: 'center', letterSpacing: 0.2 },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 14, paddingBottom: 145 },
  hero: {
    height: 365,
    borderRadius: 24,
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  mainImage: { width: '90%', height: '90%' },
  imageFallback: { color: Colors.secondary, fontSize: 80, fontWeight: '900' },
  categoryPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(17,24,39,0.90)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
  thumbnailRow: { gap: 10, paddingVertical: 14, paddingHorizontal: 2 },
  thumbnail: {
    width: 66,
    height: 66,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.10)',
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  thumbnailActive: { borderColor: '#111827', borderWidth: 2 },
  thumbnailImage: { width: '100%', height: '100%' },
  card: {
    marginTop: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  brand: { color: Colors.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.3 },
  productName: { marginTop: 7, color: '#111827', fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6 },
  productRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  productRatingScore: { color: '#92400E', backgroundColor: '#FEF3C7', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, fontSize: FontSize.xs, fontWeight: '900' },
  productRatingCount: { color: Colors.textMuted, fontSize: FontSize.xs },
  description: { marginTop: 11, color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 21 },
  variantSection: { marginTop: 20 },
  sectionLabel: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900', marginBottom: 10 },
  variantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantOption: {
    minWidth: 92,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#FAFAF8',
  },
  variantOptionActive: { borderColor: '#111827', backgroundColor: '#111827' },
  variantName: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '900' },
  variantNameActive: { color: Colors.white },
  variantPrice: { marginTop: 2, color: Colors.textMuted, fontSize: 10, fontWeight: '700' },
  attributeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  attributeChip: { borderRadius: Radius.sm, backgroundColor: Colors.gray100, paddingHorizontal: 10, paddingVertical: 7 },
  attributeName: { color: Colors.textMuted, fontSize: 9, fontWeight: '700' },
  attributeValue: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '900' },
  priceRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  price: { color: '#111827', fontSize: 28, fontWeight: '900', letterSpacing: -0.7 },
  discountPill: { color: '#047857', backgroundColor: '#D1FAE5', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '900' },
  mrp: { color: Colors.textMuted, fontSize: FontSize.xs, textDecorationLine: 'line-through' },
  taxCopy: { color: Colors.textMuted, fontSize: 10, marginTop: 4 },
  stock: { marginTop: 3, color: Colors.success, fontSize: FontSize.xs, fontWeight: '800' },
  outOfStock: { color: Colors.danger },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, padding: 5 },
  quantityButton: { width: 34, height: 34, borderRadius: Radius.sm, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '900' },
  quantity: { minWidth: 22, textAlign: 'center', color: Colors.primary, fontWeight: '900' },
  cardTitle: { marginBottom: 10, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  bodyText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 21 },
  trustStrip: { marginTop: 14, flexDirection: 'row', alignItems: 'stretch', borderRadius: 18, backgroundColor: Colors.white, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)' },
  trustItem: { flex: 1, alignItems: 'center', paddingHorizontal: 5 },
  trustIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  trustLabel: { marginTop: 7, color: '#111827', fontSize: 10, fontWeight: '900', textAlign: 'center' },
  trustSub: { marginTop: 2, color: Colors.textMuted, fontSize: 8, textAlign: 'center' },
  trustDivider: { width: 1, backgroundColor: 'rgba(15,23,42,0.08)' },
  reviewHelp: { color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 18 },
  reviewStars: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  reviewStar: { color: Colors.gray300, fontSize: 34 },
  reviewStarActive: { color: Colors.warning },
  reviewInput: { minHeight: 90, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, color: Colors.textPrimary, backgroundColor: Colors.background },
  reviewSubmit: { marginTop: 12, borderRadius: Radius.md, backgroundColor: Colors.primary, paddingVertical: 12, alignItems: 'center' },
  reviewSubmitText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
  reviewItem: { paddingVertical: 13, borderTopWidth: 1, borderTopColor: Colors.border },
  reviewItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  reviewerName: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800' },
  reviewItemStars: { color: Colors.warning, fontSize: FontSize.sm },
  reviewComment: { marginTop: 7, color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 },
  verifiedPurchase: { marginTop: 6, color: Colors.success, fontSize: 10, fontWeight: '800' },
  relatedSection: { marginTop: Spacing.lg },
  relatedTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900', marginBottom: 12 },
  relatedRow: { gap: 12, paddingBottom: 4 },
  relatedCard: { width: 166, padding: 0, paddingBottom: 13, borderRadius: 18, overflow: 'hidden', backgroundColor: Colors.white, borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)', ...Shadow.sm },
  relatedImageBox: { height: 132, backgroundColor: '#FAFAF8', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  relatedImage: { width: '88%', height: '88%' },
  relatedFallback: { color: Colors.secondary, fontSize: 38, fontWeight: '900' },
  relatedName: { minHeight: 40, marginTop: 11, marginHorizontal: 12, color: '#111827', fontSize: FontSize.sm, lineHeight: 19, fontWeight: '800' },
  relatedRating: { marginTop: 4, marginHorizontal: 12, color: '#92400E', fontSize: 10, fontWeight: '800' },
  relatedPrice: { marginTop: 8, marginHorizontal: 12, color: '#111827', fontSize: FontSize.md, fontWeight: '900' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  infoLabel: { flex: 1, color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '700' },
  infoValue: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800', textAlign: 'right' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: Spacing.lg,
    paddingTop: 13,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  totalPrice: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  addButton: { minWidth: 175, borderRadius: 14, backgroundColor: '#111827', paddingHorizontal: 28, paddingVertical: 15, alignItems: 'center' },
  addButtonDisabled: { backgroundColor: Colors.gray400 },
  addButtonText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.xxl },
  stateText: { marginTop: 10, color: Colors.textMuted, textAlign: 'center' },
  errorTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  backAction: { marginTop: 16, borderRadius: Radius.full, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10 },
  backActionText: { color: Colors.white, fontWeight: '800' },
});
