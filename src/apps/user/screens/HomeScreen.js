import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, Image, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import LogoBrand from '../components/LogoBrand';
import { getCategories } from '../services/categories';
import { getProducts } from '../services/products';
import { getLiveProperties } from '../services/properties';
import { getServiceCatalog } from '../services/serviceMarketplace';
import { getAddresses } from '../services/addresses';
import { getProfile } from '../services/profile';
import { getUploadUrl } from '../services/api';
import { getWallet } from '../services/wallet';
import { getNotifications } from '../services/notifications';
import { getSettings } from '../services/settings';
import { getHomeOffers } from '../services/homeOffers';
import { getMyOrders, reorderOrder } from '../services/orders';

const DEFAULT_SLOT_TIMES = ['10:00 AM', '1:00 PM', '5:00 PM', '8:00 PM'];

const CATEGORIES = [
  { id: '1',  icon: '🛒', label: 'Groceries',         screen: 'Grocery',      bg: '#FFF0F0' },
  { id: '2',  icon: '🥬', label: 'Vegetables',         screen: 'Grocery',      bg: '#F0FFF4' },
  { id: '3',  icon: '🥛', label: 'Dairy',              screen: 'Grocery',      bg: '#F0F8FF' },
  { id: '4',  icon: '📦', label: 'Parcel Pickup',      screen: 'Parcel',       bg: '#FFF8F0' },
  { id: '5',  icon: '🖨️', label: 'Print & Deliver',    screen: 'PrintDeliver', bg: '#F3F0FF' },
  { id: '6',  icon: '🔧', label: 'Penny Works',        screen: 'PennyWorks',   bg: '#FFF0F8' },
  { id: '7',  icon: '🏠', label: 'Rentals',            screen: 'Rentals',      bg: '#F0FFFA' },
  { id: '8',  icon: '📱', label: 'Electronics',        screen: 'Marketplace',  bg: '#F0F4FF' },
  { id: '9',  icon: '🍳', label: 'Kitchen',            screen: 'Marketplace',  bg: '#FFFDF0' },
  { id: '10', icon: '👕', label: 'Fashion',            screen: 'Marketplace',  bg: '#FFF0F6' },
  { id: '11', icon: '👟', label: 'Footwear',           screen: 'Marketplace',  bg: '#F5F0FF' },
  { id: '12', icon: '🔩', label: 'Hardware',           screen: 'Marketplace',  bg: '#F0F9FF' },
  { id: '13', icon: '🧺', label: 'Plastics',           screen: 'Marketplace',  bg: '#FAFFF0' },
  { id: '14', icon: '⚽', label: 'Sports',             screen: 'Marketplace',  bg: '#FFF5F0' },
  { id: '15', icon: '📓', label: 'Stationery',         screen: 'Marketplace',  bg: '#F0FCFF' },
  { id: '16', icon: '🏥', label: 'Pharmacy',           screen: 'Marketplace',  bg: '#F0FFF9' },
];

const QUICK_ACTIONS = [
  { icon: 'bullhorn', iconSet: 'MaterialCommunityIcons', label: 'Advertise Business', screen: 'AdvertiseBusiness', color: Colors.primaryLight, iconColor: Colors.primary },
  { icon: 'repeat', iconSet: 'Feather', label: 'Buy Again', action: 'reorder', color: '#FFF7E6', iconColor: '#B45309' },
  { icon: 'tool', iconSet: 'Feather', label: 'Penny Works', screen: 'PennyWorks', color: '#FFF3E6', iconColor: Colors.accent },
  { icon: 'home-city-outline', iconSet: 'MaterialCommunityIcons', label: 'Properties', screen: 'Rentals', color: '#E6FFFA', iconColor: Colors.success },
  { icon: 'home-plus-outline', iconSet: 'MaterialCommunityIcons', label: 'List Property', screen: 'RenterPortal', color: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: 'briefcase', iconSet: 'Feather', label: 'Provide Services', screen: 'ProviderPortal', color: '#ECFDF5', iconColor: Colors.success },
];

function ActionIcon({ action, size = 24 }) {
  const Icon = action.iconSet === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Feather;
  return <Icon name={action.icon} size={size} color={action.iconColor} />;
}

const FALLBACK_OFFERS = [
  {
    id: '1',
    title: '10% Cashback',
    subtitle: 'On first order',
    color: Colors.primary,
    icon: 'wallet',
    buttonLabel: 'Claim',
  },
  {
    id: '2',
    title: 'Rs 50 Reward',
    subtitle: 'Refer and earn',
    color: Colors.secondary,
    icon: 'users',
    buttonLabel: 'Refer',
  },
  {
    id: '3',
    title: 'Free Delivery',
    subtitle: 'On orders above Rs 289',
    color: '#FF6B00',
    icon: 'truck',
    buttonLabel: 'Claim',
  },
];

const TRENDING = [
  {
    id: '1',
    tag: 'Grocery',
    title: 'Fortune Sunflower Oil',
    sub: '1L pack',
    price: 145,
    accent: Colors.primary,
    bg: Colors.primaryLight,
    action: 'ProductDetail',
    product: {
      id: 'trend-1',
      name: 'Fortune Sunflower Oil',
      qty: '1L',
      price: 145,
      category: 'Oils',
      delivery: 'Today',
      icon: '',
    },
  },
  {
    id: '2',
    tag: 'Service',
    title: 'Electrician Visit',
    sub: 'Available near you',
    price: 200,
    accent: Colors.accent,
    bg: Colors.accentLight,
    action: 'PennyWorks',
  },
  {
    id: '3',
    tag: 'Rental',
    title: '2BHK in Sector 12',
    sub: 'Verified listing',
    price: 12000,
    accent: Colors.secondary,
    bg: Colors.secondaryLight,
    action: 'Rentals',
  },
  {
    id: '4',
    tag: 'Marketplace',
    title: 'Bluetooth Speaker',
    sub: 'Delivery in 2-3 days',
    price: 799,
    accent: Colors.success,
    bg: Colors.successLight,
    action: 'ProductDetail',
    product: {
      id: 'trend-4',
      name: 'Bluetooth Speaker',
      qty: '1 unit',
      price: 799,
      category: 'Electronics',
      delivery: '2-3 days',
      icon: '',
    },
  },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [nearbyPropertiesLoading, setNearbyPropertiesLoading] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [nextDeliverySlot, setNextDeliverySlot] = useState(() => getNextDeliverySlot(DEFAULT_SLOT_TIMES));
  const [homeOffers, setHomeOffers] = useState(FALLBACK_OFFERS);
  const [reordering, setReordering] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [contentPhase, setContentPhase] = useState(0);
  const adScrollRef = useRef(null);
  const deferredRequestsRef = useRef(new Set());
  const businessAds = useMemo(() => homeOffers.filter((offer) => offer.icon === 'business'), [homeOffers]);
  const promotionalOffers = useMemo(() => homeOffers.filter((offer) => offer.icon !== 'business'), [homeOffers]);
  const adCardWidth = Dimensions.get('window').width - (Spacing.lg * 2);

  useEffect(() => {
    if (businessAds.length < 2) return undefined;
    const timer = setInterval(() => {
      setActiveAdIndex((current) => {
        const next = (current + 1) % businessAds.length;
        adScrollRef.current?.scrollTo({ x: next * adCardWidth, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [adCardWidth, businessAds.length]);

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError('');
      setCategories(await getCategories());
    } catch (error) {
      setCategoriesError(error?.message || 'Unable to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    try {
      setTrendingLoading(true);
      const response = await getProducts({ page: 1, limit: 8, trending: true, stock: 'in' });
      setTrendingProducts(response.products);
    } catch {
      setTrendingProducts([]);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  const loadHomeOffers = useCallback(async () => {
    try {
      const offers = await getHomeOffers();
      setHomeOffers(Array.isArray(offers) && offers.length ? offers : FALLBACK_OFFERS);
    } catch {
      setHomeOffers(FALLBACK_OFFERS);
    }
  }, []);

  const loadHeaderData = useCallback(async () => {
    const [profile, addresses, wallet, notifications, settings] = await Promise.all([
      getProfile().catch(() => null),
      getAddresses().catch(() => []),
      getWallet().catch(() => null),
      getNotifications(1, 1).catch(() => null),
      getSettings().catch(() => ({})),
    ]);

    const selectedAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;
    setUser(profile);
    setDefaultAddress(selectedAddress);
    setWalletBalance(Number(wallet?.wallet?.balance || 0));
    setUnreadNotifications(Number(notifications?.unread || 0));
    setNextDeliverySlot(getNextDeliverySlot(settings?.deliverySlotTimes));
  }, []);

  const loadNearbyProperties = useCallback(async () => {
    try {
      setNearbyPropertiesLoading(true);
      if (defaultAddress?.pincode) {
        const nearbyResponse = await getLiveProperties({ pincode: defaultAddress.pincode, limit: 8 });
        setNearbyProperties(nearbyResponse.properties || []);
      } else {
        setNearbyProperties([]);
      }
    } catch {
      setNearbyProperties([]);
    } finally {
      setNearbyPropertiesLoading(false);
    }
  }, [defaultAddress?.pincode]);

  useFocusEffect(
    useCallback(() => {
      loadHomeOffers();
      loadHeaderData();
    }, [loadHomeOffers, loadHeaderData]),
  );

  useEffect(() => {
    const requestOnce = (key, request) => {
      if (deferredRequestsRef.current.has(key)) return;
      deferredRequestsRef.current.add(key);
      request();
    };
    if (contentPhase >= 1) requestOnce('trending', loadTrending);
    if (contentPhase >= 2) requestOnce('nearby', loadNearbyProperties);
    if (contentPhase >= 3) requestOnce('categories', loadCategories);
  }, [contentPhase, loadCategories, loadNearbyProperties, loadTrending]);

  const loadSectionsForScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 850) setContentPhase((current) => Math.max(current, 3));
    else if (y > 480) setContentPhase((current) => Math.max(current, 2));
    else if (y > 120) setContentPhase((current) => Math.max(current, 1));
  };

  const openTrending = (product) =>
    navigation.navigate('ProductDetail', { productId: product.id, product });
  const runSearch = async () => {
    const term = search.trim();
    if (!term) {
      setSearchResults(null);
      setSearchError('');
      return;
    }

    try {
      setSearching(true);
      setSearchError('');
      const [productsResponse, propertiesResponse, serviceCatalog] = await Promise.all([
        getProducts({ page: 1, limit: 6, search: term, stock: 'in' }).catch(() => ({ products: [] })),
        getLiveProperties({ search: term, limit: 6 }).catch(() => ({ properties: [] })),
        getServiceCatalog().catch(() => []),
      ]);

      setSearchResults({
        term,
        products: (productsResponse.products || []).slice(0, 3),
        properties: (propertiesResponse.properties || []).slice(0, 3),
        services: filterServices(serviceCatalog, term).slice(0, 3),
      });
    } catch (error) {
      setSearchError(error?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setSearchError('');
    setSearchResults(null);
  };

  const buyAgain = async () => {
    if (reordering) return;
    try {
      setReordering(true);
      const response = await getMyOrders(1, 20);
      const previousOrder = (response?.orders || []).find((order) =>
        ['DELIVERED', 'CANCELLED'].includes(order.status),
      );
      if (!previousOrder) {
        Alert.alert('No previous order', 'A completed order will appear here after your first delivery.');
        return;
      }
      await reorderOrder(previousOrder.id);
      Alert.alert(
        'Added to cart',
        `Items from order #${previousOrder.id} were added to your cart. Review them and pay at checkout.`,
        [{ text: 'View cart', onPress: () => navigation.navigate('Cart') }],
      );
    } catch (error) {
      Alert.alert('Could not add previous items', error?.message || 'Please try again');
    } finally {
      setReordering(false);
    }
  };

  const runQuickAction = (action) => {
    if (action.action === 'reorder') return buyAgain();
    navigation.navigate(action.screen);
  };
  const locationLabel = formatAddressLabel(defaultAddress);
  const profileImageUrl = user?.profileImage ? getUploadUrl('profiles', user.profileImage) : null;
  const profileInitial = (user?.name || 'S').charAt(0).toUpperCase();
  const walletAmount = Number(walletBalance || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
  const notificationBadge = unreadNotifications > 99 ? '99+' : String(unreadNotifications);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />

      {/* ─── Top Header ─── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <LogoBrand size="sm" />
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => navigation.navigate('Location')}
            activeOpacity={0.75}
          >
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.walletChip} onPress={() => navigation.navigate('Wallet')}>
            <Text style={styles.walletText}>Rs {walletAmount}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.iconBtnText}>🔔</Text>
            {unreadNotifications > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{notificationBadge}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.profileBtn]}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.profileAvatar}>
              {profileImageUrl ? (
                <Image source={{ uri: profileImageUrl }} style={styles.profileAvatarImage} />
              ) : (
                <Text style={styles.profileAvatarText}>{profileInitial}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={runSearch} disabled={searching}>
            <Text style={styles.searchIcon}>Search</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, services, properties..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={runSearch}
          />
          {search ? (
            <TouchableOpacity onPress={clearSearch} style={styles.searchClear}>
              <Text style={styles.searchClearText}>x</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {searchResults || searching || searchError ? (
        <View style={styles.searchResultsPanel}>
          {searching ? (
            <View style={styles.searchStateRow}>
              <ActivityIndicator color={Colors.primary} size="small" />
              <Text style={styles.searchStateText}>Searching...</Text>
            </View>
          ) : null}
          {!searching && searchError ? <Text style={styles.searchStateText}>{searchError}</Text> : null}
          {!searching && searchResults ? (
            <>
              <View style={styles.searchPanelHeader}>
                <Text style={styles.searchPanelTitle}>Results for "{searchResults.term}"</Text>
                <TouchableOpacity onPress={clearSearch}>
                  <Text style={styles.searchPanelClose}>Close</Text>
                </TouchableOpacity>
              </View>
              <SearchSection
                title="Products"
                emptyText="No products found"
                actionText="See all"
                onAction={() => navigation.navigate('Marketplace', { search: searchResults.term })}
                items={searchResults.products}
                renderItem={(product) => (
                  <TouchableOpacity key={`product-${product.id}`} style={styles.searchResultRow} onPress={() => navigation.navigate('ProductDetail', { productId: product.id, product })}>
                    <Text style={styles.searchResultType}>P</Text>
                    <View style={styles.searchResultCopy}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.searchResultSub} numberOfLines={1}>Rs {Number(product.price || 0).toLocaleString('en-IN')} - {product.category}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
              <SearchSection
                title="Properties"
                emptyText="No properties found"
                actionText="See all"
                onAction={() => navigation.navigate('Rentals', { search: searchResults.term })}
                items={searchResults.properties}
                renderItem={(property) => (
                  <TouchableOpacity key={`property-${property.id}`} style={styles.searchResultRow} onPress={() => navigation.navigate('RentalDetail', { rentalId: property.id })}>
                    <Text style={styles.searchResultType}>R</Text>
                    <View style={styles.searchResultCopy}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>{property.title}</Text>
                      <Text style={styles.searchResultSub} numberOfLines={1}>Rs {Number(property.price || 0).toLocaleString('en-IN')} - {property.address || property.category}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
              <SearchSection
                title="Services"
                emptyText="No services found"
                actionText="See all"
                onAction={() => navigation.navigate('PennyWorks', { search: searchResults.term })}
                items={searchResults.services}
                renderItem={(service) => (
                  <TouchableOpacity key={`service-${service.package.id}`} style={styles.searchResultRow} onPress={() => navigation.navigate('ServiceDetail', { servicePackage: service.package, category: service.category })}>
                    <Text style={styles.searchResultType}>S</Text>
                    <View style={styles.searchResultCopy}>
                      <Text style={styles.searchResultTitle} numberOfLines={1}>{service.package.name}</Text>
                      <Text style={styles.searchResultSub} numberOfLines={1}>Rs {Number(service.package.price || 0).toLocaleString('en-IN')} - {service.category.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={loadSectionsForScroll}
        scrollEventThrottle={120}
      >
        {businessAds.length ? (
          <View style={styles.adHeroSection}>
            <ScrollView
              ref={adScrollRef}
              horizontal
              pagingEnabled
              snapToInterval={adCardWidth}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => setActiveAdIndex(
                Math.round(event.nativeEvent.contentOffset.x / adCardWidth),
              )}
            >
              {businessAds.map((ad) => (
                <View key={ad.id} style={[styles.adHeroCard, { width: adCardWidth, backgroundColor: ad.color || '#0B63CE' }]}>
                  {ad.imageUrl ? <Image source={{ uri: ad.imageUrl }} style={styles.adHeroImage} resizeMode="cover" /> : null}
                  <View style={styles.adHeroOverlay} />
                  <View style={styles.sponsoredBadge}><Text style={styles.sponsoredText}>Sponsored</Text></View>
                  <View style={styles.adHeroCopy}>
                    {ad.code ? <Text style={styles.adHeroCategory}>{ad.code}</Text> : null}
                    <Text style={styles.adHeroTitle}>{ad.title}</Text>
                    <Text style={styles.adHeroSubtitle}>{ad.subtitle}</Text>
                    <View style={styles.adHeroAction}><Text style={styles.adHeroActionText}>{ad.buttonLabel || 'View offer'}</Text></View>
                  </View>
                </View>
              ))}
            </ScrollView>
            {businessAds.length > 1 ? (
              <View style={styles.adDots}>
                {businessAds.map((ad, index) => (
                  <View key={`dot-${ad.id}`} style={[styles.adDot, index === activeAdIndex && styles.adDotActive]} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ─── Delivery Slot Banner ─── */}
        <View style={styles.slotBanner}>
          <View style={styles.slotLeft}>
              <Text style={styles.slotEmoji}>🌆</Text>
            <View>
              <Text style={styles.slotLabel}>Next Delivery Slot</Text>
              <Text style={styles.slotTime}>{nextDeliverySlot.label}</Text>
            </View>
          </View>
          <View style={styles.slotBadge}>
            <Text style={styles.slotBadgeText}>{nextDeliverySlot.dayLabel}</Text>
          </View>
        </View>

        {/* ─── Offers ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers for You 🎉</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {promotionalOffers.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                style={[styles.offerCard, { backgroundColor: offer.color || Colors.primary }]}
                activeOpacity={0.88}
              >
                {offer.imageUrl ? (
                  <>
                    <Image source={{ uri: offer.imageUrl }} style={styles.offerImage} resizeMode="cover" />
                    <View style={styles.offerImageOverlay} />
                  </>
                ) : null}
                <View style={[styles.offerIconBadge, offer.imageUrl && styles.offerIconBadgeOnImage]}>
                  <Text style={styles.offerIconText}>{iconForOffer(offer.icon)}</Text>
                </View>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSub}>{offer.subtitle}</Text>
                {offer.code ? <Text style={styles.offerCode}>{offer.code}</Text> : null}
                <View style={styles.claimBtn}>
                  <Text style={styles.claimText}>{offer.buttonLabel || 'Claim'} -></Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingLoading ? (
              <View style={styles.trendingLoading}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : null}
            {!trendingLoading && trendingProducts.length === 0 ? (
              <Text style={styles.trendingEmpty}>No trending products yet.</Text>
            ) : null}
            {trendingProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.trendingCard}
                activeOpacity={0.84}
                onPress={() => openTrending(product)}
              >
                <View style={[styles.trendingArt, { backgroundColor: Colors.primaryLight }]}>
                  {product.imageUrl ? (
                    <Image source={{ uri: product.imageUrl }} style={styles.trendingImage} />
                  ) : (
                    <Text style={[styles.trendingInitial, { color: Colors.primary }]}>
                      {product.name.charAt(0)}
                    </Text>
                  )}
                  <View style={[styles.trendingTag, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.trendingTagText}>{product.category || 'Product'}</Text>
                  </View>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.trendingSub} numberOfLines={1}>
                  {product.variants[0]?.label || product.brand || 'Available now'}
                </Text>
                <View style={styles.trendingBottom}>
                  <Text style={[styles.trendingPrice, { color: Colors.primary }]}>
                    Rs {Number(product.price || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.trendingArrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Properties Near You</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Rentals', {
                nearbyOnly: true,
                pincode: defaultAddress?.pincode,
              })}
            >
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearbyPropertiesLoading ? (
              <View style={styles.nearbyLoading}>
                <ActivityIndicator color={Colors.secondary} />
              </View>
            ) : null}
            {!nearbyPropertiesLoading && nearbyProperties.length === 0 ? (
              <TouchableOpacity style={styles.nearbyEmptyCard} onPress={() => navigation.navigate('Location')}>
                <Text style={styles.nearbyEmptyTitle}>No nearby properties yet</Text>
                <Text style={styles.nearbyEmptyText}>
                  {defaultAddress?.pincode ? `Around PIN ${defaultAddress.pincode}` : 'Add your address to see local listings'}
                </Text>
              </TouchableOpacity>
            ) : null}
            {nearbyProperties.map((property) => (
              <PropertyNearCard
                key={property.id}
                property={property}
                onPress={() => navigation.navigate('RentalDetail', { rentalId: property.id })}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickRow}>
            {QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.quickCard, { backgroundColor: action.color }]}
                activeOpacity={0.8}
                disabled={action.action === 'reorder' && reordering}
                onPress={() => runQuickAction(action)}
              >
                <View style={styles.quickIcon}>
                  <ActionIcon action={action} />
                </View>
                <Text style={styles.quickLabel}>{action.action === 'reorder' && reordering ? 'Adding...' : action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Categories ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          {categoriesLoading ? (
            <View style={styles.categoryStatus}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.categoryStatusText}>Loading categories...</Text>
            </View>
          ) : categoriesError ? (
            <View style={styles.categoryStatus}>
              <Text style={styles.categoryStatusText}>{categoriesError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.categoryStatus}>
              <Text style={styles.categoryStatusText}>No categories available yet.</Text>
            </View>
          ) : (
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() =>
                  navigation.navigate('Marketplace', {
                    categoryId: category.id,
                    categoryName: category.name,
                  })
                }
                activeOpacity={0.78}
              >
                {category.imageUrl ? (
                  <Image
                    source={{ uri: category.imageUrl }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.categoryFallback}>
                    <Text style={styles.categoryFallbackText}>
                      {category.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.categoryLabel} numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          )}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function formatAddressLabel(address) {
  if (!address) return 'Add delivery address';

  const area = [
    address.house,
    address.area,
    address.street,
  ].find((value) => String(value || '').trim());
  const city = String(address.city || '').trim();

  return [area, city].filter(Boolean).join(', ') || address.pincode || 'Saved address';
}

function SearchSection({ title, items, emptyText, actionText, onAction, renderItem }) {
  return (
    <View style={styles.searchSection}>
      <View style={styles.searchSectionHeader}>
        <Text style={styles.searchSectionTitle}>{title}</Text>
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.searchSectionAction}>{actionText}</Text>
        </TouchableOpacity>
      </View>
      {items.length ? items.map(renderItem) : <Text style={styles.searchEmpty}>{emptyText}</Text>}
    </View>
  );
}

function PropertyNearCard({ property, onPress }) {
  const imageUrl = property.frontImage ? getUploadUrl('properties', property.frontImage) : null;
  const price = Number(property.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <TouchableOpacity style={styles.propertyNearCard} activeOpacity={0.84} onPress={onPress}>
      <View style={styles.propertyNearImageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.propertyNearImage} resizeMode="cover" />
        ) : (
          <Text style={styles.propertyNearInitial}>P</Text>
        )}
        <View style={styles.propertyNearMode}>
          <Text style={styles.propertyNearModeText}>{property.mode === 'RENT' ? 'Rent' : 'Sale'}</Text>
        </View>
      </View>
      <Text style={styles.propertyNearTitle} numberOfLines={2}>{property.title}</Text>
      <Text style={styles.propertyNearAddress} numberOfLines={1}>{property.address}</Text>
      <Text style={styles.propertyNearPrice}>Rs {price}{property.mode === 'RENT' ? '/mo' : ''}</Text>
    </TouchableOpacity>
  );
}

function filterServices(catalog = [], term = '') {
  const query = term.toLowerCase();
  const matches = [];

  catalog.forEach((category) => {
    const categoryText = `${category.name || ''} ${category.description || ''}`.toLowerCase();
    (category.packages || []).forEach((servicePackage) => {
      const packageText = `${servicePackage.name || ''} ${servicePackage.description || ''}`.toLowerCase();
      if (categoryText.includes(query) || packageText.includes(query)) {
        matches.push({ category, package: servicePackage });
      }
    });
  });

  return matches;
}

function getNextDeliverySlot(slotTimes = DEFAULT_SLOT_TIMES, now = new Date()) {
  const labels = (Array.isArray(slotTimes) && slotTimes.length ? slotTimes : DEFAULT_SLOT_TIMES)
    .map((slot) => String(slot || '').trim())
    .filter(Boolean);
  const fallbackLabel = labels[0] || 'Available soon';
  const parsedSlots = labels
    .map((label, index) => ({ label, index, minutes: getSlotStartMinutes(label) }))
    .filter((slot) => Number.isFinite(slot.minutes))
    .sort((a, b) => a.minutes - b.minutes || a.index - b.index);

  if (!parsedSlots.length) {
    return { label: fallbackLabel, dayLabel: 'Today' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextToday = parsedSlots.find((slot) => slot.minutes > currentMinutes);

  return {
    label: nextToday?.label || parsedSlots[0].label,
    dayLabel: nextToday ? 'Today' : 'Tomorrow',
  };
}

function getSlotStartMinutes(label) {
  const match = String(label).match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (!match) return Number.NaN;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();

  if (hours > 23 || minutes > 59) return Number.NaN;
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function iconForOffer(icon = '') {
  if (icon === 'wallet') return 'Rs';
  if (icon === 'truck') return 'D';
  if (icon === 'users') return 'R';
  if (icon === 'tag') return '%';
  return 'G';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  /* Top bar */
  topBar: {
    backgroundColor: Colors.primaryLight,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F7D6D9',
  },

  topLeft: { flex: 1, marginRight: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 3 },
  pinIcon: { fontSize: 11 },
  locationText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  chevron: { color: Colors.gray600, fontSize: 11 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#F3B9BE',
  },
  walletText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '800' },
  iconBtn: { position: 'relative', padding: 4 },
  iconBtnText: { fontSize: 21 },
  profileBtn: {
    width: 38,
    height: 38,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 30,
    height: 30,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  profileAvatarImage: { width: '100%', height: '100%' },
  profileAvatarText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  badgeText: { fontSize: 8, color: Colors.white, fontWeight: '800' },

  /* Search */
  searchWrapper: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  searchClear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClearText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '900' },
  heroAdvertiseButton: {
    marginTop: 12,
    minHeight: 58,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#F3B9BE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Shadow.sm,
  },
  heroAdvertiseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAdvertiseCopy: { flex: 1 },
  heroAdvertiseTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  heroAdvertiseSub: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  searchResultsPanel: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: -6,
    marginBottom: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    maxHeight: 430,
    ...Shadow.md,
  },
  searchStateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchStateText: { color: Colors.textMuted, fontSize: FontSize.sm, fontWeight: '700' },
  searchPanelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  searchPanelTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' },
  searchPanelClose: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' },
  searchSection: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 9, marginTop: 9 },
  searchSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  searchSectionTitle: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
  searchSectionAction: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  searchResultType: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  searchResultCopy: { flex: 1 },
  searchResultTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800' },
  searchResultSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 2 },
  searchEmpty: { color: Colors.textMuted, fontSize: FontSize.xs, paddingVertical: 4 },

  /* Sponsored hero carousel */
  adHeroSection: { marginHorizontal: Spacing.lg, marginTop: 16, marginBottom: 4 },
  adHeroCard: {
    height: 235,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...Shadow.md,
  },
  adHeroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  adHeroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  sponsoredBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sponsoredText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  adHeroCopy: { padding: 18 },
  adHeroCategory: { color: 'rgba(255,255,255,0.82)', fontSize: FontSize.xs, fontWeight: '800', textTransform: 'uppercase' },
  adHeroTitle: { marginTop: 4, color: Colors.white, fontSize: FontSize.xxl, fontWeight: '900' },
  adHeroSubtitle: { marginTop: 5, color: Colors.white, fontSize: FontSize.sm, lineHeight: 19 },
  adHeroAction: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  adHeroActionText: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '900' },
  adDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  adDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gray300 },
  adDotActive: { width: 18, backgroundColor: Colors.primary },

  /* Slot banner */
  slotBanner: {
    margin: Spacing.lg,
    backgroundColor: Colors.secondaryLight,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slotEmoji: { fontSize: 28 },
  slotLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  slotTime: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.secondary, marginTop: 2 },
  slotBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  slotBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },

  /* Section */
  section: { paddingHorizontal: Spacing.lg, marginBottom: 22 },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionAction: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '800',
    marginBottom: 14,
  },

  /* Offers */
  offerCard: {
    width: 180,
    borderRadius: Radius.lg,
    padding: 16,
    marginRight: 12,
    minHeight: 130,
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Shadow.md,
  },
  offerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  offerImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  offerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  offerIconBadgeOnImage: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  offerIconText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
  offerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white },
  offerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  offerCode: {
    marginTop: 7,
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  claimBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  claimText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: '700' },

  /* Trending */
  trendingCard: {
    width: 158,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    marginRight: 12,
    ...Shadow.sm,
  },
  trendingArt: {
    height: 82,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingLoading: {
    width: 158,
    minHeight: 185,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingEmpty: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    paddingVertical: Spacing.lg,
  },
  trendingInitial: {
    fontSize: 34,
    fontWeight: '900',
  },
  trendingTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trendingTagText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  trendingTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '800',
    minHeight: 36,
  },
  trendingSub: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  trendingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  trendingPrice: {
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  trendingArrow: {
    color: Colors.gray500,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
  },

  /* Nearby properties */
  propertyNearCard: {
    width: 168,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 12,
    marginRight: 12,
    ...Shadow.sm,
  },
  propertyNearImageWrap: {
    height: 90,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  propertyNearImage: {
    width: '100%',
    height: '100%',
  },
  propertyNearInitial: {
    color: Colors.secondary,
    fontSize: 34,
    fontWeight: '900',
  },
  propertyNearMode: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  propertyNearModeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '900',
  },
  propertyNearTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '800',
    minHeight: 36,
  },
  propertyNearAddress: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  propertyNearPrice: {
    color: Colors.secondary,
    fontSize: FontSize.md,
    fontWeight: '900',
    marginTop: 9,
  },
  nearbyLoading: {
    width: 168,
    minHeight: 185,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyEmptyCard: {
    width: 230,
    minHeight: 122,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    padding: 14,
    justifyContent: 'center',
    ...Shadow.sm,
  },
  nearbyEmptyTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  nearbyEmptyText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    lineHeight: 17,
    marginTop: 6,
  },

  /* Quick actions */
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  quickCard: {
    width: '48%',
    minHeight: 82,
    borderRadius: Radius.md,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  quickLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '800',
    lineHeight: 17,
  },

  /* Category grid */
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '22%',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.xs,
  },
  categoryImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    marginBottom: 7,
    backgroundColor: Colors.gray100,
  },
  categoryFallback: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.sm,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondaryLight,
  },
  categoryFallbackText: {
    color: Colors.secondary,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  categoryLabel: {
    fontSize: FontSize.xxs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
  },
  categoryStatus: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryStatusText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
});
