import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const TRANSACTIONS = [
  { id: '1', type: 'credit', label: 'Cashback — Grocery Order', amount: '+₹24', time: 'Today, 3:30 PM', icon: '🎁' },
  { id: '2', type: 'debit', label: 'Order #SB2045 payment', amount: '-₹372', time: 'Yesterday, 7:10 PM', icon: '🛒' },
  { id: '3', type: 'credit', label: 'Change added by Rider', amount: '+₹28', time: 'Yesterday, 7:15 PM', icon: '🪙' },
  { id: '4', type: 'credit', label: 'Money added via UPI', amount: '+₹500', time: '25 May, 10:00 AM', icon: '💳' },
  { id: '5', type: 'debit', label: 'Order #SB2039 payment', amount: '-₹180', time: '24 May, 6:45 PM', icon: '🛒' },
];

export default function WalletScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>My Wallet</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₹ 240.00</Text>
        <Text style={styles.balanceSub}>Available for your next order</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          <View style={styles.actionDivider} />
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>🎁</Text>
            <Text style={styles.actionText}>Rewards</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 20 }}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 40 }}>
        {TRANSACTIONS.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? Colors.primaryLight : '#FFF0E6' }]}>
              <Text style={{ fontSize: 20 }}>{tx.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txLabel}>{tx.label}</Text>
              <Text style={styles.txTime}>{tx.time}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'credit' ? Colors.success : Colors.danger }]}>
              {tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  balanceCard: { backgroundColor: Colors.primary, marginHorizontal: Spacing.lg, marginTop: 16, borderRadius: Radius.xl, padding: 24, ...Shadow.lg },
  balanceLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceAmount: { fontSize: 44, fontWeight: '900', color: Colors.white },
  balanceSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: 20 },
  actionRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.md },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  actionIcon: { fontSize: 20, marginBottom: 4 },
  actionText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '600' },
  actionDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.md, padding: 14, marginBottom: 8, ...Shadow.sm },
  txIcon: { width: 44, height: 44, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  txTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  txAmount: { fontSize: FontSize.md, fontWeight: '800' },
});
