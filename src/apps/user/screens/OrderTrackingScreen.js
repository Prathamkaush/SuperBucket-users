import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackButton from '../components/BackButton';
import { getMyOrder } from '../services/orders';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';

export default function OrderTrackingScreen({ navigation, route }) {
  const initialOrder = route?.params?.order || null;
  const orderId = route?.params?.orderId || initialOrder?.orderId || initialOrder?.id;
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(Boolean(orderId));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const load = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      setOrder(await getMyOrder(orderId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [orderId]);

  const steps = buildSteps(order);
  const riderPhone = order?.deliveryPartnerPhone;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSub}>Order #{order?.id || order?.orderId || '...'}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        >
          <View style={styles.mapPlaceholder}>
            <Animated.Text style={[styles.riderEmoji, { transform: [{ scale: pulseAnim }] }]}>D</Animated.Text>
            <Text style={styles.mapText}>{trackingHeadline(order)}</Text>
            <Text style={styles.mapEta}>
              {order?.deliveryLocationUpdatedAt
                ? `Location updated ${new Date(order.deliveryLocationUpdatedAt).toLocaleTimeString()}`
                : order?.deliverySlotLabel || 'Instant delivery'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Status</Text>
            {order?.deliveryOtp && order?.status !== 'DELIVERED' ? (
              <View style={styles.otpCard}>
                <Text style={styles.otpLabel}>Delivery OTP</Text>
                <Text style={styles.otpValue}>{order.deliveryOtp}</Text>
                <Text style={styles.otpHelp}>Share this only after the delivery partner reaches you with the order.</Text>
              </View>
            ) : null}

            <View style={styles.timelineCard}>
              {steps.map((step, idx) => (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, step.done ? styles.dotDone : styles.dotPending]}>
                      <Text style={styles.dotText}>{step.done ? '✓' : '○'}</Text>
                    </View>
                    {idx < steps.length - 1 ? (
                      <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                    ) : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineIcon}>{step.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.timelineLabel, step.done && styles.timelineLabelDone]}>{step.label}</Text>
                      <Text style={styles.timelineTime}>{step.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rider</Text>
            <View style={styles.riderCard}>
              <View style={styles.riderAvatar}><Text style={styles.riderAvatarText}>R</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{order?.deliveryPartnerName || 'Assigned after dispatch'}</Text>
                <Text style={styles.riderDetails}>{order?.deliveryPartnerPhone || 'Rider contact appears when assigned'}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{order?.deliverySlotLabel || 'Instant delivery'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.riderActionBtn, !riderPhone && styles.disabledAction]}
                disabled={!riderPhone}
                onPress={() => Linking.openURL(`tel:${riderPhone}`)}
              >
                <Text style={styles.callIcon}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function trackingHeadline(order) {
  if (order?.status === 'DELIVERED') return 'Delivered successfully';
  if (order?.status === 'SHIPPED' && order?.deliveryLatitude) return 'Rider location is live';
  if (order?.status === 'SHIPPED') return 'Out for delivery';
  if (order?.status === 'CONFIRMED') return 'Packing your order';
  return 'Order received';
}

function buildSteps(order) {
  const rank = { PENDING: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 }[order?.status] ?? 0;
  return [
    { key: 'received', icon: 'O', label: 'Order Received', time: formatTime(order?.createdAt), done: rank >= 0 },
    { key: 'packed', icon: 'P', label: 'Packed & Ready', time: formatTime(order?.confirmedAt), done: rank >= 1 },
    { key: 'out', icon: 'D', label: 'Out for Delivery', time: formatTime(order?.shippedAt), done: rank >= 2 },
    { key: 'delivered', icon: 'V', label: 'Delivered', time: formatTime(order?.deliveredAt), done: rank >= 3 },
  ];
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString() : 'Pending';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  mapPlaceholder: { backgroundColor: Colors.primaryLight, height: 200, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
  riderEmoji: { fontSize: 44, marginBottom: 8, fontWeight: '900' },
  mapText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  mapEta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  section: { paddingHorizontal: Spacing.lg, paddingTop: 20, marginBottom: 4 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  otpCard: { backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.warning },
  otpLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800', textTransform: 'uppercase' },
  otpValue: { fontSize: 30, letterSpacing: 8, color: Colors.textPrimary, fontWeight: '900', marginTop: 4 },
  otpHelp: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 6, lineHeight: 17 },
  timelineCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, ...Shadow.sm },
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', marginRight: 12, width: 32 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: Colors.primary },
  dotPending: { backgroundColor: Colors.gray200 },
  dotText: { color: Colors.white, fontSize: 13, fontWeight: '900' },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.gray200, marginVertical: 4, minHeight: 24 },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 16 },
  timelineIcon: { width: 22, marginRight: 10, color: Colors.secondary, fontWeight: '900' },
  timelineLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  timelineLabelDone: { color: Colors.textPrimary },
  timelineTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  riderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, ...Shadow.md, gap: 12 },
  riderAvatar: { width: 56, height: 56, backgroundColor: Colors.primaryLight, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  riderAvatarText: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '900' },
  riderName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  riderDetails: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  ratingBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 4 },
  ratingText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  riderActionBtn: { minWidth: 48, height: 42, paddingHorizontal: 8, backgroundColor: Colors.primaryLight, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  disabledAction: { opacity: 0.45 },
  callIcon: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' },
});
