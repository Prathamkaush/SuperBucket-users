import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const FALLBACK_RENTAL = {
  type: 'Rental Place',
  area: 'Nearby',
  rent: 'Rs 0/mo',
  size: 'Details available',
  floor: 'Contact owner',
  verified: false,
  icon: '',
  amenities: [],
};

export default function RentalDetailScreen({ route, navigation }) {
  const rental = { ...FALLBACK_RENTAL, ...(route?.params?.rental || {}) };
  const facts = [
    { label: 'Area', value: rental.area },
    { label: 'Size', value: rental.size },
    { label: 'Floor', value: rental.floor },
    { label: 'Status', value: rental.verified ? 'Verified listing' : 'Owner listed' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{rental.type}</Text>
          <Text style={styles.headerSub}>{rental.area}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>{rental.icon}</Text>
          {rental.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.summary}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{rental.type} in {rental.area}</Text>
            <Text style={styles.address}>Sector road, {rental.area}</Text>
          </View>
          <Text style={styles.rent}>{rental.rent}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Place Details</Text>
          {facts.map((fact) => (
            <View key={fact.label} style={styles.factRow}>
              <Text style={styles.factLabel}>{fact.label}</Text>
              <Text style={styles.factValue}>{fact.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesRow}>
            {(rental.amenities.length ? rental.amenities : ['Call for details']).map((item) => (
              <View key={item} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Notes</Text>
          <Text style={styles.notes}>
            Suitable for local families, students, and working professionals. Final rent,
            deposit, and move-in date can be confirmed after owner verification.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Call Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Schedule Visit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  headerTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs, fontWeight: '700', marginTop: 2 },
  content: { padding: Spacing.lg, paddingBottom: 124 },
  hero: {
    height: 230,
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  heroIcon: { fontSize: 74 },
  verifiedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: Colors.success,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifiedText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
  summary: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    flexDirection: 'row',
    gap: 12,
    ...Shadow.sm,
  },
  title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  address: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginTop: 5 },
  rent: { color: Colors.secondary, fontSize: FontSize.lg, fontWeight: '900', textAlign: 'right' },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900', marginBottom: 12 },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  factLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '700' },
  factValue: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  amenityText: { color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '900' },
  notes: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 21, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '900' },
  primaryBtn: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadow.blueGlow,
  },
  primaryBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
});
