import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import LogoBrand from '../components/LogoBrand';

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
  { icon: '🔁', label: 'Reorder', screen: 'Cart', color: Colors.primaryLight },
  { icon: '📄', label: 'Upload PDF', screen: 'PrintDeliver', color: Colors.secondaryLight },
  { icon: '⚡', label: 'Electrician', screen: 'PennyWorks', color: '#FFF3E6' },
  { icon: '📦', label: 'Send Parcel', screen: 'Parcel', color: '#F0F4FF' },
];

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

  const openTrending = (item) => {
    if (item.action === 'ProductDetail') {
      navigation.navigate('ProductDetail', { product: item.product });
      return;
    }

    navigation.navigate(item.action);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* ─── Top Header ─── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <LogoBrand size="sm" onDark={true} />
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
            {TRENDING.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.trendingCard}
                activeOpacity={0.84}
                onPress={() => openTrending(item)}
              >
                <View style={[styles.trendingArt, { backgroundColor: item.bg }]}>
                  <Text style={[styles.trendingInitial, { color: item.accent }]}>
                    {item.title.charAt(0)}
                  </Text>
                  <View style={[styles.trendingTag, { backgroundColor: item.accent }]}>
                    <Text style={styles.trendingTagText}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.trendingSub} numberOfLines={1}>{item.sub}</Text>
                <View style={styles.trendingBottom}>
                  <Text style={[styles.trendingPrice, { color: item.accent }]}>
                    Rs {item.price}
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
                <Text style={styles.quickIcon}>{action.icon}</Text>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Categories ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryCard, { backgroundColor: cat.bg }]}
                onPress={() => navigation.navigate(cat.screen)}
                activeOpacity={0.78}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryLabel} numberOfLines={2}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topLeft: { flex: 1, marginRight: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 3 },
  pinIcon: { fontSize: 11 },
  locationText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    flex: 1,
  },
  chevron: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  walletText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '800' },
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
    borderColor: Colors.primary,
  },
  badgeText: { fontSize: 8, color: Colors.white, fontWeight: '800' },

  /* Search */
  searchWrapper: {
    backgroundColor: Colors.primary,
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
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  quickIcon: { fontSize: 24, marginBottom: 6 },
  quickLabel: { fontSize: FontSize.xxs, color: Colors.textSecondary, textAlign: 'center', fontWeight: '700' },

  /* Category grid */
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '22%',
    borderRadius: Radius.md,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  categoryIcon: { fontSize: 26, marginBottom: 5 },
  categoryLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
