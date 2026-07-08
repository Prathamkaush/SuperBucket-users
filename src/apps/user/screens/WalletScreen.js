import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  NativeModules,
  TurboModuleRegistry,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { createWalletTopupOrder, getWallet, verifyWalletTopupPayment } from '../services/wallet';

const CREDIT_AMOUNTS = [100, 250, 500];

export default function WalletScreen({ navigation }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const loadWallet = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getWallet();
      setBalance(Number(data.wallet?.balance || 0));
      setTransactions(data.transactions || []);
    } catch (e) {
      Alert.alert('Wallet unavailable', e.message || 'Could not load wallet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const addCredit = async (amount) => {
    const nextAmount = Number(amount);
    if (!Number.isFinite(nextAmount) || nextAmount < 100) {
      Alert.alert('Minimum amount', 'Please add at least Rs 100 to your wallet.');
      return;
    }

    setAdding(true);
    try {
      if (!isRazorpayNativeModuleAvailable()) {
        throw new Error(
          'Wallet top-up is not available in this app build. Create and install a new EAS development/preview build after adding Razorpay.',
        );
      }

      const razorpayOrder = await createWalletTopupOrder(nextAmount);
      const payment = await RazorpayCheckout.open({
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'Superbuket',
        description: 'Wallet top-up',
        order_id: razorpayOrder.razorpayOrderId,
        theme: { color: Colors.primary },
      });
      await verifyWalletTopupPayment({
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
        amount: nextAmount,
      });
      await loadWallet(true);
      setCustomAmount('');
      Alert.alert('Wallet credited', `Rs ${nextAmount.toFixed(2)} added successfully.`);
    } catch (e) {
      const message = /cancel/i.test(e?.description || e?.message || '')
        ? 'Payment was cancelled.'
        : e.message || e.description || 'Try again';
      Alert.alert('Could not add credit', message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>My Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadWallet(true);
            }}
            tintColor={Colors.primary}
          />
        )}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          {loading ? (
            <ActivityIndicator color={Colors.white} style={{ marginVertical: 12 }} />
          ) : (
            <Text style={styles.balanceAmount}>Rs {balance.toFixed(2)}</Text>
          )}
          <Text style={styles.balanceSub}>Wallet credits are separate from Razorpay order payments</Text>
          <View style={styles.actionRow}>
            {CREDIT_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.actionBtn}
                disabled={adding}
                onPress={() => addCredit(amount)}
              >
                <Text style={styles.actionIcon}>+</Text>
                <Text style={styles.actionText}>Rs {amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customTopupBox}>
            <TextInput
              style={styles.customInput}
              value={customAmount}
              onChangeText={(value) => setCustomAmount(value.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              placeholder="Enter custom amount"
              placeholderTextColor="rgba(255,255,255,0.65)"
            />
            <TouchableOpacity
              style={[styles.customAddBtn, adding && styles.customAddBtnDisabled]}
              disabled={adding}
              onPress={() => addCredit(Number(customAmount))}
            >
              {adding ? <ActivityIndicator color={Colors.primary} size="small" /> : <Text style={styles.customAddText}>Add</Text>}
            </TouchableOpacity>
          </View>
          <Text style={styles.minimumText}>Minimum top-up Rs 100</Text>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 20 }}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg }}>
          {!loading && !transactions.length ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No wallet activity yet</Text>
              <Text style={styles.emptyText}>Added wallet credits and refunds will appear here.</Text>
            </View>
          ) : null}

          {transactions.map((tx) => {
            const credit = tx.type === 'CREDIT';
            return (
              <View key={tx.id} style={styles.txCard}>
                <View style={[styles.txIcon, { backgroundColor: credit ? Colors.primaryLight : '#FFF0E6' }]}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: credit ? Colors.success : Colors.danger }}>
                    {credit ? '+' : '-'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txLabel}>{tx.label}</Text>
                  <Text style={styles.txTime}>{formatDate(tx.createdAt)}</Text>
                </View>
                <Text style={[styles.txAmount, { color: credit ? Colors.success : Colors.danger }]}>
                  {credit ? '+' : '-'}Rs {Number(tx.amount || 0).toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

function isRazorpayNativeModuleAvailable() {
  return Boolean(NativeModules.RNRazorpayCheckout || TurboModuleRegistry?.get?.('RNRazorpayCheckout'));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  balanceCard: { backgroundColor: Colors.primary, marginHorizontal: Spacing.lg, marginTop: 16, borderRadius: Radius.xl, padding: 24, ...Shadow.lg },
  balanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceAmount: { fontSize: 40, fontWeight: '900', color: Colors.white },
  balanceSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4, marginBottom: 20 },
  actionRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  actionIcon: { fontSize: 20, marginBottom: 4, color: Colors.white, fontWeight: '900' },
  actionText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '600' },
  customTopupBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  customInput: {
    flex: 1,
    color: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: Radius.md,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  customAddBtn: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  customAddBtnDisabled: { opacity: 0.7 },
  customAddText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '900' },
  minimumText: { color: 'rgba(255,255,255,0.68)', fontSize: FontSize.xs, marginTop: 8 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, marginBottom: 8, ...Shadow.sm },
  txIcon: { width: 44, height: 44, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  txTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: FontSize.md, fontWeight: '800' },
  emptyCard: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: 18, ...Shadow.sm },
  emptyTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  emptyText: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6 },
});
