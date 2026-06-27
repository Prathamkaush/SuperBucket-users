import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import RenterHeader from '../components/RenterHeader';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const ITEMS = [
  { title: 'Owner verification', value: '80% complete' },
  { title: 'Bank and payouts', value: 'Primary account added' },
  { title: 'Support', value: 'Open tickets and help' },
  { title: 'Listing policy', value: 'Rules for rent and sell' },
];

export default function RenterProfileScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <RenterHeader title="Profile" subtitle="Owner account, documents, and settings." />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ownerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>RK</Text>
          </View>
          <View style={styles.ownerBody}>
            <Text style={styles.ownerName}>Renter Kiosk</Text>
            <Text style={styles.ownerMeta}>12 active spaces - 4.8 rating</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Verification progress</Text>
            <Text style={styles.progressValue}>80%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressCopy}>Complete address proof to show higher in search results.</Text>
        </View>

        {ITEMS.map((item) => (
          <TouchableOpacity key={item.title} style={styles.settingRow} activeOpacity={0.86}>
            <View>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingValue}>{item.value}</Text>
            </View>
            <Text style={styles.chevron}>Go</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  ownerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.secondary,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  ownerBody: { flex: 1 },
  ownerName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  ownerMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 3,
  },
  verifiedBadge: {
    borderRadius: Radius.full,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedText: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  progressCard: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  progressValue: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '80%',
    height: '100%',
    backgroundColor: Colors.white,
  },
  progressCopy: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  settingRow: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.sm,
  },
  settingTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  settingValue: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 3,
  },
  chevron: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
});
