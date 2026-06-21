import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const NOTIFICATIONS = [
  {
    id: '1', icon: '📦', title: 'Order Packed!',
    body: 'Your order #SB2045 is packed and ready for dispatch.',
    time: '2 min ago', read: false, accent: Colors.primary, bg: Colors.primaryLight,
  },
  {
    id: '2', icon: '🚴', title: 'Rider is on the way',
    body: 'Vikram Singh is heading to your location. ETA: 12 mins.',
    time: '18 min ago', read: false, accent: '#F59E0B', bg: '#FFF8E1',
  },
  {
    id: '3', icon: '💰', title: 'Cashback Added!',
    body: '₹24 cashback added to your wallet for order #SB2039.',
    time: '1 hr ago', read: true, accent: Colors.success, bg: Colors.successLight,
  },
  {
    id: '4', icon: '🎁', title: 'Wallet Updated',
    body: 'Your wallet was credited with ₹128 change from rider.',
    time: '2 hrs ago', read: true, accent: Colors.secondary, bg: Colors.secondaryLight,
  },
  {
    id: '5', icon: '🛒', title: 'Order Delivered ✓',
    body: 'Your order #SB2039 was delivered successfully. Rate your experience!',
    time: 'Yesterday', read: true, accent: Colors.success, bg: Colors.successLight,
  },
  {
    id: '6', icon: '🎉', title: 'Festival Offer!',
    body: '20% off on all grocery orders this weekend. Use code: FEST20',
    time: '2 days ago', read: true, accent: '#E65C00', bg: '#FFF3E6',
  },
];

export default function NotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Unread section label */}
        {notifs.some(n => !n.read) && (
          <Text style={styles.sectionLabel}>NEW</Text>
        )}

        {notifs.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[
              styles.notifCard,
              !notif.read && styles.notifCardUnread,
              !notif.read && { borderLeftColor: notif.accent },
            ]}
            activeOpacity={0.8}
          >
            {/* Icon */}
            <View style={[styles.notifIconWrap, { backgroundColor: notif.bg }]}>
              <Text style={styles.notifIcon}>{notif.icon}</Text>
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={styles.notifTitleRow}>
                <Text style={[styles.notifTitle, !notif.read && { color: Colors.textPrimary }]}>
                  {notif.title}
                </Text>
                {!notif.read && (
                  <View style={[styles.unreadDot, { backgroundColor: notif.accent }]} />
                )}
              </View>
              <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: Colors.white, fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  unreadBadge: {
    marginTop: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  unreadBadgeText: { fontSize: 9, color: Colors.white, fontWeight: '800' },
  markAllBtn: {
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#F3B9BE',
  },
  markAllText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },

  sectionLabel: {
    fontSize: FontSize.xxs,
    fontWeight: '800',
    color: Colors.textMuted,
    marginLeft: Spacing.lg,
    marginBottom: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: 10,
    borderRadius: Radius.lg,
    padding: 14,
    ...Shadow.sm,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    backgroundColor: '#FDFCFC',
  },
  notifIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifIcon: { fontSize: 24 },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: 8,
    flexShrink: 0,
  },
  notifBody: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
});
