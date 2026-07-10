import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getPropertyDetail, submitInquiry } from '../services/properties';
import { getUploadUrl } from '../services/api';

const PHOTO_WIDTH = Dimensions.get('window').width - (Spacing.lg * 2);
const ENABLE_NATIVE_MAPS =
  process.env.EXPO_PUBLIC_ENABLE_NATIVE_MAPS === 'true' &&
  Boolean(process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY);
const NativeMaps = getNativeMaps();

export default function RentalDetailScreen({ route, navigation }) {
  const { rentalId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!rentalId) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPropertyDetail(rentalId);
        setProperty(data);
      } catch (error) {
        Alert.alert('Error', 'Could not load property details.');
        console.log('Error loading property detail:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [rentalId]);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Property details not found.</Text>
      </View>
    );
  }

  const propertyImages = [property.frontImage, property.roomsImage]
    .filter(Boolean)
    .map((fileName) => getUploadUrl('properties', fileName));
  const formattedPrice = parseFloat(property.price).toLocaleString('en-IN');
  const unavailable = ['SOLD', 'RENTED'].includes(property.status);
  const availabilityLabel = property.status === 'SOLD' ? 'Sold' : property.status === 'RENTED' ? 'Rented' : 'Available';
  const propertyPoint = coordinateFrom(property);
  const mapRegion = buildRegion(propertyPoint);
  const mapQuery = propertyPoint
    ? `${propertyPoint.latitude},${propertyPoint.longitude}`
    : [property.address, property.pincode].filter(Boolean).join(', ');
  const canShowNativeMap = Boolean(NativeMaps && mapRegion);

  const handleCall = () => {
    if (unavailable) {
      Alert.alert('Property unavailable', `This property is already ${availabilityLabel.toLowerCase()}.`);
      return;
    }
    const phone = property.owner?.phone;
    if (!phone) {
      Alert.alert('Unavailable', 'Owner phone number is not listed.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Could not open dialer');
    });
  };

  const handleInquirySubmit = async () => {
    if (unavailable) {
      Alert.alert('Property unavailable', `This property is already ${availabilityLabel.toLowerCase()}.`);
      return;
    }
    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please type a message to send to the owner.');
      return;
    }
    try {
      setSubmitting(true);
      await submitInquiry(property.id, message.trim());
      Alert.alert('Inquiry Sent', 'Your query has been sent to the property owner successfully!');
      setMessage('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not send inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleVisit = () => {
    if (unavailable) {
      Alert.alert('Property unavailable', `This property is already ${availabilityLabel.toLowerCase()}.`);
      return;
    }
    Alert.prompt(
      'Schedule Visit',
      'Enter preferred date and time (e.g. Tomorrow, 5 PM):',
      async (visitTimeStr) => {
        if (!visitTimeStr?.trim()) return;
        try {
          setSubmitting(true);
          // Create a mock future date string or pass the text
          await submitInquiry(property.id, `Scheduled visit request for: ${visitTimeStr}`, new Date().toISOString());
          Alert.alert('Success', 'Visit request submitted successfully!');
        } catch (error) {
          Alert.alert('Error', error.message || 'Could not schedule visit.');
        } finally {
          setSubmitting(false);
        }
      }
    );
  };

  const handleOpenMap = () => {
    if (!mapQuery) {
      Alert.alert('Location unavailable', 'Property location is not listed.');
      return;
    }
    const encodedQuery = encodeURIComponent(mapQuery);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`).catch(() => {
      Alert.alert('Error', 'Could not open Google Maps');
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.secondaryLight} />


      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{property.title}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{property.address}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {propertyImages.length ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {propertyImages.map((imageUrl) => (
                <Image key={imageUrl} source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.heroIcon}>🏢</Text>
          )}
          {propertyImages.length > 1 && (
            <View style={styles.photoCountBadge}>
              <Text style={styles.photoCountText}>{propertyImages.length} photos · swipe</Text>
            </View>
          )}
          {property.verification === 'VERIFIED' && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {unavailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>{availabilityLabel}</Text>
            </View>
          )}
        </View>

        <View style={styles.summary}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.address}>📍 {property.address}</Text>
          </View>
          <Text style={styles.rent}>
            ₹{formattedPrice}{property.mode === 'RENT' ? '/mo' : ''}
          </Text>
        </View>

        {unavailable && (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableTitle}>This property is {availabilityLabel.toLowerCase()}</Text>
            <Text style={styles.unavailableCopy}>You can still view the details, but owner calls, messages, and visit requests are closed.</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Place Details</Text>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>Category</Text>
            <Text style={styles.factValue}>{property.category}</Text>
          </View>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>Size</Text>
            <Text style={styles.factValue}>{property.size}</Text>
          </View>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>Floor</Text>
            <Text style={styles.factValue}>{property.floor || 'Ground'}</Text>
          </View>
          <View style={styles.factRow}>
            <Text style={styles.factLabel}>Furnishing</Text>
            <Text style={styles.factValue}>{property.furnished?.replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleNoMargin}>Location</Text>
            <TouchableOpacity style={styles.mapAction} onPress={handleOpenMap}>
              <Navigation size={15} color={Colors.white} strokeWidth={2.8} />
              <Text style={styles.mapActionText}>Open Maps</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationMap}>
            {canShowNativeMap ? (
              <NativeMaps.MapView style={styles.map} region={mapRegion} scrollEnabled={false} zoomEnabled={false}>
                <NativeMaps.Marker coordinate={propertyPoint} title={property.title} description={property.address} pinColor={Colors.secondary} />
              </NativeMaps.MapView>
            ) : (
              <TouchableOpacity style={styles.mapFallback} onPress={handleOpenMap} activeOpacity={0.85}>
                <View style={styles.mapGridLineHorizontal} />
                <View style={[styles.mapGridLineHorizontal, styles.mapGridLineHorizontalTwo]} />
                <View style={styles.mapGridLineVertical} />
                <View style={[styles.mapGridLineVertical, styles.mapGridLineVerticalTwo]} />
                <View style={styles.mapPinBadge}>
                  <MapPin size={30} color={Colors.secondary} strokeWidth={2.6} />
                </View>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.mapAddress} numberOfLines={2}>{property.address}</Text>
        </View>

        {property.details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Notes</Text>
            <Text style={styles.notes}>{property.details}</Text>
          </View>
        )}

        {!unavailable && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ask the Owner a Question</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Ask about deposits, utilities, landmarks..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.submitInquiryBtn, submitting && styles.btnDisabled]}
            onPress={handleInquirySubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitInquiryBtnText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.secondaryBtn, unavailable && styles.disabledOutline]} onPress={handleCall} disabled={unavailable}>
          <Text style={styles.secondaryBtnText}>Call Owner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryBtn, unavailable && styles.btnDisabled]} onPress={handleScheduleVisit} disabled={unavailable}>
          <Text style={styles.primaryBtnText}>Schedule Visit</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

}

function getNativeMaps() {
  if (!ENABLE_NATIVE_MAPS || Platform.OS === 'web') return null;
  try {
    const maps = require('react-native-maps');
    return {
      MapView: maps.default,
      Marker: maps.Marker,
    };
  } catch {
    return null;
  }
}

function coordinateFrom(value) {
  const latitude = Number(value?.latitude ?? value?.lat);
  const longitude = Number(value?.longitude ?? value?.lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function buildRegion(point) {
  if (!point) return null;
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
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
    backgroundColor: Colors.secondaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  headerSubtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '700', marginTop: 2 },
  content: { padding: Spacing.lg, paddingBottom: 124 },
  hero: {
    height: 230,
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
    overflow: 'hidden',
  },
  heroImage: {
    width: PHOTO_WIDTH,
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.68)',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  photoCountText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
  heroIcon: { fontSize: 74 },
  verifiedBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: Colors.success,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  verifiedText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
  unavailableBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: Colors.danger,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  unavailableText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
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
  sectionTitleNoMargin: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  factLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '700' },
  factValue: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' },
  notes: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 21, fontWeight: '600' },
  locationMap: {
    height: 190,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondaryLight,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  map: { flex: 1 },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondaryLight,
  },
  mapGridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '34%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  mapGridLineHorizontalTwo: { top: '66%' },
  mapGridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '32%',
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  mapGridLineVerticalTwo: { left: '68%' },
  mapPinBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  mapAddress: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 10,
  },
  mapAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapActionText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
  unavailableCard: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.danger,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadow.sm,
  },
  unavailableTitle: {
    color: Colors.danger,
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  unavailableCopy: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 6,
  },
  
  messageInput: {
    backgroundColor: Colors.gray50,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    minHeight: 84,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  submitInquiryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: Colors.gray400,
  },
  submitInquiryBtnText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },

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
  disabledOutline: {
    borderColor: Colors.gray400,
    backgroundColor: Colors.gray100,
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
