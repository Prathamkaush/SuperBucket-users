import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import { getMyOrders, reorderOrder } from '../services/orders';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
const PAGE_SIZE = 5;

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [reorderingId, setReorderingId] = useState(null);

  const load = useCallback(async (nextPage = 1, append = false, refreshOnly = false) => {
    if (append) setLoadingMore(true);
    else if (!refreshOnly) setLoading(true);

    try {
      const data = await getMyOrders(nextPage, PAGE_SIZE);
      const nextOrders = data.orders || [];
      setOrders((current) => (append ? mergeOrders(current, nextOrders) : nextOrders));
      setPage(Number(data.page || nextPage));
      setTotalOrders(Number(data.total || nextOrders.length));
      setHasMore(Number(data.page || nextPage) < Number(data.pages || 1));
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = () => {
    setRefreshing(true);
    load(1, false, true);
  };

  const loadMore = () => {
    if (loading || refreshing || loadingMore || !hasMore) return;
    load(page + 1, true);
  };

  const handleReorder = async (order) => {
    try {
      setReorderingId(order.id);
      await reorderOrder(order.id);
      navigation.navigate('Cart');
    } catch (error) {
      Alert.alert('Could not reorder', error?.message || 'Please try again');
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <View style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View>
          <Text style={styles.title}>Your Orders</Text>
          <Text style={styles.sub}>{totalOrders || orders.length} orders</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => String(order.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.45}
          ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
          ListFooterComponent={(
            <View style={styles.footer}>
              {loadingMore ? (
                <ActivityIndicator color={Colors.primary} />
              ) : !hasMore && orders.length ? (
                <Text style={styles.footerText}>You have reached the end</Text>
              ) : null}
            </View>
          )}
          renderItem={({ item: order }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.86}
              onPress={() => navigation.navigate('OrderTracking', { orderId: order.id, order })}
            >
              <View style={styles.row}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={[styles.badge, statusStyle(order.status)]}>{order.status}</Text>
              </View>
              <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
              <Text style={styles.slot}>{order.deliverySlotLabel || 'Instant delivery'}</Text>
              <Text style={styles.itemText} numberOfLines={1}>
                {(order.items || []).map((item) => `${item.product?.title || 'Product'} x ${item.quantity}`).join(', ')}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.total}>{money(order.finalAmount)}</Text>
                {order.deliveryOtp && order.status !== 'DELIVERED' ? (
                  <Text style={styles.otp}>OTP {order.deliveryOtp}</Text>
                ) : null}
              </View>
              {canReorder(order.status) ? (
                <TouchableOpacity
                  style={[styles.reorderButton, reorderingId === order.id && styles.reorderButtonDisabled]}
                  activeOpacity={0.82}
                  disabled={reorderingId === order.id}
                  onPress={() => handleReorder(order)}
                >
                  {reorderingId === order.id ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.reorderButtonText}>Reorder</Text>
                  )}
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function mergeOrders(current, incoming) {
  const seen = new Set(current.map((order) => order.id));
  return [...current, ...incoming.filter((order) => !seen.has(order.id))];
}

function statusStyle(status) {
  if (status === 'DELIVERED') return styles.delivered;
  if (status === 'SHIPPED') return styles.shipped;
  if (status === 'CANCELLED') return styles.cancelled;
  return styles.pending;
}

function canReorder(status) {
  return ['DELIVERED', 'CANCELLED'].includes(status);
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primaryLight, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, paddingBottom: 50 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: 16, marginBottom: 12, ...Shadow.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  orderId: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' },
  badge: { overflow: 'hidden', borderRadius: Radius.full, paddingHorizontal: 9, paddingVertical: 4, color: Colors.white, fontSize: FontSize.xxs, fontWeight: '900' },
  pending: { backgroundColor: Colors.warning },
  shipped: { backgroundColor: Colors.secondary },
  delivered: { backgroundColor: Colors.success },
  cancelled: { backgroundColor: Colors.danger },
  date: { marginTop: 7, color: Colors.textMuted, fontSize: FontSize.xs },
  slot: { marginTop: 5, color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '800' },
  itemText: { marginTop: 8, color: Colors.textSecondary, fontSize: FontSize.sm },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  total: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '900' },
  otp: { color: Colors.textPrimary, backgroundColor: Colors.warningLight, borderRadius: Radius.sm, paddingHorizontal: 9, paddingVertical: 5, fontSize: FontSize.xs, fontWeight: '900' },
  reorderButton: { marginTop: 12, backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' },
  reorderButtonDisabled: { opacity: 0.65 },
  reorderButtonText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60 },
  footer: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  footerText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
});
