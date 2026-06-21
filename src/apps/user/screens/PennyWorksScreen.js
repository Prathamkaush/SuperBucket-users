import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const SERVICES = [
  { id: '1', icon: '🔧', label: 'Plumbing',     count: 8,  color: '#FFF0F0', border: Colors.primary },
  { id: '2', icon: '⚡', label: 'Electrician',   count: 12, color: '#FFF8E8', border: '#F59E0B' },
  { id: '3', icon: '🧹', label: 'Cleaning',      count: 5,  color: '#F0FFF4', border: Colors.success },
  { id: '4', icon: '🌿', label: 'Gardening',     count: 3,  color: '#F0FFFA', border: '#00A550' },
  { id: '5', icon: '🪚', label: 'Carpenter',     count: 6,  color: '#F5F0FF', border: '#7C3AED' },
];

const WORKERS = [
  {
    id: '1', name: 'Raju Sharma', service: 'Electrician', rating: 4.8,
    reviews: 128, charge: '₹200/visit', verified: true, available: true,
    icon: '👷', exp: '5 yrs',
  },
  {
    id: '2', name: 'Suresh Kumar', service: 'Plumbing', rating: 4.6,
    reviews: 89, charge: '₹180/visit', verified: true, available: true,
    icon: '🔧', exp: '8 yrs',
  },
  {
    id: '3', name: 'Priya Devi', service: 'Cleaning', rating: 4.9,
    reviews: 201, charge: '₹350/session', verified: true, available: false,
    icon: '🧹', exp: '3 yrs',
  },
  {
    id: '4', name: 'Mohan Das', service: 'Carpenter', rating: 4.5,
    reviews: 54, charge: '₹250/visit', verified: true, available: true,
    icon: '🪚', exp: '10 yrs',
  },
];

export default function PennyWorksScreen({ navigation }) {
  const [activeService, setActiveService] = useState('All');

  const filtered = activeService === 'All'
    ? WORKERS
    : WORKERS.filter(w => w.service === activeService);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Penny Works</Text>
          <Text style={styles.headerSub}>Local service professionals</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{WORKERS.filter(w => w.available).length} Available</Text>
        </View>
      </View>

      {/* Service filter chips */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: 10 }}
        >
          <TouchableOpacity
            style={[styles.chip, activeService === 'All' && styles.chipActive]}
            onPress={() => setActiveService('All')}
          >
            <Text style={styles.chipIcon}>🔍</Text>
            <Text style={[styles.chipLabel, activeService === 'All' && styles.chipLabelActive]}>
              All
            </Text>
          </TouchableOpacity>
          {SERVICES.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.chip,
                activeService === s.label && styles.chipActive,
              ]}
              onPress={() => setActiveService(s.label)}
            >
              <Text style={styles.chipIcon}>{s.icon}</Text>
              <Text style={[styles.chipLabel, activeService === s.label && styles.chipLabelActive]}>
                {s.label}
              </Text>
              <View style={styles.chipCount}>
                <Text style={styles.chipCountText}>{s.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Worker cards */}
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 50, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((worker) => (
          <View key={worker.id} style={styles.workerCard}>
            {/* Avatar + availability dot */}
            <View style={styles.avatarWrap}>
              <View style={[
                styles.avatar,
                { backgroundColor: worker.available ? Colors.primaryLight : Colors.gray100 },
              ]}>
                <Text style={styles.avatarIcon}>{worker.icon}</Text>
              </View>
              <View style={[
                styles.availDot,
                { backgroundColor: worker.available ? Colors.success : Colors.gray400 },
              ]} />
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName}>{worker.name}</Text>
                {worker.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <Text style={styles.workerService}>{worker.service} · {worker.exp} exp</Text>

              <View style={styles.metaRow}>
                <View style={styles.starBadge}>
                  <Text style={styles.starText}>⭐ {worker.rating}</Text>
                </View>
                <Text style={styles.reviewCount}>({worker.reviews})</Text>
                <View style={[
                  styles.availPill,
                  { backgroundColor: worker.available ? Colors.successLight : Colors.gray100 },
                ]}>
                  <Text style={[
                    styles.availPillText,
                    { color: worker.available ? Colors.success : Colors.gray500 },
                  ]}>
                    {worker.available ? '● Available' : '○ Busy'}
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA */}
            <View style={styles.ctaCol}>
              <Text style={styles.charge}>{worker.charge}</Text>
              <TouchableOpacity
                style={[styles.bookBtn, !worker.available && styles.bookBtnDisabled]}
                activeOpacity={0.85}
              >
                <Text style={styles.bookBtnText}>{worker.available ? 'Book Now' : 'Notify Me'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: Colors.white, fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  headerBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  headerBadgeText: { fontSize: FontSize.xxs, color: Colors.white, fontWeight: '800' },

  chipsContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 5,
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipIcon: { fontSize: 16 },
  chipLabel: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
  chipLabelActive: { color: Colors.primary },
  chipCount: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 2,
  },
  chipCountText: { fontSize: 9, color: Colors.white, fontWeight: '800' },

  /* Worker card */
  workerCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    ...Shadow.md,
    gap: 12,
    alignItems: 'flex-start',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 30 },
  availDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.white,
  },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  workerName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary },
  verifiedBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  verifiedText: { fontSize: 9, color: Colors.secondary, fontWeight: '800' },
  workerService: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3, fontWeight: '500' },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7, gap: 6 },
  starBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  starText: { fontSize: FontSize.xs, fontWeight: '700', color: '#F59E0B' },
  reviewCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  availPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  availPillText: { fontSize: 9, fontWeight: '700' },

  ctaCol: { alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  charge: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.primary },
  bookBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    ...Shadow.redGlow,
  },
  bookBtnDisabled: { backgroundColor: Colors.gray300, shadowOpacity: 0, elevation: 0 },
  bookBtnText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
});
