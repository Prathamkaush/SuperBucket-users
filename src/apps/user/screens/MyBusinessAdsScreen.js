import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  NativeModules,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TurboModuleRegistry,
  View,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';
import { getUploadUrl } from '../services/api';
import {
  createBusinessAdRazorpayOrder,
  deleteBusinessAd,
  getMyBusinessAds,
  payBusinessAdWithWallet,
  verifyBusinessAdRazorpayPayment,
} from '../services/homeOffers';

const STATUS = {
  PENDING_REVIEW: { label: 'Pending review', color: '#B45309', bg: '#FFF7E6' },
  APPROVED_AWAITING_PAYMENT: { label: 'Approved · Pay now', color: Colors.secondary, bg: Colors.secondaryLight },
  ACTIVE: { label: 'Active', color: Colors.success, bg: Colors.successLight },
  REJECTED: { label: 'Changes required', color: Colors.danger, bg: Colors.dangerLight },
  PAUSED: { label: 'Paused by admin', color: '#7C3AED', bg: '#F3E8FF' },
  EXPIRED: { label: 'Expired', color: Colors.gray600, bg: Colors.gray100 },
};

export default function MyBusinessAdsScreen({ navigation }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setAds(await getMyBusinessAds());
    } catch (error) {
      Alert.alert('Could not load ads', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const payWallet = (ad) => Alert.alert(
    'Pay from wallet?',
    `Rs ${Number(ad.priceSnapshot).toFixed(0)} will be deducted and your ${ad.durationDaysSnapshot}-day campaign will start immediately.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pay & activate', onPress: async () => {
        try {
          setWorkingId(ad.id);
          await payBusinessAdWithWallet(ad.id);
          await load();
          Alert.alert('Campaign activated', 'Your advertisement is now live.');
        } catch (error) {
          Alert.alert('Payment failed', error?.message || 'Please try again.');
        } finally { setWorkingId(null); }
      } },
    ],
  );

  const payOnline = async (ad) => {
    if (!NativeModules.RNRazorpayCheckout && !TurboModuleRegistry?.get?.('RNRazorpayCheckout')) {
      Alert.alert('Development build required', 'Online payment needs the installed EAS app build. You can use Wallet payment in this build.');
      return;
    }
    try {
      setWorkingId(ad.id);
      const order = await createBusinessAdRazorpayOrder(ad.id);
      const payment = await RazorpayCheckout.open({
        key: order.key,
        amount: order.amount,
        currency: 'INR',
        name: 'Superbucket Advertising',
        description: `${ad.durationDaysSnapshot}-day campaign for ${ad.businessName}`,
        order_id: order.razorpayOrderId,
        theme: { color: Colors.primary },
      });
      await verifyBusinessAdRazorpayPayment(ad.id, {
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      });
      await load();
      Alert.alert('Campaign activated', 'Your advertisement is now live.');
    } catch (error) {
      if (!/cancel/i.test(error?.description || error?.message || '')) Alert.alert('Payment failed', error?.description || error?.message || 'Please try again.');
    } finally { setWorkingId(null); }
  };

  const remove = (ad) => Alert.alert('Archive advertisement?', 'It will be removed from My Ads and stopped if active. Payments are not automatically refunded.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Archive', style: 'destructive', onPress: async () => {
      await deleteBusinessAd(ad.id);
      setAds((items) => items.filter((item) => item.id !== ad.id));
    } },
  ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}><Text style={styles.title}>My Ads</Text><Text style={styles.subtitle}>Manage, pay and monitor your campaigns</Text></View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdvertiseBusiness')}><Feather name="plus" size={18} color={Colors.white} /></TouchableOpacity>
      </View>

      {loading ? <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View> : (
        <FlatList
          data={ads}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.empty}><Feather name="airplay" size={32} color={Colors.primary} /><Text style={styles.emptyTitle}>No advertisements yet</Text><Text style={styles.emptyText}>Create your first local business campaign.</Text></View>}
          renderItem={({ item }) => {
            const state = STATUS[item.status] || STATUS.PENDING_REVIEW;
            const editable = ['PENDING_REVIEW', 'REJECTED', 'APPROVED_AWAITING_PAYMENT'].includes(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.topRow}>
                  {item.imageUrl ? <Image source={{ uri: getUploadUrl('business-ads', item.imageUrl) }} style={styles.image} /> : <View style={styles.imageFallback}><Feather name="image" size={22} color={Colors.primary} /></View>}
                  <View style={styles.copy}>
                    <Text style={styles.name} numberOfLines={1}>{item.businessName}</Text>
                    <Text style={styles.plan}>{item.plan?.name || 'Campaign'} · Rs {Number(item.priceSnapshot).toFixed(0)} · {item.durationDaysSnapshot} days</Text>
                    <View style={[styles.status, { backgroundColor: state.bg }]}><Text style={[styles.statusText, { color: state.color }]}>{state.label}</Text></View>
                  </View>
                </View>

                {item.status === 'ACTIVE' ? <View style={styles.metricRow}><Metric label="Days left" value={String(item.daysRemaining ?? 0)} /><Metric label="Views" value={String(item.views || 0)} /><Metric label="Clicks" value={String(item.clicks || 0)} /></View> : null}
                {item.rejectionReason ? <View style={styles.reason}><Text style={styles.reasonTitle}>ADMIN FEEDBACK</Text><Text style={styles.reasonText}>{item.rejectionReason}</Text></View> : null}

                {item.status === 'APPROVED_AWAITING_PAYMENT' ? (
                  <View style={styles.paymentRow}>
                    <TouchableOpacity style={styles.walletButton} disabled={workingId === item.id} onPress={() => payWallet(item)}><Text style={styles.walletButtonText}>PAY WITH WALLET</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.onlineButton} disabled={workingId === item.id} onPress={() => payOnline(item)}>{workingId === item.id ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.onlineButtonText}>PAY ONLINE</Text>}</TouchableOpacity>
                  </View>
                ) : null}

                <View style={styles.actions}>
                  {editable ? <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdvertiseBusiness', { ad: item })}><Feather name="edit-2" size={14} color={Colors.secondary} /><Text style={styles.editText}>Edit</Text></TouchableOpacity> : null}
                  <TouchableOpacity style={styles.actionButton} onPress={() => remove(item)}><Feather name="archive" size={14} color={Colors.danger} /><Text style={styles.archiveText}>Archive</Text></TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function Metric({ label, value }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 48, paddingBottom: 15, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerCopy: { flex: 1 }, title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' }, subtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  addButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, list: { padding: Spacing.lg, paddingBottom: 80 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 13, marginBottom: 13, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  topRow: { flexDirection: 'row', gap: 12 }, image: { width: 82, height: 70, borderRadius: Radius.md }, imageFallback: { width: 82, height: 70, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 }, name: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' }, plan: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', marginTop: 4 },
  status: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 4, marginTop: 7 }, statusText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  metricRow: { flexDirection: 'row', marginTop: 13, borderRadius: Radius.md, backgroundColor: Colors.gray50, paddingVertical: 10 }, metric: { flex: 1, alignItems: 'center' }, metricValue: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' }, metricLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: '700', marginTop: 2 },
  reason: { marginTop: 12, borderRadius: Radius.md, padding: 11, backgroundColor: Colors.dangerLight }, reasonTitle: { color: Colors.danger, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 }, reasonText: { color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 17, marginTop: 4 },
  paymentRow: { flexDirection: 'row', gap: 8, marginTop: 13 }, walletButton: { flex: 1, minHeight: 42, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' }, walletButtonText: { color: Colors.secondary, fontSize: 9, fontWeight: '900' }, onlineButton: { flex: 1, minHeight: 42, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, onlineButtonText: { color: Colors.white, fontSize: 9, fontWeight: '900' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider }, actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6 }, editText: { color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '800' }, archiveText: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '800' },
  empty: { marginTop: 90, alignItems: 'center' }, emptyTitle: { marginTop: 13, color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' }, emptyText: { marginTop: 5, color: Colors.textMuted, fontSize: FontSize.xs },
});
