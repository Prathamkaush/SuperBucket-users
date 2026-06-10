import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

export default function PrintDeliverScreen({ navigation }) {
  const [fileType, setFileType] = useState(null);
  const [colorMode, setColorMode] = useState('bw');
  const [copies, setCopies] = useState(1);
  const [staple, setStaple] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Print & Deliver</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingBottom: 40 }}>
        <Text style={styles.sectionTitle}>Upload File</Text>
        <View style={styles.uploadRow}>
          {[{ icon: '📄', label: 'Upload PDF', key: 'pdf' }, { icon: '🖼️', label: 'Upload Image', key: 'img' }].map((u) => (
            <TouchableOpacity
              key={u.key}
              style={[styles.uploadBox, fileType === u.key && styles.uploadBoxActive]}
              onPress={() => setFileType(u.key)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 36, marginBottom: 8 }}>{u.icon}</Text>
              <Text style={[styles.uploadLabel, fileType === u.key && { color: Colors.primary }]}>{u.label}</Text>
              <Text style={styles.uploadSub}>Tap to select</Text>
            </TouchableOpacity>
          ))}
        </View>

        {fileType && (
          <View style={styles.fileCard}>
            <Text style={{ fontSize: 22, marginRight: 10 }}>{fileType === 'pdf' ? '📄' : '🖼️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileName}>sample_document.{fileType}</Text>
              <Text style={styles.fileSize}>2.4 MB • 6 pages</Text>
            </View>
            <TouchableOpacity onPress={() => setFileType(null)}>
              <Text style={{ color: Colors.danger, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Print Options</Text>
        <View style={styles.optionCard}>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Color Mode</Text>
            <View style={styles.toggle}>
              {['bw', 'color'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.toggleBtn, colorMode === mode && styles.toggleBtnActive]}
                  onPress={() => setColorMode(mode)}
                >
                  <Text style={[styles.toggleText, colorMode === mode && { color: Colors.white }]}>
                    {mode === 'bw' ? 'B&W' : 'Color'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.optionRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14 }]}>
            <Text style={styles.optionLabel}>Number of Copies</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setCopies(Math.max(1, copies - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary }}>{copies}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setCopies(copies + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.optionRow, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14 }]}>
            <Text style={styles.optionLabel}>Staple</Text>
            <TouchableOpacity
              style={[styles.toggle, { width: 'auto' }]}
              onPress={() => setStaple(!staple)}
            >
              <View style={[styles.toggleBtn, staple && styles.toggleBtnActive]}>
                <Text style={[styles.toggleText, staple && { color: Colors.white }]}>ON</Text>
              </View>
              <View style={[styles.toggleBtn, !staple && styles.toggleBtnActive]}>
                <Text style={[styles.toggleText, !staple && { color: Colors.white }]}>OFF</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pricingCard}>
          <Text style={styles.pricingLabel}>Estimated Cost</Text>
          <Text style={styles.pricingAmount}>₹ {colorMode === 'bw' ? copies * 3 : copies * 8}</Text>
          <Text style={styles.pricingSub}>+ ₹15 delivery charge</Text>
        </View>

        <TouchableOpacity style={styles.btn} activeOpacity={0.85}>
          <Text style={styles.btnText}>🖨️  PRINT & DELIVER</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  uploadRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  uploadBox: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', ...Shadow.sm },
  uploadBoxActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight, borderStyle: 'solid' },
  uploadLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  uploadSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: Colors.primary },
  fileName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  fileSize: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  optionCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, marginBottom: 16, ...Shadow.sm },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  optionLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  toggle: { flexDirection: 'row', backgroundColor: Colors.gray100, borderRadius: Radius.sm, padding: 3 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.sm - 2 },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  qtyBtn: { width: 32, height: 32, backgroundColor: Colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: Colors.white, fontWeight: '700', fontSize: 18 },
  pricingCard: { backgroundColor: Colors.primaryLight, borderRadius: Radius.md, padding: 16, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
  pricingLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  pricingAmount: { fontSize: 36, fontWeight: '900', color: Colors.primary, marginTop: 4 },
  pricingSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', ...Shadow.sm },
  btnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md, letterSpacing: 0.5 },
});
