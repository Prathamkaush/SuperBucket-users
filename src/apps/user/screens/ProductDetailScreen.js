import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { addCartItem } from '../services/cart';
import { getProduct } from '../services/products';

export default function ProductDetailScreen({ route, navigation }) {
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

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getProduct(productId)
      .then((response) => {
        if (!active) return;
        setProduct(response);
        const defaultVariant =
          response.variants.find((variant) => variant.isDefault) ||
          response.variants[0];
        setSelectedVariantId(defaultVariant?.id || null);
        setSelectedSizeId(response.sizes?.[0]?.id || null);
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
      navigation.navigate('MainTabs', { screen: 'Cart' });
    } catch (addError) {
      Alert.alert('Could not add to cart', addError?.message || 'Please try again');
    } finally {
      setAdding(false);
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
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
          style={styles.cartButton}
        >
          <Text style={styles.cartButtonText}>Cart</Text>
        </TouchableOpacity>
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
              <Text style={styles.price}>Rs {price.toLocaleString()}</Text>
              {mrp > price && (
                <Text style={styles.mrp}>MRP Rs {mrp.toLocaleString()}</Text>
              )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  cartButton: {
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#F3B9BE',
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  cartButtonText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '800' },
  content: { padding: Spacing.lg, paddingBottom: 130 },
  hero: {
    height: 300,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.md,
  },
  mainImage: { width: '100%', height: '100%' },
  imageFallback: { color: Colors.secondary, fontSize: 80, fontWeight: '900' },
  categoryPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
  thumbnailRow: { gap: 10, paddingVertical: 12 },
  thumbnail: {
    width: 66,
    height: 66,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  thumbnailActive: { borderColor: Colors.primary },
  thumbnailImage: { width: '100%', height: '100%' },
  card: {
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  brand: { color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
  productName: { marginTop: 3, color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '900' },
  description: { marginTop: 7, color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 },
  variantSection: { marginTop: 20 },
  sectionLabel: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900', marginBottom: 10 },
  variantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantOption: {
    minWidth: 92,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  variantOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  variantName: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '900' },
  variantNameActive: { color: Colors.primary },
  variantPrice: { marginTop: 2, color: Colors.textMuted, fontSize: 10, fontWeight: '700' },
  attributeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  attributeChip: { borderRadius: Radius.sm, backgroundColor: Colors.gray100, paddingHorizontal: 10, paddingVertical: 7 },
  attributeName: { color: Colors.textMuted, fontSize: 9, fontWeight: '700' },
  attributeValue: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '900' },
  priceRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: Colors.primary, fontSize: FontSize.xxl, fontWeight: '900' },
  mrp: { color: Colors.textMuted, fontSize: FontSize.xs, textDecorationLine: 'line-through' },
  stock: { marginTop: 3, color: Colors.success, fontSize: FontSize.xs, fontWeight: '800' },
  outOfStock: { color: Colors.danger },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, padding: 5 },
  quantityButton: { width: 34, height: 34, borderRadius: Radius.sm, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  quantityButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '900' },
  quantity: { minWidth: 22, textAlign: 'center', color: Colors.primary, fontWeight: '900' },
  cardTitle: { marginBottom: 10, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  bodyText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 21 },
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
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  totalPrice: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  addButton: { borderRadius: Radius.md, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14 },
  addButtonDisabled: { backgroundColor: Colors.gray400 },
  addButtonText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.xxl },
  stateText: { marginTop: 10, color: Colors.textMuted, textAlign: 'center' },
  errorTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  backAction: { marginTop: 16, borderRadius: Radius.full, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10 },
  backActionText: { color: Colors.white, fontWeight: '800' },
});
