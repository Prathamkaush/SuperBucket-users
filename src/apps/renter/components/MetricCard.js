import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const TONES = {
  blue: { bg: Colors.secondaryLight, text: Colors.secondary },
  red: { bg: Colors.primaryLight, text: Colors.primary },
  green: { bg: Colors.successLight, text: Colors.success },
  orange: { bg: Colors.accentLight, text: Colors.accent },
};

export default function MetricCard({ label, value, tone = 'blue' }) {
  const colors = TONES[tone] || TONES.blue;

  return (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.badgeText, { color: colors.text }]}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 50,
  },
  badgeText: {
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
});
