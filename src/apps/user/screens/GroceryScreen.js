import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import CartIconButton from '../components/CartIconButton';

const CATEGORIES = ['All', 'Rice & Atta', 'Oils', 'Snacks', 'Cleaning', 'Personal Care', 'Beverages', 'Dairy'];
const PRODUCTS = [
  { id: '1', name: 'Fortune Sunflower Oil', category: 'Oils', icon: '🫙', variants: [{ label: '500ml', price: 78 }, { label: '1L', price: 145 }, { label: '2L', price: 280 }] },
  { id: '2', name: 'Aashirvaad Atta', category: 'Rice & Atta', icon: '🌾', variants: [{ label: '1kg', price: 58 }, { label: '5kg', price: 265 }, { label: '10kg', price: 510 }] },
  { id: '3', name: 'Haldiram Bhujia', category: 'Snacks', icon: '🥜', variants: [{ label: '200g', price: 60 }, { label: '400g', price: 112 }, { label: '1kg', price: 260 }] },
  { id: '4', name: 'Surf Excel Detergent', category: 'Cleaning', icon: '🧺', variants: [{ label: '500g', price: 105 }, { label: '1kg', price: 195 }, { label: '2kg', price: 375 }] },
  { id: '5', name: 'Dove Body Wash', category: 'Personal Care', icon: '🧴', variants: [{ label: '250ml', price: 220 }, { label: '500ml', price: 399 }] },
  { id: '6', name: 'Tata Tea Gold', category: 'Beverages', icon: '🍵', variants: [{ label: '250g', price: 145 }, { label: '500g', price: 280 }, { label: '1kg', price: 545 }] },
  { id: '7', name: 'Amul Full Cream Milk', category: 'Dairy', icon: '🥛', variants: [{ label: '500ml', price: 34 }, { label: '1L', price: 68 }] },
  { id: '8', name: 'Basmati Rice', category: 'Rice & Atta', icon: '🍚', variants: [{ label: '1kg', price: 98 }, { label: '5kg', price: 450 }, { label: '10kg', price: 870 }] },
  { id: '9', name: "Lay's Magic Masala", category: 'Snacks', icon: '🍟', variants: [{ label: '26g', price: 20 }, { label: '52g', price: 40 }, { label: '90g', price: 50 }] },
  { id: '10', name: 'Dettol Hand Wash', category: 'Cleaning', icon: '🧼', variants: [{ label: '200ml', price: 55 }, { label: '500ml', price: 115 }, { label: '1L', price: 210 }] },
];

export default function GroceryScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({});
  const [selectedVariants, setSelectedVariants] = useState(() =>
    Object.fromEntries(PRODUCTS.map((product) => [product.id, product.variants[0].label]))
  );

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getSelectedVariant = (product) =>
    product.variants.find((variant) => variant.label === selectedVariants[product.id])
    || product.variants[0];
  const getCartKey = (product) => `${product.id}:${getSelectedVariant(product).label}`;

  const addToCart = (product) => {
    const key = getCartKey(product);
    setCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };
  const removeFromCart = (product) => {
    const key = getCartKey(product);
    setCart((prev) => {
    const next = { ...prev };
      if (next[key] > 1) next[key]--;
      else delete next[key];
    return next;
    });
  };

  const cartTotal = Object.entries(cart).reduce((sum, [key, quantity]) => {
    const [productId, variantLabel] = key.split(':');
    const product = PRODUCTS.find((item) => item.id === productId);
    const variant = product?.variants.find((item) => item.label === variantLabel);
    return sum + (variant ? variant.price * quantity : 0);
  }, 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Groceries</Text>
        <CartIconButton navigation={navigation} />
      </View>

      <View style={styles.searchContainer}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ fontSize: 16, color: Colors.textMuted }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, activeCategory === cat && styles.tabActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.tabText, activeCategory === cat && { color: Colors.white }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100, gap: 10 }}
        renderItem={({ item }) => {
          const selectedVariant = getSelectedVariant(item);
          const cartKey = getCartKey(item);

          return (
          <TouchableOpacity
            style={styles.productCard}
            activeOpacity={0.86}
            onPress={() => navigation.navigate('ProductDetail', {
              product: {
                ...item,
                qty: selectedVariant.label,
                price: selectedVariant.price,
                selectedVariant: selectedVariant.label,
                variantType: 'Pack size',
              },
            })}
          >
            <View style={styles.productImageBox}>
              <Text style={{ fontSize: 46 }}>{item.icon}</Text>
            </View>
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.variantRow}
            >
              {item.variants.map((variant) => {
                const isSelected = selectedVariant.label === variant.label;
                return (
                  <TouchableOpacity
                    key={variant.label}
                    style={[styles.variantChip, isSelected && styles.variantChipActive]}
                    onPress={(event) => {
                      event.stopPropagation?.();
                      setSelectedVariants((prev) => ({ ...prev, [item.id]: variant.label }));
                    }}
                  >
                    <Text style={[styles.variantText, isSelected && styles.variantTextActive]}>
                      {variant.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.productPrice}>₹{selectedVariant.price}</Text>
              {cart[cartKey] ? (
                <View style={styles.quantityControl}>
                  <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.qtyBtn}>
                    <Text style={{ color: Colors.white, fontWeight: '700', fontSize: FontSize.md }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary, minWidth: 16, textAlign: 'center' }}>{cart[cartKey]}</Text>
                  <TouchableOpacity onPress={() => addToCart(item)} style={styles.qtyBtn}>
                    <Text style={{ color: Colors.white, fontWeight: '700', fontSize: FontSize.md }}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                  <Text style={{ color: Colors.white, fontSize: FontSize.xs, fontWeight: '700' }}>+ ADD</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
          );
        }}
      />

      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate('Cart')} activeOpacity={0.9}>
          <View>
            <Text style={{ fontSize: FontSize.md, fontWeight: '700', color: Colors.white }}>{cartCount} items</Text>
            <Text style={{ fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' }}>in your cart</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '800', color: Colors.white }}>₹{cartTotal}</Text>
            <Text style={{ fontSize: FontSize.xs, color: Colors.secondary, fontWeight: '700' }}>View Cart →</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.secondary, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, marginHorizontal: Spacing.lg, marginTop: 12, marginBottom: 4, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary },
  categoryScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 52,
  },
  categoryContent: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  productCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.md, padding: Spacing.md, margin: 4, ...Shadow.sm },
  productImageBox: { backgroundColor: Colors.gray100, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', height: 90, marginBottom: 8 },
  productName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  variantRow: { gap: 5, paddingVertical: 7 },
  variantChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.white,
  },
  variantChipActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  variantText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' },
  variantTextActive: { color: Colors.primary },
  productPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.sm },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, padding: 4 },
  qtyBtn: { width: 24, height: 24, backgroundColor: Colors.primary, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  cartBar: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...Shadow.lg },
});
