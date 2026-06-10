import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const CART_ITEMS = [
  { id: '1', name: 'Fortune Sunflower Oil', qty: 1, price: 145, icon: '🫙' },
  { id: '2', name: 'Aashirvaad Atta 5kg', qty: 2, price: 265, icon: '🌾' },
  { id: '3', name: 'Tata Tea Gold', qty: 1, price: 280, icon: '🍵' },
];

export default function CartScreen({ navigation }) {
  const [items, setItems] = useState(CART_ITEMS);
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = subtotal > 299 ? 0 : 25;
  const total = subtotal + deliveryFee;

  const paymentMethods = [
    { key: 'wallet', icon: '💰', label: 'Superbuket Wallet', sub: 'Balance: ₹240' },
    { key: 'upi', icon: '📲', label: 'UPI / Net Banking', sub: 'Instant payment' },
    { key: 'cod', icon: '💵', label: 'Cash on Delivery', sub: 'Pay when delivered' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Your Cart</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm }}>{items.length} items</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemIcon}>
                <Text style={{ fontSize: 30 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price} each</Text>
              </View>
              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyCount}>{item.qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.slotCard}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.slotTitle}>Evening Slot — 5 PM to 9 PM</Text>
              <Text style={styles.slotSub}>Estimated delivery: Today</Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <View style={styles.billCard}>
            {[
              { label: 'Subtotal', val: `₹${subtotal}` },
              { label: 'Delivery', val: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}` },
            ].map(({ label, val }) => (
              <View key={label} style={styles.billRow}>
                <Text style={styles.billLabel}>{label}</Text>
                <Text style={[styles.billVal, val === 'FREE' && { color: Colors.success }]}>{val}</Text>
              </View>
            ))}
            <View style={[styles.billRow, styles.billTotal]}>
              <Text style={styles.billTotalLabel}>Total</Text>
              <Text style={styles.billTotalVal}>₹{total}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((pm) => (
            <TouchableOpacity
              key={pm.key}
              style={[styles.paymentOption, paymentMethod === pm.key && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod(pm.key)}
            >
              <Text style={{ fontSize: 22, marginRight: 12 }}>{pm.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentLabel}>{pm.label}</Text>
                <Text style={styles.paymentSub}>{pm.sub}</Text>
              </View>
              <View style={[styles.radio, paymentMethod === pm.key && styles.radioActive]}>
                {paymentMethod === pm.key && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotal}>₹{total}</Text>
          <Text style={styles.footerSub}>Total amount</Text>
        </View>
        <TouchableOpacity style={styles.placeOrderBtn} onPress={() => navigation.navigate('OrderTracking')} activeOpacity={0.85}>
          <Text style={styles.placeOrderText}>PLACE ORDER →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  section: { paddingHorizontal: Spacing.lg, marginTop: 16 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.md, padding: 12, marginBottom: 8, ...Shadow.sm },
  itemIcon: { width: 50, height: 50, backgroundColor: Colors.gray100, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  itemPrice: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, backgroundColor: Colors.primary, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  qtyCount: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, minWidth: 20, textAlign: 'center' },
  slotCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.primary, padding: 14 },
  slotTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  slotSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  changeText: { fontSize: FontSize.sm, color: Colors.secondary, fontWeight: '700' },
  billCard: { backgroundColor: Colors.white, borderRadius: Radius.md, padding: 16, ...Shadow.sm },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  billVal: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  billTotal: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 4 },
  billTotalLabel: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  billTotalVal: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm },
  paymentOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  paymentLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  paymentSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: Colors.border, ...Shadow.lg },
  footerTotal: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  footerSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  placeOrderBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 14 },
  placeOrderText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.md, letterSpacing: 1 },
});
