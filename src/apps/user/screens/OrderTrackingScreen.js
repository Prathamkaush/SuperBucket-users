import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bike,
  Check,
  Circle,
  PackageCheck,
  PackageOpen,
  Phone,
  ShoppingBag,
  UserRound,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import BackButton from '../components/BackButton';
import { getMyOrder } from '../services/orders';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';

const ENABLE_NATIVE_MAPS =
  process.env.EXPO_PUBLIC_ENABLE_NATIVE_MAPS === 'true' &&
  Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY);
const NativeMaps = getNativeMaps();

export default function OrderTrackingScreen({ navigation, route }) {
  const initialOrder = route?.params?.order || null;
  const orderId = route?.params?.orderId || initialOrder?.orderId || initialOrder?.id;
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [resolvedCustomerPoint, setResolvedCustomerPoint] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    try {
      if (!silent) setLoading(true);
      setOrder(await getMyOrder(orderId));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!orderId || ['DELIVERED', 'CANCELLED'].includes(order?.status)) return undefined;
    const interval = setInterval(() => load({ silent: true }), 8000);
    return () => clearInterval(interval);
  }, [load, order?.status, orderId]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const steps = buildSteps(order);
  const riderName = order?.deliveryPartner?.name || order?.deliveryPartnerName;
  const riderPhone = order?.deliveryPartner?.phone || order?.deliveryPartnerPhone;
  const dropAddress = customerAddress(order?.address);
  const trackingActive = Boolean(order?.status === 'SHIPPED' && (
    order?.deliveryPartner?.id || order?.deliveryPartnerName || order?.deliveryLocationUpdatedAt
  ));
  const driverPoint = trackingActive ? coordinateFrom({
    latitude: order?.deliveryLatitude,
    longitude: order?.deliveryLongitude,
  }, true) : null;
  const customerPoint = trackingActive
    ? coordinateFrom(order?.address, true) || resolvedCustomerPoint
    : null;
  const mapPoints = [driverPoint, customerPoint].filter(Boolean);
  const mapRegion = useMemo(() => buildRegion(mapPoints), [driverPoint, customerPoint]);
  const routeLine = [driverPoint, customerPoint].filter(Boolean);
  const hasLiveLocation = Boolean(trackingActive && driverPoint);
  const canShowNativeMap = Boolean(NativeMaps && mapRegion);
  const eta = estimateArrival(driverPoint, customerPoint);

  useEffect(() => {
    let active = true;
    if (!trackingActive || coordinateFrom(order?.address, true) || !order?.address) {
      setResolvedCustomerPoint(null);
      return () => { active = false; };
    }

    Location.geocodeAsync(`${dropAddress}, India`)
      .then((results) => {
        if (active) setResolvedCustomerPoint(coordinateFrom(results?.[0], true));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [trackingActive, dropAddress]);

  const openExternalMap = () => {
    const destination = driverPoint || customerPoint;
    if (!destination) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`).catch(() => {});
  };

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
          <View style={styles.mapWrap}>
            {canShowNativeMap ? (
              <NativeMaps.MapView style={styles.map} region={mapRegion} showsUserLocation={false}>
                {customerPoint ? (
                  <NativeMaps.Marker coordinate={customerPoint} title="Your delivery address" pinColor={Colors.primary} />
                ) : null}
                {driverPoint ? (
                  <NativeMaps.Marker coordinate={driverPoint} title={riderName || 'Delivery partner'}>
                    <Animated.View style={[styles.driverMarker, { transform: [{ scale: pulseAnim }] }]}>
                      <Bike size={19} color={Colors.white} strokeWidth={2.8} />
                    </Animated.View>
                  </NativeMaps.Marker>
                ) : null}
                {routeLine.length >= 2 ? (
                  <NativeMaps.Polyline coordinates={routeLine} strokeColor={Colors.secondary} strokeWidth={4} />
                ) : null}
              </NativeMaps.MapView>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Animated.View style={[styles.placeholderIcon, { transform: [{ scale: pulseAnim }] }]}>
                  <Bike size={42} color={Colors.primary} strokeWidth={2.4} />
                </Animated.View>
                <Text style={styles.mapText}>{trackingHeadline(order)}</Text>
                {mapRegion ? (
                  <TouchableOpacity style={styles.openMapButton} onPress={openExternalMap}>
                    <Text style={styles.openMapText}>Open in Google Maps</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
            <View style={styles.mapCard}>
              <View style={[styles.liveBadge, hasLiveLocation && styles.liveBadgeOn]}>
                <Text style={[styles.liveBadgeText, hasLiveLocation && styles.liveBadgeTextOn]}>
                  {hasLiveLocation ? 'LIVE' : 'TRACKING'}
                </Text>
              </View>
              <Text style={styles.mapText}>{trackingHeadline(order)}</Text>
              <Text style={styles.mapEta}>
                {eta || (order?.deliveryLocationUpdatedAt
                  ? `Updated ${new Date(order.deliveryLocationUpdatedAt).toLocaleTimeString()}`
                  : trackingActive ? 'Waiting for rider GPS location' : 'Live tracking starts after rider accepts')}
              </Text>
            </View>
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
                      {step.done ? (
                        <Check size={15} color={Colors.white} strokeWidth={3} />
                      ) : (
                        <Circle size={10} color={Colors.gray500} strokeWidth={2.5} />
                      )}
                    </View>
                    {idx < steps.length - 1 ? (
                      <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                    ) : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineIcon}>{step.icon}</View>
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
              <View style={styles.riderAvatar}>
                <UserRound size={25} color={Colors.primary} strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{riderName || 'Assigned after dispatch'}</Text>
                <Text style={styles.riderDetails}>{riderPhone || 'Rider contact appears when assigned'}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{order?.deliverySlotLabel || 'Instant delivery'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.riderActionBtn, !riderPhone && styles.disabledAction]}
                disabled={!riderPhone}
                onPress={() => Linking.openURL(`tel:${riderPhone}`)}
              >
                <Phone size={18} color={Colors.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function getNativeMaps() {
  if (!ENABLE_NATIVE_MAPS || Platform.OS === 'web') return null;
  try {
    const maps = require('react-native-maps');
    return {
      MapView: maps.default,
      Marker: maps.Marker,
      Polyline: maps.Polyline,
    };
  } catch {
    return null;
  }
}

function trackingHeadline(order) {
  if (order?.status === 'DELIVERED') return 'Delivered successfully';
  if (order?.status === 'SHIPPED' && coordinateFrom({
    latitude: order?.deliveryLatitude,
    longitude: order?.deliveryLongitude,
  }, true)) return 'Rider location is live';
  if (order?.status === 'SHIPPED') return 'Out for delivery';
  if (order?.status === 'CONFIRMED') return 'Packing your order';
  return 'Order received';
}

function buildSteps(order) {
  const rank = { PENDING: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 }[order?.status] ?? 0;
  return [
    { key: 'received', icon: <ShoppingBag size={16} color={Colors.secondary} strokeWidth={2.4} />, label: 'Order Received', time: formatTime(order?.createdAt), done: rank >= 0 },
    { key: 'packed', icon: <PackageOpen size={16} color={Colors.secondary} strokeWidth={2.4} />, label: 'Packed & Ready', time: formatTime(order?.confirmedAt), done: rank >= 1 },
    { key: 'out', icon: <Bike size={16} color={Colors.secondary} strokeWidth={2.4} />, label: 'Out for Delivery', time: formatTime(order?.shippedAt), done: rank >= 2 },
    { key: 'delivered', icon: <PackageCheck size={16} color={Colors.secondary} strokeWidth={2.4} />, label: 'Delivered', time: formatTime(order?.deliveredAt), done: rank >= 3 },
  ];
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString() : 'Pending';
}

function coordinateFrom(value, indiaOnly = false) {
  const latitude = Number(value?.latitude ?? value?.lat);
  const longitude = Number(value?.longitude ?? value?.lng);
  if (
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 ||
    (latitude === 0 && longitude === 0)
  ) return null;
  if (indiaOnly && (latitude < 6 || latitude > 38 || longitude < 68 || longitude > 98)) return null;
  return { latitude, longitude };
}

function customerAddress(address) {
  if (!address) return '';
  return [address.street, address.city, address.state, address.pincode].filter(Boolean).join(', ');
}

function estimateArrival(driver, customer) {
  if (!driver || !customer) return null;
  const distanceKm = haversineKm(driver, customer);
  if (distanceKm < 0.25) return 'Rider is arriving now';

  // City-delivery estimate. It refreshes as the rider's live GPS position changes.
  const minutes = Math.max(5, Math.ceil((distanceKm / 20) * 60));
  const lower = Math.max(5, Math.floor(minutes / 5) * 5);
  const upper = Math.max(lower + 5, Math.ceil((minutes + 5) / 5) * 5);
  return `Approx. arrival in ${lower}-${upper} min`;
}

function haversineKm(from, to) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latDelta = radians(to.latitude - from.latitude);
  const lngDelta = radians(to.longitude - from.longitude);
  const a = Math.sin(latDelta / 2) ** 2 +
    Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) *
    Math.sin(lngDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildRegion(points) {
  if (!points.length) return null;
  const lats = points.map((point) => point.latitude);
  const lngs = points.map((point) => point.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.8 || 0.02),
    longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.8 || 0.02),
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  mapWrap: { height: 260, backgroundColor: Colors.primaryLight, borderBottomWidth: 1, borderBottomColor: Colors.border },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapCard: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    ...Shadow.md,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray100,
  },
  liveBadgeOn: { backgroundColor: Colors.successLight },
  liveBadgeText: { color: Colors.textMuted, fontSize: 10, fontWeight: '900' },
  liveBadgeTextOn: { color: Colors.success },
  driverMarker: {
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: Colors.white,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    ...Shadow.md,
  },
  placeholderIcon: {
    width: 70,
    height: 70,
    marginBottom: 100,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  openMapButton: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  openMapText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
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
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.gray200, marginVertical: 4, minHeight: 24 },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 16 },
  timelineIcon: { width: 22, marginRight: 10, alignItems: 'center', paddingTop: 1 },
  timelineLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  timelineLabelDone: { color: Colors.textPrimary },
  timelineTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  riderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, ...Shadow.md, gap: 12 },
  riderAvatar: { width: 56, height: 56, backgroundColor: Colors.primaryLight, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  riderName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  riderDetails: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  ratingBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 4 },
  ratingText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  riderActionBtn: { minWidth: 48, height: 42, paddingHorizontal: 8, backgroundColor: Colors.primaryLight, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  disabledAction: { opacity: 0.45 },
});
