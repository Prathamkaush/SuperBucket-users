import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Image, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import LogoBrand from '../components/LogoBrand';
import { getCategories } from '../services/categories';
import { getProducts } from '../services/products';

const CATEGORIES = [
  { id: '1',  icon: '🛒', label: 'Groceries',         screen: 'Grocery',      bg: '#FFF0F0' },
  { id: '2',  icon: '🥬', label: 'Vegetables',         screen: 'Grocery',      bg: '#F0FFF4' },
  { id: '3',  icon: '🥛', label: 'Dairy',              screen: 'Grocery',      bg: '#F0F8FF' },
  { id: '4',  icon: '📦', label: 'Parcel Pickup',      screen: 'Parcel',       bg: '#FFF8F0' },
  { id: '5',  icon: '🖨️', label: 'Print & Deliver',    screen: 'PrintDeliver', bg: '#F3F0FF' },
  { id: '6',  icon: '🔧', label: 'Penny Works',        screen: 'PennyWorks',   bg: '#FFF0F8' },
  { id: '7',  icon: '🏠', label: 'Rentals',            screen: 'Rentals',      bg: '#F0FFFA' },
  { id: '8',  icon: '📱', label: 'Electronics',        screen: 'Marketplace',  bg: '#F0F4FF' },
  { id: '9',  icon: '🍳', label: 'Kitchen',            screen: 'Marketplace',  bg: '#FFFDF0' },
  { id: '10', icon: '👕', label: 'Fashion',            screen: 'Marketplace',  bg: '#FFF0F6' },
  { id: '11', icon: '👟', label: 'Footwear',           screen: 'Marketplace',  bg: '#F5F0FF' },
  { id: '12', icon: '🔩', label: 'Hardware',           screen: 'Marketplace',  bg: '#F0F9FF' },
  { id: '13', icon: '🧺', label: 'Plastics',           screen: 'Marketplace',  bg: '#FAFFF0' },
  { id: '14', icon: '⚽', label: 'Sports',             screen: 'Marketplace',  bg: '#FFF5F0' },
  { id: '15', icon: '📓', label: 'Stationery',         screen: 'Marketplace',  bg: '#F0FCFF' },
  { id: '16', icon: '🏥', label: 'Pharmacy',           screen: 'Marketplace',  bg: '#F0FFF9' },
];

const QUICK_ACTIONS = [
  { icon: 'megaphone', iconSet: 'Feather', label: 'Advertise Business', screen: 'AdvertiseBusiness', color: Colors.primaryLight, iconColor: Colors.primary },
  { icon: 'file-text', iconSet: 'Feather', label: 'Print & Deliver', screen: 'PrintDeliver', color: Colors.secondaryLight, iconColor: Colors.secondary },
  { icon: 'tool', iconSet: 'Feather', label: 'Penny Works', screen: 'PennyWorks', color: '#FFF3E6', iconColor: Colors.accent },
  { icon: 'package', iconSet: 'Feather', label: 'Send Parcel', screen: 'Parcel', color: '#F0F4FF', iconColor: '#4F46E5' },
  { icon: 'home-city-outline', iconSet: 'MaterialCommunityIcons', label: 'Properties', screen: 'Rentals', color: '#E6FFFA', iconColor: Colors.success },
  { icon: 'home-plus-outline', iconSet: 'MaterialCommunityIcons', label: 'List Property', screen: 'RenterPortal', color: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: 'briefcase', iconSet: 'Feather', label: 'Provide Services', screen: 'ProviderPortal', color: '#ECFDF5', iconColor: Colors.success },
];

function ActionIcon({ action, size = 24 }) {
  const Icon = action.iconSet === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Feather;
  return <Icon name={action.icon} size={size} color={action.iconColor} />;
}

const OFFERS = [
  {
    id: '1',
    title: '10% Cashback',
    sub: 'On first wallet recharge',
    gradient: [Colors.primary, Colors.primaryDark],
    emoji: '💰',
  },
  {
    id: '2',
    title: '₹50 Reward',
    sub: 'Refer a friend & earn',
    gradient: [Colors.secondary, Colors.secondaryDark],
    emoji: '🎁',
  },
  {
    id: '3',
    title: 'Free Delivery',
    sub: 'On orders above ₹299',
    gradient: ['#FF6B00', '#E65C00'],
    emoji: '🚚',
  },
];

const TRENDING = [
  {
    id: '1',
    tag: 'Grocery',
    title: 'Fortune Sunflower Oil',
    sub: '1L pack',
    price: 145,
    accent: Colors.primary,
    bg: Colors.primaryLight,
    action: 'ProductDetail',
    product: {
      id: 'trend-1',
      name: 'Fortune Sunflower Oil',
      qty: '1L',
      price: 145,
      category: 'Oils',
      delivery: 'Today',
      icon: '',
    },
  },
  {
    id: '2',
    tag: 'Service',
    title: 'Electrician Visit',
    sub: 'Available near you',
    price: 200,
    accent: Colors.accent,
    bg: Colors.accentLight,
    action: 'PennyWorks',
  },
  {
    id: '3',
    tag: 'Rental',
    title: '2BHK in Sector 12',
    sub: 'Verified listing',
    price: 12000,
    accent: Colors.secondary,
    bg: Colors.secondaryLight,
    action: 'Rentals',
  },
  {
    id: '4',
    tag: 'Marketplace',
    title: 'Bluetooth Speaker',
    sub: 'Delivery in 2-3 days',
    price: 799,
    accent: Colors.success,
    bg: Colors.successLight,
    action: 'ProductDetail',
    product: {
      id: 'trend-4',
      name: 'Bluetooth Speaker',
      qty: '1 unit',
      price: 799,
      category: 'Electronics',
      delivery: '2-3 days',
      icon: '',
    },
  },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError('');
      setCategories(await getCategories());
    } catch (error) {
      setCategoriesError(error?.message || 'Unable to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    try {
      setTrendingLoading(true);
      const response = await getProducts({ page: 1, limit: 8, trending: true, stock: 'in' });
      setTrendingProducts(response.products);
    } catch {
      setTrendingProducts([]);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadTrending();
    }, [loadCategories, loadTrending]),
  );

  const openTrending = (product) =>
    navigation.navigate('ProductDetail', { productId: product.id, product });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />

      {/* ─── Top Header ─── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <LogoBrand size="sm" />
          <TouchableOpacity style={styles.locationRow}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>Sector 14, Gurugram</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.walletChip} onPress={() => navigation.navigate('Wallet')}>
            <Text style={styles.walletText}>💰 ₹240</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.iconBtnText}>🔔</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.iconBtnText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Search Bar ─── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search groceries, services, parcels..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ─── Delivery Slot Banner ─── */}
        <View style={styles.slotBanner}>
          <View style={styles.slotLeft}>
            <Text style={styles.slotEmoji}>🌆</Text>
            <View>
              <Text style={styles.slotLabel}>Next Delivery Slot</Text>
              <Text style={styles.slotTime}>EVENING  5 PM – 9 PM</Text>
            </View>
          </View>
          <View style={styles.slotBadge}>
            <Text style={styles.slotBadgeText}>Today</Text>
          </View>
        </View>

        {/* ─── Offers ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers for You 🎉</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {OFFERS.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                style={[styles.offerCard, { backgroundColor: offer.gradient[0] }]}
                activeOpacity={0.88}
              >
                <Text style={styles.offerEmoji}>{offer.emoji}</Text>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSub}>{offer.sub}</Text>
                <View style={styles.claimBtn}>
                  <Text style={styles.claimText}>Claim →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingLoading ? (
              <View style={styles.trendingLoading}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : null}
            {!trendingLoading && trendingProducts.length === 0 ? (
              <Text style={styles.trendingEmpty}>No trending products yet.</Text>
            ) : null}
            {trendingProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.trendingCard}
                activeOpacity={0.84}
                onPress={() => openTrending(product)}
              >
                <View style={[styles.trendingArt, { backgroundColor: Colors.primaryLight }]}>
                  {product.imageUrl ? (
                    <Image source={{ uri: product.imageUrl }} style={styles.trendingImage} />
                  ) : (
                    <Text style={[styles.trendingInitial, { color: Colors.primary }]}>
                      {product.name.charAt(0)}
                    </Text>
                  )}
                  <View style={[styles.trendingTag, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.trendingTagText}>{product.category || 'Product'}</Text>
                  </View>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.trendingSub} numberOfLines={1}>
                  {product.variants[0]?.label || product.brand || 'Available now'}
                </Text>
                <View style={styles.trendingBottom}>
                  <Text style={[styles.trendingPrice, { color: Colors.primary }]}>
                    Rs {Number(product.price || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.trendingArrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.quickCard, { backgroundColor: action.color }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(action.screen)}
              >
                <View style={styles.quickIcon}>
                  <ActionIcon action={action} />
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Categories ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          {categoriesLoading ? (
            <View style={styles.categoryStatus}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.categoryStatusText}>Loading categories...</Text>
            </View>
          ) : categoriesError ? (
            <View style={styles.categoryStatus}>
              <Text style={styles.categoryStatusText}>{categoriesError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.categoryStatus}>
              <Text style={styles.categoryStatusText}>No categories available yet.</Text>
            </View>
          ) : (
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate('Marketplace', {
                    categoryId: category.id,
                    categoryName: category.name,
                  })
                }
                activeOpacity={0.78}
              >
                {category.imageUrl ? (
                  <Image
                    source={{ uri: category.imageUrl }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.categoryFallback}>
                    <Text style={styles.categoryFallbackText}>
                      {category.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          )}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  /* Top bar */
  topBar: {
    backgroundColor: Colors.primaryLight,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F7D6D9',
  },

  topLeft: { flex: 1, marginRight: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 3 },
  pinIcon: { fontSize: 11 },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  chevron: { color: Colors.gray600, fontSize: 11 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#F3B9BE',
  },
  walletText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '800' },
  iconBtn: { position: 'relative', padding: 4 },
  iconBtnText: { fontSize: 21 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  badgeText: { fontSize: 8, color: Colors.white, fontWeight: '800' },

  /* Search */
  searchWrapper: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  /* Slot banner */
  slotBanner: {
    margin: Spacing.lg,
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slotEmoji: { fontSize: 28 },
  slotLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  slotTime: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.secondary, marginTop: 2 },
  slotBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  slotBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },

  /* Section */
  section: { paddingHorizontal: Spacing.lg, marginBottom: 22 },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionAction: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 14,
  },

  /* Offers */
  offerCard: {
    width: 180,
    borderRadius: Radius.lg,
    padding: 16,
    marginRight: 12,
    minHeight: 130,
    justifyContent: 'space-between',
    ...Shadow.md,
  },
  offerEmoji: { fontSize: 28, marginBottom: 6 },
  offerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  offerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  claimBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  claimText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '700' },

  /* Trending */
  trendingCard: {
    width: 158,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    marginRight: 12,
    ...Shadow.sm,
  },
  trendingArt: {
    height: 82,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingLoading: {
    width: 158,
    minHeight: 185,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingEmpty: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    paddingVertical: Spacing.lg,
  },
  trendingInitial: {
    fontSize: 34,
    fontWeight: '900',
  },
  trendingTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trendingTagText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  trendingTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '800',
    minHeight: 36,
  },
  trendingSub: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  trendingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  trendingPrice: {
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  trendingArrow: {
    color: Colors.gray500,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
  },

  /* Quick actions */
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  quickCard: {
    width: '48%',
    minHeight: 82,
    borderRadius: Radius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  quickLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '800',
    lineHeight: 17,
  },

  /* Category grid */
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '22%',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  categoryImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    marginBottom: 7,
    backgroundColor: Colors.gray100,
  },
  categoryFallback: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondaryLight,
  },
  categoryFallbackText: {
    color: Colors.secondary,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  categoryLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
  },
  categoryStatus: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryStatusText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
});
