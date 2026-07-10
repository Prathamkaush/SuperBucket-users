import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { deleteProperty, normalizeSpace, advertiseProperty, updatePropertyStatus } from '../services/properties';
import { getUploadUrl } from '../services/api';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';
import BackButton from '../components/BackButton';

const PHOTO_WIDTH = Dimensions.get('window').width - (Spacing.lg * 2);

export default function SpaceDetailScreen({ route, navigation }) {
  const rawSpace = route?.params?.space;
  const space = normalizeSpace(rawSpace);
  const [deleting, setDeleting] = useState(false);
  const [isAdvertised, setIsAdvertised] = useState(rawSpace?.isAdvertised || false);
  const [promoting, setPromoting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(toRawStatus(rawSpace?.rawStatus || rawSpace?.status || space?.rawStatus || 'DRAFT'));
  const [statusUpdating, setStatusUpdating] = useState(false);

  const handlePromote = () => {
    Alert.alert(
      'Promote Listing',
      'Are you sure you want to promote this property to be displayed as a Sponsored Ad?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: async () => {
            try {
              setPromoting(true);
              await advertiseProperty(space.id);
              setIsAdvertised(true);
              Alert.alert('Promoted!', 'This listing is now active as a Sponsored Ad.');
            } catch (error) {
              Alert.alert('Error', error.message || 'Could not promote listing');
            } finally {
              setPromoting(false);
            }
          }
        }
      ]
    );
  };

  const handleStatusChange = (nextStatus) => {
    const label = nextStatus === 'LIVE' ? 'available' : nextStatus.toLowerCase();
    Alert.alert(
      'Update listing status',
      `Mark this property as ${label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setStatusUpdating(true);
              const updated = await updatePropertyStatus(space.id, nextStatus);
              const rawStatus = toRawStatus(updated.status);
              setCurrentStatus(rawStatus);
              Alert.alert('Status updated', `Listing marked as ${statusLabel(rawStatus)}.`);
            } catch (error) {
              Alert.alert('Could not update status', error.message || 'Please try again');
            } finally {
              setStatusUpdating(false);
            }
          },
        },
      ],
    );
  };


  if (!space) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No space selected.</Text>
      </View>
    );
  }

  const propertyImages = [space.frontImage, space.roomsImage]
    .filter(Boolean)
    .map((fileName) => getUploadUrl('properties', fileName));

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this property listing permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteProperty(space.id);
              Alert.alert('Deleted', 'Property listing deleted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Could not delete listing');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerBody}>
          <Text style={styles.headerTitle}>{space.title}</Text>
          <Text style={styles.headerSubtitle}>{space.location}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.preview}>
          {propertyImages.length ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {propertyImages.map((imageUrl) => (
                <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.previewText}>{space.category}</Text>
          )}
          <View style={styles.previewPill}>
            <Text style={styles.previewPillText}>{space.mode}</Text>
          </View>
          {propertyImages.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>{propertyImages.length} photos · swipe</Text>
            </View>
          )}
        </View>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.muted}>Listing price</Text>
            <Text style={styles.price}>{space.priceLabel}</Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusLabel(currentStatus)}</Text>
          </View>
        </View>

        {currentStatus !== 'REVIEW' ? (
          <View style={styles.statusCard}>
            <Text style={styles.cardTitle}>Listing status</Text>
            <Text style={styles.cardCopy}>Use Draft to take the listing off the public property list. Mark it sold or rented once the deal is closed.</Text>
            <View style={styles.statusActions}>
              {[
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Available', value: 'LIVE' },
                { label: 'Sold', value: 'SOLD' },
                { label: 'Rented', value: 'RENTED' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.statusAction, currentStatus === item.value && styles.statusActionActive, statusUpdating && styles.btnDisabled]}
                  disabled={statusUpdating || currentStatus === item.value}
                  onPress={() => handleStatusChange(item.value)}
                >
                  <Text style={[styles.statusActionText, currentStatus === item.value && styles.statusActionTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.statusCard}>
            <Text style={styles.cardTitle}>Under admin review</Text>
            <Text style={styles.cardCopy}>This listing is locked until admin approves or rejects it.</Text>
          </View>
        )}

        <View style={styles.grid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Size</Text>
            <Text style={styles.infoValue}>{space.size}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Floor</Text>
            <Text style={styles.infoValue}>{space.floor || 'Ground'}</Text>
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

        {space.details && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.cardCopy}>{space.details}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Specifications</Text>
          <View style={styles.amenities}>
            <View style={styles.amenity}>
              <Text style={styles.amenityText}>
                Furnishing: {space.furnished?.replace('_', ' ').toLowerCase() || 'unfurnished'}
              </Text>
            </View>
            <View style={styles.amenity}>
              <Text style={styles.amenityText}>
                Verification: {space.verification}
              </Text>
            </View>
            <View style={styles.amenity}>
              <Text style={styles.amenityText}>
                Documents: {space.docsFile ? 'Uploaded securely' : 'Not uploaded'}
              </Text>
            </View>
          </View>
        </View>

        {isAdvertised ? (
          <View style={styles.promotedPill}>
            <Text style={styles.promotedPillText}>✨ Promoted Ad (Active)</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.promoteButton, promoting && styles.btnDisabled]}
            onPress={handlePromote}
            disabled={promoting}
            activeOpacity={0.85}
          >
            {promoting ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.promoteButtonText}>🚀 Promote Listing (Place Ad)</Text>
            )}
          </TouchableOpacity>
        )}


        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => Alert.alert('Edit feature', 'Property editing is coming soon.')}
          >
            <Text style={styles.secondaryButtonText}>Edit listing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, deleting && styles.btnDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Delete listing</Text>
            )}
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
  previewImage: {
    width: PHOTO_WIDTH,
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute', bottom: Spacing.md, right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.68)', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  photoCountText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
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
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    color: Colors.secondary,
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
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusAction: {
    width: '48%',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingVertical: 11,
    alignItems: 'center',
  },
  statusActionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  statusActionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  statusActionTextActive: {
    color: Colors.primary,
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
  btnDisabled: {
    backgroundColor: Colors.gray400,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  promoteButton: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  promoteButtonText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  promotedPill: {
    backgroundColor: Colors.successLight,
    borderWidth: 1.5,
    borderColor: Colors.success,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotedPillText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
});

function statusLabel(status) {
  return {
    LIVE: 'Live',
    REVIEW: 'Review',
    SOLD: 'Sold',
    RENTED: 'Rented',
    REJECTED: 'Rejected',
    DRAFT: 'Draft',
  }[status] || status || 'Draft';
}

function toRawStatus(status) {
  const normalized = String(status || '').trim().toUpperCase();
  return {
    AVAILABLE: 'LIVE',
    LIVE: 'LIVE',
    REVIEW: 'REVIEW',
    SOLD: 'SOLD',
    RENTED: 'RENTED',
    REJECTED: 'REJECTED',
    DRAFT: 'DRAFT',
  }[normalized] || 'DRAFT';
}
