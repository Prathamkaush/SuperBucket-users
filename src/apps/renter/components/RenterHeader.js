import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../theme/theme';

export default function RenterHeader({ title, subtitle, action }) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text style={styles.kicker}>Superbuket Renter</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 52,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.md,
  },
  copy: {
    flex: 1,
  },
  kicker: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: FontSize.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: '900',
    marginTop: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 4,
  },
});
