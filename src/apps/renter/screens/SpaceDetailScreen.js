import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function SpaceDetailScreen({ route, navigation }) {
  const space = route?.params?.space;

  if (!space) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No space selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerBody}>
          <Text style={styles.headerTitle}>{space.title}</Text>
          <Text style={styles.headerSubtitle}>{space.location}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.preview}>
          <Text style={styles.previewText}>{space.category}</Text>
          <View style={styles.previewPill}>
            <Text style={styles.previewPillText}>{space.mode}</Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.muted}>Listing price</Text>
            <Text style={styles.price}>{space.priceLabel}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{space.status}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Size</Text>
            <Text style={styles.infoValue}>{space.size}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Floor</Text>
            <Text style={styles.infoValue}>{space.floor}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Leads</Text>
            <Text style={styles.infoValue}>{space.leads}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Views</Text>
            <Text style={styles.infoValue}>{space.views}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Amenities</Text>
          <View style={styles.amenities}>
            {space.amenities.map((item) => (
              <View key={item} style={styles.amenity}>
                <Text style={styles.amenityText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Listing health</Text>
          <Text style={styles.cardCopy}>
            Add more photos, exact map position, and available visit slots to improve lead quality.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Edit listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Boost</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: 52,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backButton: {
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  headerBody: { flex: 1 },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 3,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  preview: {
    height: 190,
    borderRadius: Radius.lg,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewText: {
    color: Colors.secondary,
    fontSize: FontSize.display,
    fontWeight: '900',
  },
  previewPill: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewPillText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.sm,
  },
  muted: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  price: {
    color: Colors.primary,
    fontSize: FontSize.xxl,
    fontWeight: '900',
    marginTop: 3,
  },
  statusPill: {
    borderRadius: Radius.full,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  infoBox: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '900',
    marginTop: 5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  cardCopy: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  amenity: {
    borderRadius: Radius.full,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  amenityText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
});
