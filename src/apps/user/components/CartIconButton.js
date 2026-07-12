import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../theme/theme';
import { useCartCount } from '../context/CartContext';

export default function CartIconButton({ navigation, style }) {
  const { count, refreshCartCount } = useCartCount();
  useFocusEffect(useCallback(() => { refreshCartCount(); }, [refreshCartCount]));
  return <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })} accessibilityLabel={`Open cart, ${count} items`}>
    <Feather name="shopping-cart" size={20} color={Colors.primary} />
    {count > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text></View> : null}
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: -5, right: -5, minWidth: 19, height: 19, borderRadius: 10, paddingHorizontal: 4, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '900' },
});
