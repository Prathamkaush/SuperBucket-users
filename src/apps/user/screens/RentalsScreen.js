import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const RENTALS = [
  {
    id: '1', type: '2BHK', area: 'Sector 12', rent: '₹12,000/mo',
    size: '850 sq ft', floor: '3rd Floor', verified: true, icon: '🏢',
    amenities: ['WiFi', 'Parking', 'AC'],
  },
  {
    id: '2', type: '1BHK', area: 'Model Town', rent: '₹7,500/mo',
    size: '500 sq ft', floor: 'Ground', verified: true, icon: '🏠',
    amenities: ['WiFi', 'Furnished'],
  },
  {
    id: '3', type: 'Hostel', area: 'Near University', rent: '₹3,500/mo',
    size: 'Sharing Room', floor: '1st Floor', verified: true, icon: '🏨',
    amenities: ['Meals', 'WiFi', 'Laundry'],
  },
  {
    id: '4', type: '3BHK', area: 'Green Park', rent: '₹22,000/mo',
    size: '1400 sq ft', floor: '5th Floor', verified: false, icon: '🏘️',
    amenities: ['Parking', 'AC', 'Power Backup'],
  },
];

const FILTERS = ['All', '1BHK', '2BHK', '3BHK', 'Hostel', 'Budget'];

const TYPE_COLORS = {
  '2BHK':   { bg: Colors.primaryLight,   text: Colors.primary   },
  '1BHK':   { bg: Colors.secondaryLight, text: Colors.secondary },
  'Hostel': { bg: '#FFF3E6',             text: '#E65C00'        },
  '3BHK':   { bg: '#F5F0FF',             text: '#7C3AED'        },
};

export default function RentalsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? RENTALS
    : RENTALS.filter(r => r.type.includes(activeFilter));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Rentals</Text>
          <Text style={styles.headerSub}>Find your perfect home in town</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterBtnText}>⚙️ Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: 8 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Cards */}
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 50, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((rental) => {
          const typeColor = TYPE_COLORS[rental.type] || { bg: Colors.gray100, text: Colors.textSecondary };
          return (
            <View key={rental.id} style={styles.rentalCard}>
              {/* Image placeholder */}
              <View style={[styles.rentalImage, { backgroundColor: typeColor.bg }]}>
                <Text style={styles.rentalEmoji}>{rental.icon}</Text>

                {rental.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}

                <View style={[styles.typePill, { backgroundColor: typeColor.text }]}>
                  <Text style={styles.typePillText}>{rental.type}</Text>
                </View>
              </View>

              {/* Info */}
              <View style={styles.rentalInfo}>
                <View style={styles.infoTop}>
                  <View>
                    <Text style={styles.rentalType}>{rental.type} · {rental.area}</Text>
                    <Text style={styles.rentalArea}>📍 {rental.area}</Text>
                  </View>
                  <Text style={[styles.rentalRent, { color: typeColor.text }]}>
                    {rental.rent}
                  </Text>
                </View>

                {/* Details tags */}
                <View style={styles.tagRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>📐 {rental.size}</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>🏗️ {rental.floor}</Text>
                  </View>
                </View>

                {/* Amenities */}
                <View style={styles.amenitiesRow}>
                  {rental.amenities.map((a) => (
                    <View key={a} style={[styles.amenityChip, { backgroundColor: typeColor.bg }]}>
                      <Text style={[styles.amenityText, { color: typeColor.text }]}>{a}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.viewBtn, { backgroundColor: typeColor.text }]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('RentalDetail', { rental })}
                >
                  <Text style={styles.viewBtnText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: Colors.white, fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.sm, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  filterBtnText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '700' },

  filtersBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chip: {
    paddingHorizontal: 18, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1.5,
    borderColor: Colors.border, backgroundColor: Colors.gray50,
  },
  chipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  chipText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },

  /* Rental card */
  rentalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    ...Shadow.md,
    overflow: 'hidden',
  },
  rentalImage: {
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rentalEmoji: { fontSize: 52 },
  verifiedBadge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: Colors.success,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  verifiedText: { fontSize: 10, color: Colors.white, fontWeight: '800' },
  typePill: {
    position: 'absolute', bottom: 10, right: 10,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full,
  },
  typePillText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '800' },

  rentalInfo: { padding: 14, gap: 8 },
  infoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rentalType: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary },
  rentalArea: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3, fontWeight: '500' },
  rentalRent: { fontSize: FontSize.lg, fontWeight: '900' },

  tagRow: { flexDirection: 'row', gap: 8 },
  tag: {
    backgroundColor: Colors.gray100, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: Radius.sm,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },

  amenitiesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  amenityChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  amenityText: { fontSize: 10, fontWeight: '700' },

  viewBtn: {
    borderRadius: Radius.md, paddingVertical: 11,
    alignItems: 'center', marginTop: 4,
  },
  viewBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
});
