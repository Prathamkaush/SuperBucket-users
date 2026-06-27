import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const STATUS = {
  Live: { bg: Colors.successLight, text: Colors.success },
  Review: { bg: Colors.warningLight, text: Colors.warning },
  Draft: { bg: Colors.gray100, text: Colors.gray700 },
};

export default function SpaceCard({ space, onPress }) {
  const status = STATUS[space.status] || STATUS.Draft;
  const modeColor = space.mode === 'Sell' ? Colors.accent : Colors.secondary;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.86} onPress={onPress}>
      <View style={styles.imageBlock}>
        <Text style={styles.imageText}>{space.category.slice(0, 2).toUpperCase()}</Text>
        <View style={[styles.modePill, { backgroundColor: modeColor }]}>
          <Text style={styles.modeText}>{space.mode}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{space.title}</Text>
            <Text style={styles.location}>{space.location}</Text>
          </View>
          <Text style={styles.price}>{space.priceLabel}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detail}>{space.size}</Text>
          <Text style={styles.dot}>.</Text>
          <Text style={styles.detail}>{space.floor}</Text>
          <Text style={styles.dot}>.</Text>
          <Text style={styles.detail}>{space.verification}</Text>
        </View>

        <View style={styles.footer}>
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{space.status}</Text>
          </View>
          <Text style={styles.footerText}>{space.leads} leads</Text>
          <Text style={styles.footerText}>{space.views} views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  imageBlock: {
    height: 126,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: Colors.secondary,
    fontSize: FontSize.display,
    fontWeight: '900',
  },
  modePill: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  modeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  location: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 3,
  },
  price: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  detail: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  dot: {
    color: Colors.gray500,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
