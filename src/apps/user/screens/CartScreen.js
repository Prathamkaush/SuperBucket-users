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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getCart, removeCartItem, updateCartItem } from '../services/cart';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

export default function CartScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadCart = useCallback(async () => {
    try {
      const cartItems = await getCart();
      setItems(cartItems);
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
                <View style={[styles.billRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Cart total</Text>
                  <Text style={styles.totalValue}>{money(total)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerTotal}>{money(total)}</Text>
              <Text style={styles.footerSub}>Before delivery charges</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() =>
                navigation.navigate('Location', { returnToCart: true })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
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
  sectionTitle: { marginBottom: 10, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '700' },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
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
  checkoutText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1 },
});
