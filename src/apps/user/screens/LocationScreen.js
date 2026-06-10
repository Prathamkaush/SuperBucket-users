import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';

export default function LocationScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('Home');
  const [form, setForm] = useState({ house: '', landmark: '', area: '', floor: '', notes: '' });
  const addressTypes = ['Home', 'Work', 'Other'];
  const handleSave = () => navigation.replace('MainTabs');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Delivery Location</Text>
        <Text style={styles.headerSub}>Where should we deliver your orders?</Text>
      </View>
      <ScrollView contentContainerStyle={styles.bodyContent}>
        <TouchableOpacity style={styles.locationBtn} activeOpacity={0.85}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationBtnTitle}>Use Current Location</Text>
            <Text style={styles.locationBtnSub}>Auto-detect your address</Text>
          </View>
          <Text style={{ fontSize: 20, color: Colors.primary }}>→</Text>
        </TouchableOpacity>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or enter manually</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.typeRow}>
          {addressTypes.map((type) => (
            <TouchableOpacity key={type} style={[styles.typeChip, selectedType === type && styles.typeChipActive]} onPress={() => setSelectedType(type)}>
              <Text style={[styles.typeChipText, selectedType === type && styles.typeChipTextActive]}>
                {type === 'Home' ? '🏠' : type === 'Work' ? '💼' : '📌'} {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {[
          { key: 'house', label: 'House / Flat No.*', placeholder: 'e.g. Flat 302, Block B' },
          { key: 'area', label: 'Area / Colony*', placeholder: 'e.g. Sector 14, Gurugram' },
          { key: 'landmark', label: 'Landmark', placeholder: 'e.g. Near SBI ATM' },
          { key: 'floor', label: 'Floor', placeholder: 'e.g. 3rd Floor' },
          { key: 'notes', label: 'Delivery Notes', placeholder: 'e.g. Ring bell twice' },
        ].map(({ key, label, placeholder }) => (
          <View key={key} style={{ marginBottom: 14 }}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={[styles.input, key === 'notes' && { height: 80, textAlignVertical: 'top' }]}
              placeholder={placeholder}
              placeholderTextColor={Colors.textMuted}
              value={form[key]}
              onChangeText={(val) => setForm({ ...form, [key]: val })}
              multiline={key === 'notes'}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>💾  SAVE ADDRESS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingTop: 56, paddingBottom: 24, paddingHorizontal: Spacing.xl },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  bodyContent: { padding: Spacing.xl, paddingBottom: 40 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, padding: Spacing.lg, marginBottom: 20 },
  locationIcon: { fontSize: 28, marginRight: 12 },
  locationBtnTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  locationBtnSub: { fontSize: FontSize.xs, color: Colors.primaryDark, marginTop: 2 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 12, fontSize: FontSize.xs, color: Colors.textMuted },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeChipText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.primary },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: FontSize.md, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 10, ...Shadow.sm },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md, letterSpacing: 1 },
});
