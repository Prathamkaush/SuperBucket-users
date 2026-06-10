import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

export default function ParcelScreen({ navigation }) {
  const [form, setForm] = useState({ pickup: '', delivery: '', parcelType: '', weight: '' });
  const parcelTypes = ['Document', 'Clothes', 'Electronics', 'Food', 'Other'];
  const [selectedType, setSelectedType] = useState('Document');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Parcel Pickup & Drop</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}>
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <View style={styles.dot} />
            <TextInput
              style={styles.addressInput}
              placeholder="Pickup address"
              placeholderTextColor={Colors.textMuted}
              value={form.pickup}
              onChangeText={(v) => setForm({ ...form, pickup: v })}
            />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.addressRow}>
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <TextInput
              style={styles.addressInput}
              placeholder="Delivery address"
              placeholderTextColor={Colors.textMuted}
              value={form.delivery}
              onChangeText={(v) => setForm({ ...form, delivery: v })}
            />
          </View>
        </View>

        <Text style={styles.label}>Parcel Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {parcelTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeChipText, selectedType === type && { color: Colors.white }]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Weight Estimate</Text>
        <View style={styles.weightRow}>
          {['< 0.5 kg', '0.5–2 kg', '2–5 kg', '5+ kg'].map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.weightChip, form.weight === w && styles.weightChipActive]}
              onPress={() => setForm({ ...form, weight: w })}
            >
              <Text style={[styles.weightChipText, form.weight === w && { color: Colors.primary }]}>{w}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Estimated Price</Text>
          <Text style={styles.pricingAmount}>₹ 39 – ₹ 79</Text>
          <Text style={styles.pricingSub}>Based on distance & weight</Text>
        </View>

        <TouchableOpacity style={styles.btn} activeOpacity={0.85}>
          <Text style={styles.btnText}>🚴  Schedule Pickup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnOutline]} activeOpacity={0.85}>
          <Text style={[styles.btnText, { color: Colors.primary }]}>⚡  Next Slot Delivery</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  addressCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, marginBottom: 20, ...Shadow.md },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary, marginRight: 12 },
  dottedLine: { width: 1, height: 24, borderLeftWidth: 2, borderLeftColor: Colors.border, borderStyle: 'dashed', marginLeft: 5, marginVertical: 4 },
  addressInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, paddingVertical: 10 },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white, marginRight: 8 },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  typeChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  weightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  weightChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  weightChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  weightChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  pricingCard: { backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 16, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
  pricingTitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  pricingAmount: { fontSize: 32, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  pricingSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginBottom: 12, ...Shadow.sm },
  btnOutline: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md, letterSpacing: 0.5 },
});
