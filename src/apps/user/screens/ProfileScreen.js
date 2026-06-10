import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import LogoBrand from '../components/LogoBrand';

const MENU_ITEMS = [
  {
    section: 'Account',
    items: [
      { icon: '📍', label: 'Saved Addresses', sub: '2 saved locations', screen: 'Location',      iconBg: Colors.primaryLight,   iconColor: Colors.primary },
      { icon: '💰', label: 'My Wallet',        sub: '₹240 balance',      screen: 'Wallet',        iconBg: '#FFF8E1',             iconColor: '#F59E0B' },
      { icon: '📦', label: 'Order History',    sub: '12 orders placed',  screen: 'OrderTracking', iconBg: Colors.secondaryLight, iconColor: Colors.secondary },
    ],
  },
  {
    section: 'Services',
    items: [
      { icon: '🔧', label: 'Penny Works',    sub: 'View bookings',         screen: null, iconBg: '#FFF0F8', iconColor: '#C0185C' },
      { icon: '🏠', label: 'Rental Inquiries', sub: 'Enquired properties', screen: null, iconBg: '#F0FFF4', iconColor: Colors.success },
      { icon: '🖨️', label: 'Print Orders',   sub: 'Your print history',    screen: null, iconBg: '#F5F0FF', iconColor: '#7C3AED' },
    ],
  },
  {
    section: 'More',
    items: [
      { icon: '❓', label: 'Help Center',  sub: 'FAQs & Support',    screen: null,    iconBg: Colors.gray100, iconColor: Colors.gray600 },
      { icon: '🎁', label: 'Refer & Earn', sub: 'Earn ₹50/referral', screen: null,    iconBg: '#FFF8E1',     iconColor: '#F59E0B' },
      { icon: '⭐', label: 'Rate the App', sub: 'Share your thoughts', screen: null,   iconBg: '#FFF3E6',     iconColor: '#E65C00' },
      { icon: '🚪', label: 'Logout',       sub: null,                screen: 'Login', iconBg: Colors.dangerLight, iconColor: Colors.danger, danger: true },
    ],
  },
];

const STATS = [
  { label: 'Orders',  val: '12',   icon: '📦', color: Colors.secondary },
  { label: 'Wallet',  val: '₹240', icon: '💰', color: '#F59E0B' },
  { label: 'Points',  val: '480',  icon: '⭐', color: '#7C3AED' },
];

export default function ProfileScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* ─── Hero Header ─── */}
      <View style={styles.header}>
        {/* Background decoration */}
        <View style={styles.headerDecorLeft} />
        <View style={styles.headerDecorRight} />

        <LogoBrand size="sm" onDark={true} style={{ marginBottom: 20 }} />

        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={styles.editDot}>
            <Text style={styles.editDotIcon}>✏️</Text>
          </View>
        </View>

        <Text style={styles.userName}>Rahul Sharma</Text>
        <Text style={styles.userPhone}>+91 98765 43210</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {STATS.map((s, idx) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {idx < STATS.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ─── Menu Sections ─── */}
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((section) => (
          <View key={section.section}>
            <Text style={styles.sectionLabel}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => item.screen && navigation.navigate(item.screen)}
                  activeOpacity={0.72}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
                    <Text style={styles.menuIconText}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, item.danger && { color: Colors.danger }]}>
                      {item.label}
                    </Text>
                    {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
                  </View>
                  {!item.danger && (
                    <View style={styles.chevronWrap}>
                      <Text style={styles.chevron}>›</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.versionText}>SUPERBUKET v1.0.0  ·  Made with ❤️ for your town</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  /* Header */
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 52,
    paddingBottom: 28,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  headerDecorLeft: {
    position: 'absolute',
    left: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  headerDecorRight: {
    position: 'absolute',
    right: -50,
    bottom: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.secondary,
    opacity: 0.25,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  avatarIcon: { fontSize: 42 },
  editDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  editDotIcon: { fontSize: 12 },
  userName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  userPhone: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 3 },

  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: FontSize.xl, fontWeight: '900' },
  statLabel: { fontSize: FontSize.xxs, color: 'rgba(255,255,255,0.7)', marginTop: 3, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },

  /* Menu */
  sectionLabel: {
    fontSize: FontSize.xxs,
    fontWeight: '800',
    color: Colors.textMuted,
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: Spacing.lg,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    ...Shadow.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconText: { fontSize: 20 },
  menuLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary },
  menuSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 18, color: Colors.gray400, fontWeight: '700' },
  versionText: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 28,
    marginBottom: 16,
  },
});
