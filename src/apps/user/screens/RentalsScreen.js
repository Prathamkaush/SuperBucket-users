import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getLiveProperties } from '../services/properties';
import { getUploadUrl } from '../services/api';
import { getAddresses } from '../services/addresses';

const FILTERS = ['All', 'Residential', 'Commercial', 'Hostel', 'Land', 'Warehouse'];

const CATEGORY_COLORS = {
  'RESIDENTIAL': { bg: Colors.primaryLight, text: Colors.primary, icon: '🏢' },
  'COMMERCIAL':  { bg: Colors.secondaryLight, text: Colors.secondary, icon: '🏪' },
  'HOSTEL':      { bg: '#FFF3E6',             text: '#E65C00',         icon: '🏨' },
  'LAND':        { bg: '#F5F0FF',             text: '#7C3AED',         icon: '🏞️' },
  'WAREHOUSE':   { bg: '#E6F4EA',             text: '#137333',         icon: '🏭' },
};

const UNAVAILABLE_STATUS = ['SOLD', 'RENTED'];

function isUnavailableProperty(property) {
  return UNAVAILABLE_STATUS.includes(property?.status);
}

function propertyAvailabilityLabel(property) {
  if (property?.status === 'SOLD') return 'Sold';
  if (property?.status === 'RENTED') return 'Rented';
  return '';
}

export default function RentalsScreen({ navigation, route }) {
  const searchTerm = String(route.params?.search || '').trim();
  const nearbyOnly = Boolean(route.params?.nearbyOnly);
  const routePincode = String(route.params?.pincode || '').trim();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [userPincode, setUserPincode] = useState('');

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      let nearbyPincode = /^\d{6}$/.test(routePincode) ? routePincode : '';
      try {
        if (!nearbyPincode) {
          const addresses = await getAddresses();
          const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
          nearbyPincode = defaultAddress?.pincode || '';
        }

        if (/^\d{6}$/.test(nearbyPincode)) {
          setUserPincode(nearbyPincode);
        }
      } catch (addressError) {
        console.log('Could not load user address for nearby properties:', addressError);
      }

      const baseParams = searchTerm ? { search: searchTerm } : {};
      if (nearbyOnly) {
        if (/^\d{6}$/.test(nearbyPincode)) {
          const nearbyResponse = await getLiveProperties({
            ...baseParams,
            pincode: nearbyPincode,
            limit: 50,
          });
          setProperties(nearbyResponse.properties || []);
        } else {
          setProperties([]);
        }
        setNearbyProperties([]);
        return;
      }

      const response = await getLiveProperties(baseParams);
      setProperties(response.properties || []);

      if (/^\d{6}$/.test(nearbyPincode)) {
        const nearbyResponse = await getLiveProperties({
          pincode: nearbyPincode,
          limit: 20,
        });
        setNearbyProperties(nearbyResponse.properties || []);
      }
    } catch (error) {
      console.log('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, [nearbyOnly, routePincode, searchTerm]);

  useFocusEffect(
    useCallback(() => {
      loadProperties();
    }, [loadProperties])
  );

  const filtered = properties.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.category === activeFilter.toUpperCase();
  });

  const sponsored = properties.filter((item) => item.isAdvertised);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.secondaryLight} />

      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Rentals & Sales</Text>
          <Text style={styles.headerSub}>
            {nearbyOnly
              ? userPincode
                ? `Properties near PIN ${userPincode}`
                : 'Add an address to see nearby properties'
              : searchTerm
                ? `Search results for "${searchTerm}"`
                : 'Find your perfect property in town'}
          </Text>
        </View>
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

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 50, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {!nearbyOnly && nearbyProperties.length > 0 && (
            <View style={styles.sponsoredSection}>
              <Text style={styles.sponsoredSectionTitle}>Properties Near Me</Text>
              <Text style={styles.nearbyHint}>Around PIN {userPincode}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sponsoredContent}>
                {nearbyProperties.map((nearby) => {
                  const nearbyImage = nearby.frontImage ? getUploadUrl('properties', nearby.frontImage) : null;
                  return (
                    <TouchableOpacity
                      key={`near-${nearby.id}`}
                      style={styles.adCard}
                      onPress={() => navigation.navigate('RentalDetail', { rentalId: nearby.id })}
                    >
                      <View style={[styles.adImageWrap, { backgroundColor: Colors.secondaryLight }]}>
                        {isUnavailableProperty(nearby) && (
                          <View style={styles.availabilityBadge}>
                            <Text style={styles.availabilityBadgeText}>{propertyAvailabilityLabel(nearby)}</Text>
                          </View>
                        )}
                        {nearbyImage ? <Image source={{ uri: nearbyImage }} style={styles.adImage} /> : <Text style={styles.adEmoji}>🏠</Text>}
                      </View>
                      <View style={styles.adInfo}>
                        <Text style={styles.adTitle} numberOfLines={1}>{nearby.title}</Text>
                        <Text style={styles.adRent}>₹{parseFloat(nearby.price).toLocaleString('en-IN')}{nearby.mode === 'RENT' ? '/mo' : ''}</Text>
                        <Text style={styles.adArea} numberOfLines={1}>PIN {nearby.pincode} · {nearby.address}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Sponsored Ads Section */}
          {sponsored.length > 0 && (
            <View style={styles.sponsoredSection}>
              <Text style={styles.sponsoredSectionTitle}>Sponsored Promoted Ads 🚀</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sponsoredContent}
              >
                {sponsored.map((ad) => {
                  const adConfig = CATEGORY_COLORS[ad.category] || {
                    bg: Colors.gray100,
                    text: Colors.textSecondary,
                    icon: '🏡',
                  };
                  const adImg = ad.frontImage
                    ? getUploadUrl('properties', ad.frontImage)
                    : null;
                  const adPrice = parseFloat(ad.price).toLocaleString('en-IN');

                  return (
                    <TouchableOpacity
                      key={ad.id}
                      style={[styles.adCard, { borderColor: adConfig.text }]}
                      activeOpacity={0.86}
                      onPress={() =>
                        navigation.navigate('RentalDetail', { rentalId: ad.id })
                      }
                    >
                      <View style={[styles.adImageWrap, { backgroundColor: adConfig.bg }]}>
                        {isUnavailableProperty(ad) && (
                          <View style={styles.availabilityBadge}>
                            <Text style={styles.availabilityBadgeText}>{propertyAvailabilityLabel(ad)}</Text>
                          </View>
                        )}
                        {adImg ? (
                          <Image
                            source={{ uri: adImg }}
                            style={styles.adImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.adEmoji}>{adConfig.icon}</Text>
                        )}
                        <View style={styles.adBadge}>
                          <Text style={styles.adBadgeText}>SPONSORED</Text>
                        </View>
                        <View
                          style={[styles.adTypePill, { backgroundColor: adConfig.text }]}
                        >
                          <Text style={styles.adTypePillText}>{ad.mode}</Text>
                        </View>
                      </View>
                      <View style={styles.adInfo}>
                        <Text style={styles.adTitle} numberOfLines={1}>
                          {ad.title}
                        </Text>
                        <Text style={styles.adRent} numberOfLines={1}>
                          ₹{adPrice}
                          {ad.mode === 'RENT' ? '/mo' : ''}
                        </Text>
                        <Text style={styles.adArea} numberOfLines={1}>
                          📍 {ad.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {filtered.length > 0 ? (

            filtered.map((rental) => {
              const catConfig = CATEGORY_COLORS[rental.category] || { bg: Colors.gray100, text: Colors.textSecondary, icon: '🏡' };
              const imageUrl = rental.frontImage ? getUploadUrl('properties', rental.frontImage) : null;
              const formattedPrice = parseFloat(rental.price).toLocaleString('en-IN');
              
              return (
                <View key={rental.id} style={styles.rentalCard}>
                  {/* Image */}
                  <View style={[styles.rentalImageWrap, { backgroundColor: catConfig.bg }]}>
                    {imageUrl ? (
                      <Image source={{ uri: imageUrl }} style={styles.rentalImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.rentalEmoji}>{catConfig.icon}</Text>
                    )}

                    {rental.verification === 'VERIFIED' && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ Verified</Text>
                      </View>
                    )}

                    {rental.isAdvertised && (
                      <View
                        style={[
                          styles.verifiedBadge,
                          {
                            left: rental.verification === 'VERIFIED' ? 88 : 10,
                            backgroundColor: Colors.primary,
                          },
                        ]}
                      >
                        <Text style={styles.verifiedText}>🔥 Sponsored</Text>
                      </View>
                    )}

                    {isUnavailableProperty(rental) && (
                      <View style={styles.availabilityBadge}>
                        <Text style={styles.availabilityBadgeText}>{propertyAvailabilityLabel(rental)}</Text>
                      </View>
                    )}

                    <View style={[styles.typePill, { backgroundColor: catConfig.text }]}>
                      <Text style={styles.typePillText}>{rental.mode}</Text>
                    </View>
                  </View>


                  {/* Info */}
                  <View style={styles.rentalInfo}>
                    <View style={styles.infoTop}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.rentalType} numberOfLines={1}>{rental.title}</Text>
                        <Text style={styles.rentalArea} numberOfLines={1}>📍 {rental.address}</Text>
                      </View>
                      <Text style={[styles.rentalRent, { color: catConfig.text }]}>
                        ₹{formattedPrice}{rental.mode === 'RENT' ? '/mo' : ''}
                      </Text>
                    </View>

                    {/* Details tags */}
                    <View style={styles.tagRow}>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>📐 {rental.size}</Text>
                      </View>
                      {rental.floor && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>🏗️ {rental.floor}</Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.viewBtn, { backgroundColor: catConfig.text }]}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('RentalDetail', { rentalId: rental.id })}
                    >
                      <Text style={styles.viewBtnText}>View Details →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {nearbyOnly ? 'No properties found near your saved address.' : 'No properties found under this category.'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.secondaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

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

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },

  /* Rental card */
  rentalCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    ...Shadow.md,
    overflow: 'hidden',
  },
  rentalImageWrap: {
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  rentalImage: {
    width: '100%',
    height: '100%',
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
  availabilityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    zIndex: 20,
  },
  availabilityBadgeText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: '900',
  },

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

  viewBtn: {
    borderRadius: Radius.md, paddingVertical: 11,
    alignItems: 'center', marginTop: 4,
  },
  viewBtnText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },

  /* Sponsored Ads Carousel Styles */
  sponsoredSection: {
    marginBottom: 8,
  },
  sponsoredSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  nearbyHint: {
    color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', marginTop: -6, marginBottom: 10,
  },
  sponsoredContent: {
    gap: 12,
    paddingBottom: 4,
  },
  adCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  adImageWrap: {
    height: 106,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  adEmoji: {
    fontSize: 38,
  },
  adBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.xs,
  },
  adBadgeText: {
    fontSize: 8,
    color: Colors.white,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adTypePill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  adTypePillText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '900',
  },
  adInfo: {
    padding: 10,
    gap: 3,
  },
  adTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  adRent: {
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  adArea: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
