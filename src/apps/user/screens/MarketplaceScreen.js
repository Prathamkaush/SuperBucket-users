import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const SECTIONS = [
  { label: 'Electronics', icon: '📱', items: [
    { id: '1', name: 'Bluetooth Speaker', price: 799, delivery: '2-3 days', icon: '🔊' },
    { id: '2', name: 'USB-C Hub', price: 449, delivery: 'Tomorrow', icon: '🔌' },
  ]},
  { label: 'Appliances', icon: '🏠', items: [
    { id: '3', name: 'Table Fan 16"', price: 1299, delivery: '3-4 days', icon: '🌀' },
    { id: '4', name: 'Electric Kettle', price: 699, delivery: 'Tomorrow', icon: '☕' },
  ]},
  { label: 'Fashion', icon: '👕', items: [
    { id: '5', name: "Men's Polo T-Shirt", price: 349, delivery: '2-3 days', icon: '👕', variantType: 'Color', variants: [{ label: 'Black', color: '#202124' }, { label: 'Blue', color: '#2563EB' }, { label: 'Red', color: '#DC2626' }] },
    { id: '6', name: 'Sports Shorts', price: 249, delivery: '2-3 days', icon: '🩳', variantType: 'Color', variants: [{ label: 'Black', color: '#202124' }, { label: 'Gray', color: '#6B7280' }, { label: 'Navy', color: '#1E3A8A' }] },
  ]},
  { label: 'Hardware', icon: '🔩', items: [
    { id: '7', name: 'Drill Machine Set', price: 1899, delivery: '4-5 days', icon: '🪛' },
    { id: '8', name: 'Measuring Tape 5m', price: 89, delivery: 'Tomorrow', icon: '📏' },
  ]},
  { label: 'Kitchen', icon: '🍳', items: [
    { id: '9', name: 'Non-stick Pan Set', price: 1199, delivery: '3-4 days', icon: '🍳' },
    { id: '10', name: 'Water Bottle 1L', price: 199, delivery: 'Tomorrow', icon: '🍶' },
  ]},
];

export default function MarketplaceScreen({ navigation }) {
  const [activeSection, setActiveSection] = useState('All');

  const displaySections = activeSection === 'All' ? SECTIONS : SECTIONS.filter(s => s.label === activeSection);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity style={{ padding: 4 }}>
          <Text style={{ fontSize: 22 }}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingVertical: 8, gap: 8 }}>
        <TouchableOpacity style={[styles.tab, activeSection === 'All' && styles.tabActive]} onPress={() => setActiveSection('All')}>
          <Text style={[styles.tabText, activeSection === 'All' && { color: Colors.white }]}>All</Text>
        </TouchableOpacity>
        {SECTIONS.map((s) => (
          <TouchableOpacity key={s.label} style={[styles.tab, activeSection === s.label && styles.tabActive]} onPress={() => setActiveSection(s.label)}>
            <Text style={[styles.tabText, activeSection === s.label && { color: Colors.white }]}>{s.icon} {s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {displaySections.map((section) => (
          <View key={section.label} style={{ marginBottom: 4 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.icon} {section.label}</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See all →</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 12 }}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.productCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ProductDetail', {
                    product: { ...item, category: section.label, qty: '1 unit' },
                  })}
                >
                  <View style={styles.productImageBox}>
                    <Text style={{ fontSize: 44 }}>{item.icon}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  {item.variants && (
                    <View style={styles.colorPreviewRow}>
                      {item.variants.map((variant) => (
                        <View
                          key={variant.label}
                          style={[styles.colorPreview, { backgroundColor: variant.color }]}
                        />
                      ))}
                      <Text style={styles.colorCount}>{item.variants.length} colors</Text>
                    </View>
                  )}
                  <View style={styles.deliveryBadge}>
                    <Text style={styles.deliveryText}>🚚 {item.delivery}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('ProductDetail', {
                      product: { ...item, category: section.label, qty: '1 unit' },
                    })}
                  >
                    <Text style={styles.addBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: '700', color: Colors.white },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  productCard: { width: 160, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 12, ...Shadow.md },
  productImageBox: { backgroundColor: Colors.gray100, borderRadius: Radius.md, height: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  productName: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4, minHeight: 34 },
  productPrice: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary, marginBottom: 6 },
  colorPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 7 },
  colorPreview: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: Colors.border },
  colorCount: { color: Colors.textMuted, fontSize: 10, fontWeight: '600' },
  deliveryBadge: { backgroundColor: Colors.gray100, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 8 },
  deliveryText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center' },
  addBtnText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700' },
});
