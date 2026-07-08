import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  TurboModuleRegistry,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import StatusDialog from '../components/StatusDialog';
import { getCart, removeCartItem, updateCartItem } from '../services/cart';
import { getAddresses } from '../services/addresses';
import { getMyOrder, placeOrder, previewOrder } from '../services/orders';
import { getSettings } from '../services/settings';
import { getWallet } from '../services/wallet';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/payments';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
const DAY_OPTIONS = [
  { label: 'Today', offset: 0 },
  { label: 'Tomorrow', offset: 1 },
  { label: 'Day after tomorrow', offset: 2 },
];
const DEFAULT_SLOT_TIMES = ['10:00 AM', '1:00 PM', '5:00 PM', '8:00 PM'];

export default function CartScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [deliveryMode, setDeliveryMode] = useState('INSTANT');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [slotTimes, setSlotTimes] = useState(DEFAULT_SLOT_TIMES);
  const [selectedSlot, setSelectedSlot] = useState(DEFAULT_SLOT_TIMES[0]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [statusDialog, setStatusDialog] = useState(null);

  const loadCart = useCallback(async () => {
    try {
      const [cartItems, savedAddresses, settings, walletData] = await Promise.all([
        getCart(),
        getAddresses().catch(() => []),
        getSettings().catch(() => ({})),
        getWallet().catch(() => null),
      ]);
      setItems(cartItems);
      setAddresses(savedAddresses);
      setWalletBalance(Number(walletData?.wallet?.balance || 0));
      const times = Array.isArray(settings.deliverySlotTimes) && settings.deliverySlotTimes.length
        ? settings.deliverySlotTimes
        : DEFAULT_SLOT_TIMES;
      setSlotTimes(times);
      setSelectedSlot((current) => (times.includes(current) ? current : times[0]));
      setSelectedAddressId((current) => {
        if (savedAddresses.some((address) => address.id === current)) return current;
        return (savedAddresses.find((address) => address.isDefault) || savedAddresses[0])?.id || null;
      });
    } catch (error) {
      Alert.alert('Could not load cart', error?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart]),
  );

  const changeQuantity = async (item, nextQuantity) => {
    if (updatingId) return;
    setUpdatingId(item.id);

    try {
      if (nextQuantity < 1) {
        await removeCartItem(item.id);
        setItems((current) => current.filter((entry) => entry.id !== item.id));
      } else {
        await updateCartItem(item.id, nextQuantity);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, quantity: nextQuantity } : entry,
          ),
        );
      }
    } catch (error) {
      Alert.alert('Could not update cart', error?.message || 'Please try again');
    } finally {
      setUpdatingId(null);
    }
  };

  const totals = useMemo(
    () =>
      items.reduce(
        (result, item) => {
          result.quantity += item.quantity;
          result.subtotal += item.price * item.quantity;
          result.gst += item.gstAmount * item.quantity;
          return result;
        },
        { quantity: 0, subtotal: 0, gst: 0 },
      ),
    [items],
  );
  const total = totals.subtotal + totals.gst;
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId);

  const showOrderSuccess = async (order) => {
    const orderWithOtp = order.deliveryOtp || !order.orderId
      ? order
      : await getMyOrder(order.orderId).catch(() => order);
    setStatusDialog({
      tone: 'success',
      title: 'Order placed',
      message: `Your order #${order.orderId} has been placed successfully.`,
      detail: orderWithOtp.deliveryOtp
        ? `Delivery OTP: ${orderWithOtp.deliveryOtp}\nShare it only when the order reaches you.`
        : 'Delivery OTP will appear in tracking once it is available.',
      primaryLabel: 'Track order',
      secondaryLabel: 'Close',
      onPrimary: () => {
        setStatusDialog(null);
        navigation.getParent()?.navigate('OrderTracking', { order: orderWithOtp });
      },
    });
  };

  const handleCheckout = async () => {
    if (!addresses.length) {
      navigation.navigate('Location', { returnToCart: true });
      return;
    }

    if (!selectedAddressId) {
      Alert.alert('Select address', 'Choose where this order should be delivered.');
      return;
    }

    try {
      setPlacing(true);
      const scheduled = deliveryMode === 'SCHEDULED'
        ? buildScheduledSlot(selectedDayOffset, selectedSlot)
        : null;

      if (paymentMethod === 'RAZORPAY') {
        if (!isRazorpayNativeModuleAvailable()) {
          throw new Error(
            'Online payment is not available in this app build. Create and install a new EAS development/preview build after adding Razorpay.',
          );
        }

        const preview = await previewOrder({
          addressId: selectedAddressId,
          paymentMethod: 'RAZORPAY',
        });
        const payable = Number(preview?.pricing?.payable || total);
        const razorpayOrder = await createRazorpayOrder(payable);
        const payment = await RazorpayCheckout.open({
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'Superbuket',
          description: 'Order payment',
          order_id: razorpayOrder.razorpayOrderId,
          prefill: {
            name: selectedAddress?.name || '',
            contact: selectedAddress?.phone || '',
          },
          theme: { color: Colors.primary },
        });
        const order = await verifyRazorpayPayment({
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
          addressId: selectedAddressId,
          deliveryMode,
          scheduledDeliveryAt: scheduled?.date.toISOString(),
          deliverySlotLabel: scheduled?.label,
        });

        await showOrderSuccess(order);
        return;
      }

      if (paymentMethod === 'WALLET' && walletBalance < total) {
        Alert.alert(
          'Insufficient wallet balance',
          `Your wallet has ${money(walletBalance)}. Please add money or choose another payment method.`,
        );
        return;
      }

      const order = await placeOrder({
        addressId: selectedAddressId,
        paymentMethod,
        deliveryMode,
        scheduledDeliveryAt: scheduled?.date.toISOString(),
        deliverySlotLabel: scheduled?.label,
      });
      await showOrderSuccess(order);
    } catch (error) {
      const rawMessage = error?.description || error?.message || '';
      const message = /Cannot read property 'open' of null|Cannot read properties of null.*open|RNRazorpayCheckout/i.test(rawMessage)
        ? 'Online payment is not available in this app build. Create and install a new EAS development/preview build after adding Razorpay.'
        : /cancel/i.test(rawMessage)
        ? 'Payment was cancelled.'
        : rawMessage || 'Please try again';
      setStatusDialog({
        tone: 'error',
        title: paymentMethod === 'RAZORPAY' ? 'Payment failed' : 'Could not place order',
        message,
        detail: paymentMethod === 'RAZORPAY'
          ? 'You can try again or switch to Cash on delivery.'
          : 'Please review your cart details and try again.',
        primaryLabel: 'OK',
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={styles.itemCount}>{totals.quantity} items</Text>
      </View>

      {loading && !items.length ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Loading your cart...</Text>
        </View>
      ) : !items.length ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyMark}>0</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.stateText}>Add products to see them here.</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Grocery')}
          >
            <Text style={styles.shopButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            refreshing={loading}
            onRefresh={loadCart}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.itemImageBox}>
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.itemImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.imageFallback}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    {item.option ? <Text style={styles.itemOption}>{item.option}</Text> : null}
                    <Text style={styles.itemPrice}>{money(item.price)} each</Text>
                  </View>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      disabled={updatingId === item.id}
                      onPress={() => changeQuantity(item, item.quantity - 1)}
                    >
                      <Text style={styles.qtyButtonText}>
                        {item.quantity === 1 ? 'x' : '-'}
                      </Text>
                    </TouchableOpacity>
                    {updatingId === item.id ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Text style={styles.qtyCount}>{item.quantity}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.qtyButton}
                      disabled={updatingId === item.id}
                      onPress={() => changeQuantity(item, item.quantity + 1)}
                    >
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Deliver to</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Location', { returnToCart: true, addNew: true })}
                >
                  <Text style={styles.linkText}>{addresses.length ? 'Add new' : 'Add address'}</Text>
                </TouchableOpacity>
              </View>

              {addresses.length ? (
                addresses.map((address) => {
                  const active = address.id === selectedAddressId;
                  return (
                    <TouchableOpacity
                      key={address.id}
                      style={[styles.addressCard, active && styles.addressCardActive]}
                      activeOpacity={0.86}
                      onPress={() => setSelectedAddressId(address.id)}
                    >
                      <View style={styles.addressTopRow}>
                        <Text style={styles.addressName}>{address.name} · {address.phone}</Text>
                        {active ? <Text style={styles.selectedBadge}>Selected</Text> : null}
                      </View>
                      <Text style={styles.addressText}>
                        {address.street}, {address.city}, {address.state} {address.pincode}
                      </Text>
                      {address.isDefault ? <Text style={styles.defaultBadge}>Default address</Text> : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyAddressCard}>
                  <Text style={styles.emptyAddressTitle}>No saved address</Text>
                  <Text style={styles.emptyAddressText}>Add a delivery address once and reuse it for checkout.</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery speed</Text>
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[styles.modeCard, deliveryMode === 'INSTANT' && styles.modeCardActive]}
                  onPress={() => setDeliveryMode('INSTANT')}
                >
                  <Text style={styles.modeTitle}>Instant</Text>
                  <Text style={styles.modeSub}>10-15 min after dispatch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeCard, deliveryMode === 'SCHEDULED' && styles.modeCardActive]}
                  onPress={() => setDeliveryMode('SCHEDULED')}
                >
                  <Text style={styles.modeTitle}>Schedule</Text>
                  <Text style={styles.modeSub}>Pick a day and time</Text>
                </TouchableOpacity>
              </View>

              {deliveryMode === 'SCHEDULED' ? (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {DAY_OPTIONS.map((day) => (
                      <TouchableOpacity
                        key={day.offset}
                        style={[styles.chip, selectedDayOffset === day.offset && styles.chipActive]}
                        onPress={() => setSelectedDayOffset(day.offset)}
                      >
                        <Text style={[styles.chipText, selectedDayOffset === day.offset && styles.chipTextActive]}>{day.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {slotTimes.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.chip, selectedSlot === slot && styles.chipActive]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text style={[styles.chipText, selectedSlot === slot && styles.chipTextActive]}>{slot}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bill Summary</Text>
              <View style={styles.billCard}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Items subtotal</Text>
                  <Text style={styles.billValue}>{money(totals.subtotal)}</Text>
                </View>
                {totals.gst > 0 ? (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>GST</Text>
                    <Text style={styles.billValue}>{money(totals.gst)}</Text>
                  </View>
                ) : null}
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery</Text>
                  <Text style={styles.deliveryText}>Calculated at checkout</Text>
                </View>
                {selectedAddress ? (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Ship to</Text>
                    <Text style={styles.billValue}>{selectedAddress.pincode}</Text>
                  </View>
                ) : null}
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery slot</Text>
                  <Text style={styles.billValue}>
                    {deliveryMode === 'SCHEDULED'
                      ? buildScheduledSlot(selectedDayOffset, selectedSlot).label
                      : 'Instant delivery'}
                  </Text>
                </View>
                <View style={[styles.billRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Cart total</Text>
                  <Text style={styles.totalValue}>{money(total)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment method</Text>
              <View style={styles.paymentRow}>
                <TouchableOpacity
                  style={[styles.paymentCard, paymentMethod === 'COD' && styles.paymentCardActive]}
                  onPress={() => setPaymentMethod('COD')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.paymentTitle}>Cash on delivery</Text>
                  <Text style={styles.paymentSub}>Pay when your order arrives</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentCard, paymentMethod === 'RAZORPAY' && styles.paymentCardActive]}
                  onPress={() => setPaymentMethod('RAZORPAY')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.paymentTitle}>Online</Text>
                  <Text style={styles.paymentSub}>UPI, cards, wallets</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentCard, paymentMethod === 'WALLET' && styles.paymentCardActive]}
                  onPress={() => setPaymentMethod('WALLET')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.paymentTitle}>Wallet Pay</Text>
                  <Text style={styles.paymentSub}>Balance {money(walletBalance)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerTotal}>{money(total)}</Text>
              <Text style={styles.footerSub}>Before delivery charges</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, placing && styles.checkoutDisabled]}
              disabled={placing}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              {placing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.checkoutText}>
                  {addresses.length
                    ? paymentMethod === 'RAZORPAY'
                      ? 'PAY ONLINE'
                      : paymentMethod === 'WALLET'
                      ? 'PAY FROM WALLET'
                      : 'PLACE ORDER'
                    : 'ADD ADDRESS'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
      <StatusDialog
        visible={Boolean(statusDialog)}
        tone={statusDialog?.tone}
        title={statusDialog?.title}
        message={statusDialog?.message}
        detail={statusDialog?.detail}
        primaryLabel={statusDialog?.primaryLabel}
        secondaryLabel={statusDialog?.secondaryLabel}
        onPrimary={statusDialog?.onPrimary || (() => setStatusDialog(null))}
        onSecondary={() => setStatusDialog(null)}
        onClose={() => setStatusDialog(null)}
      />
    </View>
  );
}

function isRazorpayNativeModuleAvailable() {
  return Boolean(NativeModules.RNRazorpayCheckout || TurboModuleRegistry?.get?.('RNRazorpayCheckout'));
}

function buildScheduledSlot(offset, timeLabel) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const match = String(timeLabel || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridian = match[3].toUpperCase();
    if (meridian === 'PM' && hours !== 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
  }
  const dayLabel = DAY_OPTIONS.find((day) => day.offset === offset)?.label || 'Scheduled';
  return { date, label: `${dayLabel}, ${timeLabel}` };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primaryLight,
  },
  headerTitle: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '700' },
  itemCount: { color: Colors.textMuted, fontSize: FontSize.sm },
  content: { paddingBottom: 130 },
  section: { marginTop: 16, paddingHorizontal: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { marginBottom: 10, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  linkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '800' },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  addressCard: {
    marginBottom: 8,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  addressCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  addressTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  addressName: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800' },
  addressText: { marginTop: 5, color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 18 },
  selectedBadge: { color: Colors.primary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  defaultBadge: { marginTop: 8, color: Colors.success, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  emptyAddressCard: {
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
  },
  emptyAddressTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800' },
  emptyAddressText: { marginTop: 4, color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 18 },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, backgroundColor: Colors.white },
  modeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  modeTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' },
  modeSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4, lineHeight: 17 },
  chipRow: { gap: 8, paddingTop: 12 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: Colors.white },
  chipActive: { borderColor: Colors.secondary, backgroundColor: Colors.secondaryLight },
  chipText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '800' },
  chipTextActive: { color: Colors.secondary },
  itemImageBox: {
    width: 58,
    height: 58,
    marginRight: 12,
    overflow: 'hidden',
    borderRadius: Radius.sm,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: { width: '100%', height: '100%' },
  imageFallback: { color: Colors.primary, fontSize: 24, fontWeight: '900' },
  itemCopy: { flex: 1, paddingRight: 8 },
  itemName: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '700' },
  itemOption: { marginTop: 2, color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '700' },
  itemPrice: { marginTop: 3, color: Colors.textMuted, fontSize: FontSize.xs },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  qtyCount: { minWidth: 20, textAlign: 'center', color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700' },
  billCard: { padding: 16, borderRadius: Radius.md, backgroundColor: Colors.white, ...Shadow.sm },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  billLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  billValue: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '600' },
  deliveryText: { color: Colors.success, fontSize: FontSize.xs, fontWeight: '700' },
  totalRow: { marginTop: 4, marginBottom: 0, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700' },
  totalValue: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '800' },
  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentCard: {
    flex: 1,
    minHeight: 76,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 13,
    backgroundColor: Colors.white,
    justifyContent: 'center',
  },
  paymentCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  paymentTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' },
  paymentSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4, lineHeight: 17 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyMark: {
    width: 72,
    height: 72,
    paddingTop: 17,
    borderRadius: 36,
    overflow: 'hidden',
    textAlign: 'center',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  emptyTitle: { marginTop: 16, color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  stateText: { marginTop: 8, color: Colors.textMuted, textAlign: 'center' },
  shopButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.primary },
  shopButtonText: { color: Colors.white, fontWeight: '800' },
  footer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    ...Shadow.lg,
  },
  footerTotal: { color: Colors.primary, fontSize: FontSize.xxl, fontWeight: '800' },
  footerSub: { color: Colors.textMuted, fontSize: FontSize.xs },
  checkoutButton: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.primary },
  checkoutDisabled: { opacity: 0.65 },
  checkoutText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1 },
});
