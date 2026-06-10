import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const FALLBACK_PRODUCT = {
  name: 'Superbuket Product',
  qty: '1 unit',
  price: 0,
  category: 'Essentials',
  delivery: 'Today',
  icon: '',
};

export default function ProductDetailScreen({ route, navigation }) {
  const product = { ...FALLBACK_PRODUCT, ...(route?.params?.product || {}) };
  const initialVariant = product.selectedVariant || product.variants?.[0]?.label || product.qty;
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const openCart = () => navigation.navigate('MainTabs', { screen: 'Cart' });

  const activeVariant = product.variants?.find((variant) => variant.label === selectedVariant);
  const unitPrice = activeVariant?.price ?? product.price;
  const total = unitPrice * quantity;
  const highlights = [
    'Quality checked before dispatch',
    'Fast local delivery',
    'Easy replacement support',
  ];
  const related = [
    { label: 'Same category', value: product.category || 'Essentials' },
    { label: 'Delivery', value: product.delivery || 'Today' },
    { label: product.variantType || 'Pack size', value: selectedVariant || product.qty || '1 unit' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={openCart} style={styles.cartBtn}>
          <Text style={styles.cartText}>Cart</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.productArt}>
            <Text style={styles.productIcon}>{product.icon}</Text>
          </View>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productQty}>{selectedVariant || product.qty}</Text>

          {product.variants?.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantLabel}>Select {product.variantType || 'Pack size'}</Text>
              <View style={styles.variantOptions}>
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant === variant.label;
                  return (
                    <TouchableOpacity
                      key={variant.label}
                      style={[styles.variantOption, isSelected && styles.variantOptionActive]}
                      onPress={() => setSelectedVariant(variant.label)}
                    >
                      {variant.color && (
                        <View style={[styles.colorSwatch, { backgroundColor: variant.color }]} />
                      )}
                      <Text style={[styles.variantOptionText, isSelected && styles.variantOptionTextActive]}>
                        {variant.label}
                      </Text>
                      {variant.price != null && (
                        <Text style={[styles.variantPrice, isSelected && styles.variantOptionTextActive]}>
                          Rs {variant.price}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>Rs {unitPrice}</Text>
            </View>
            <View style={styles.qtyControl}>
              <TouchableOpacity
                onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity((value) => value + 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Info</Text>
          {related.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why order this</Text>
          {highlights.map((item) => (
            <View key={item} style={styles.highlightRow}>
              <View style={styles.dot} />
              <Text style={styles.highlightText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>Rs {total}</Text>
        </View>
        <TouchableOpacity style={styles.addCartBtn} onPress={openCart}>
          <Text style={styles.addCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: { flex: 1, color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },
  cartBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  cartText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  hero: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 230,
    justifyContent: 'center',
    ...Shadow.md,
  },
  productArt: {
    height: 170,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productIcon: { fontSize: 72 },
  categoryPill: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
  infoBlock: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadow.sm,
  },
  productName: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: '900' },
  productQty: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  variantSection: { marginTop: 18 },
  variantLabel: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800', marginBottom: 9 },
  variantOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantOption: {
    minWidth: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: Colors.white,
  },
  variantOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  variantOptionText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '800' },
  variantOptionTextActive: { color: Colors.primary },
  variantPrice: { color: Colors.textMuted, fontSize: 10, fontWeight: '700' },
  colorSwatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  priceRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700' },
  price: { fontSize: FontSize.xxl, color: Colors.primary, fontWeight: '900', marginTop: 2 },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: 5,
    gap: 10,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '900' },
  qtyText: { minWidth: 24, textAlign: 'center', color: Colors.primary, fontWeight: '900' },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: '900', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '700' },
  infoValue: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800' },
  highlightRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.secondary, marginRight: 10 },
  highlightText: { flex: 1, color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  totalPrice: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  addCartBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 28,
    paddingVertical: 14,
    ...Shadow.redGlow,
  },
  addCartText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
});
