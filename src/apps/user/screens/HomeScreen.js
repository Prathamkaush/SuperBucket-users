import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Dimensions, Image, Linking, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import { useFocusEffect } from '@react-navigation/native';
import LogoBrand from '../components/LogoBrand';
import BusinessAdDetailsModal from '../components/BusinessAdDetailsModal';
import { getCategories } from '../services/categories';
import { getProducts } from '../services/products';
import { getLiveProperties } from '../services/properties';
import { getServiceCatalog } from '../services/serviceMarketplace';
import { getAddresses } from '../services/addresses';
import { getProfile } from '../services/profile';
import { getUploadUrl } from '../services/api';
import { getWallet } from '../services/wallet';
import { getNotifications } from '../services/notifications';
import { getHomeOffers, registerBusinessAdClick } from '../services/homeOffers';
import { getMyOrders, reorderOrder } from '../services/orders';

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
  { icon: 'storefront-outline', iconSet: 'MaterialCommunityIcons', label: 'Local Shops', screen: 'LocalShops', color: Colors.primaryLight, iconColor: Colors.primary },
  { icon: 'repeat', iconSet: 'Feather', label: 'Buy Again', action: 'reorder', color: '#FFF7E6', iconColor: '#B45309' },
  { icon: 'tool', iconSet: 'Feather', label: 'Penny Works', screen: 'PennyWorks', color: '#FFF3E6', iconColor: Colors.accent },
  { icon: 'home-city-outline', iconSet: 'MaterialCommunityIcons', label: 'Properties', screen: 'Rentals', color: '#E6FFFA', iconColor: Colors.success },
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
  const [serviceItems, setServiceItems] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [groceryProducts, setGroceryProducts] = useState([]);
  const [groceriesLoading, setGroceriesLoading] = useState(true);
  const [groceryCategoryIds, setGroceryCategoryIds] = useState([]);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [nearbyPropertiesLoading, setNearbyPropertiesLoading] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [homeOffers, setHomeOffers] = useState(FALLBACK_OFFERS);
  const [selectedBusinessAd, setSelectedBusinessAd] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [contentPhase, setContentPhase] = useState(0);
  const adScrollRef = useRef(null);
  const deferredRequestsRef = useRef(new Set());
  const businessAds = useMemo(() => homeOffers.filter((offer) => offer.icon === 'business'), [homeOffers]);
  const promotionalOffers = useMemo(() => homeOffers.filter((offer) => offer.icon !== 'business'), [homeOffers]);
  const adCardWidth = Dimensions.get('window').width - (Spacing.lg * 2);
  const compactHeader = Dimensions.get('window').width < 390;

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
    const [profile, addresses, wallet, notifications] = await Promise.all([
      getProfile().catch(() => null),
      getAddresses().catch(() => []),
      getWallet().catch(() => null),
      getNotifications(1, 1).catch(() => null),
    ]);

    const selectedAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;
    setUser(profile);
    setDefaultAddress(selectedAddress);
    setWalletBalance(Number(wallet?.wallet?.balance || 0));
    setUnreadNotifications(Number(notifications?.unread || 0));
  }, []);

  const loadHomeShowcases = useCallback(async () => {
    try {
      setServicesLoading(true);
      setGroceriesLoading(true);
      setCategoriesLoading(true);
      setCategoriesError('');
      const [catalog, categoryItems] = await Promise.all([
        getServiceCatalog().catch(() => []),
        getCategories(),
      ]);
      setCategories(categoryItems);

      const services = catalog.flatMap((category) =>
        (category.packages || []).map((servicePackage) => ({
          ...servicePackage,
          category,
        })),
      );
      setServiceItems(services.slice(0, 8));

      const groceryCategories = categoryItems.filter((category) =>
        String(category.name || '').toLowerCase().includes('groceries'),
      );
      const categoryIds = groceryCategories.map((category) => category.id);
      setGroceryCategoryIds(categoryIds);

      const responses = await Promise.all(categoryIds.map((categoryId) =>
        getProducts({ page: 1, limit: 6, categoryId, stock: 'in' }).catch(() => ({ products: [] })),
      ));
      const uniqueProducts = Array.from(new Map(
        responses.flatMap((response) => response.products || []).map((product) => [product.id, product]),
      ).values());
      setGroceryProducts(uniqueProducts.slice(0, 8));
    } catch (error) {
      setCategoriesError(error?.message || 'Unable to load categories');
      setServiceItems([]);
      setGroceryProducts([]);
      setGroceryCategoryIds([]);
    } finally {
      setCategoriesLoading(false);
      setServicesLoading(false);
      setGroceriesLoading(false);
    }
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
    if (contentPhase >= 1) {
      requestOnce('trending', loadTrending);
      requestOnce('home-showcases', loadHomeShowcases);
    }
    if (contentPhase >= 2) requestOnce('nearby', loadNearbyProperties);
  }, [contentPhase, loadHomeShowcases, loadNearbyProperties, loadTrending]);

  const loadSectionsForScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 850) setContentPhase((current) => Math.max(current, 3));
    else if (y > 480) setContentPhase((current) => Math.max(current, 2));
    else if (y > 120) setContentPhase((current) => Math.max(current, 1));
  };

  const openTrending = (product) =>
    navigation.navigate('ProductDetail', { productId: product.id, product });
  const openService = (servicePackage) =>
    navigation.navigate('ServiceDetail', { servicePackage, category: servicePackage.category });
  const openBusinessAd = (ad) => {
    if (!ad.businessAdId) return;
    registerBusinessAdClick(ad.businessAdId).catch(() => undefined);
    setSelectedBusinessAd({ ...ad, businessName: ad.title });
  };
  const openOffer = (offer) => {
    const phone = extractOfferPhone(offer);
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Unable to call', 'The phone dialer could not be opened.'));
      return;
    }
    const couponCode = String(offer.code || '').trim().toUpperCase();
    if (couponCode) {
      navigation.navigate('Cart', { couponCode, couponNonce: Date.now() });
      return;
    }
    Alert.alert(offer.title || 'Offer', offer.subtitle || 'No action is available for this offer.');
  };
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
        <View style={styles.headerMainRow}>
          <LogoBrand size={compactHeader ? 'xs' : 'sm'} style={styles.headerLogo} />
          <View style={styles.topRight}>
            <TouchableOpacity
              style={styles.walletChip}
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.78}
              accessibilityLabel={`Wallet balance Rs ${walletAmount}`}
            >
              <View style={styles.walletIconWrap}>
                <Feather name="credit-card" size={14} color={Colors.primary} />
              </View>
              <View>
                {!compactHeader ? <Text style={styles.walletLabel}>Wallet</Text> : null}
                <Text style={styles.walletText}>Rs {walletAmount}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.78}
              accessibilityLabel="Notifications"
            >
              <Feather name="bell" size={19} color={Colors.textPrimary} />
              {unreadNotifications > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{notificationBadge}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIconButton, styles.profileBtn]}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.78}
              accessibilityLabel="Open profile"
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

        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => navigation.navigate('Location')}
          activeOpacity={0.78}
          accessibilityLabel={`Delivery address ${locationLabel}`}
        >
          <View style={styles.locationIconWrap}>
            <Feather name="map-pin" size={16} color={Colors.primary} />
          </View>
          <View style={styles.locationCopy}>
            <Text style={styles.locationLabel}>DELIVERING TO</Text>
            <Text style={styles.locationText} numberOfLines={1}>{locationLabel}</Text>
          </View>
          <View style={styles.locationChevron}>
            <Feather name="chevron-down" size={16} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <TouchableOpacity
            onPress={runSearch}
            disabled={searching}
            style={styles.searchIconButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            {searching ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <Feather name="search" size={19} color={Colors.primary} />
            )}
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
            <TouchableOpacity onPress={clearSearch} style={styles.searchClear} accessibilityLabel="Clear search">
              <Feather name="x" size={15} color={Colors.textSecondary} />
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
                <TouchableOpacity key={ad.id} activeOpacity={ad.businessAdId ? 0.9 : 1} onPress={() => openBusinessAd(ad)} style={[styles.adHeroCard, { width: adCardWidth, backgroundColor: ad.color || '#0B63CE' }]}>
                  {ad.imageUrl ? <Image source={{ uri: ad.imageUrl }} style={styles.adHeroImage} resizeMode="cover" /> : null}
                  <View style={styles.adHeroOverlay} />
                  <View style={styles.sponsoredBadge}><Text style={styles.sponsoredText}>Sponsored</Text></View>
                  <View style={styles.adHeroCopy}>
                    {ad.code ? <Text style={styles.adHeroCategory}>{ad.code}</Text> : null}
                    <Text style={styles.adHeroTitle}>{ad.title}</Text>
                    <Text style={styles.adHeroSubtitle}>{ad.subtitle}</Text>
                    <View style={styles.adHeroAction}><Text style={styles.adHeroActionText}>{ad.buttonLabel || 'View offer'}</Text></View>
                  </View>
                </TouchableOpacity>
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

        {/* ─── Offers ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers for You 🎉</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {promotionalOffers.map((offer) => (
              <TouchableOpacity
                key={offer.id}
                style={[
                  styles.offerCard,
                  { backgroundColor: offer.imageUrl ? Colors.gray100 : (offer.color || Colors.primary) },
                ]}
                activeOpacity={0.88}
                onPress={() => openOffer(offer)}
                accessibilityRole="button"
                accessibilityLabel={`${offer.title}. ${offer.phoneNumber ? 'Call now' : offer.code ? `Apply coupon ${offer.code}` : 'View offer'}`}
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

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity style={styles.sectionActionButton} onPress={() => navigation.navigate('PennyWorks')}>
              <Text style={styles.sectionAction}>View all</Text>
              <Feather name="arrow-up-right" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showcaseRow}>
            {servicesLoading ? <View style={styles.showcaseLoading}><ActivityIndicator color={Colors.primary} /></View> : null}
            {!servicesLoading && serviceItems.length === 0 ? <Text style={styles.showcaseEmpty}>No active services yet.</Text> : null}
            {serviceItems.map((servicePackage) => (
              <TouchableOpacity key={servicePackage.id} style={styles.homeServiceCard} onPress={() => openService(servicePackage)} activeOpacity={0.84}>
                <View style={styles.homeServiceArt}>
                  {servicePackage.category?.imageUrl ? (
                    <Image source={{ uri: servicePackage.category.imageUrl }} style={styles.homeServiceImage} resizeMode="cover" />
                  ) : <Feather name="tool" size={27} color={Colors.primary} />}
                </View>
                <Text style={styles.homeServiceCategory} numberOfLines={1}>{servicePackage.category?.name || 'Service'}</Text>
                <Text style={styles.homeServiceName} numberOfLines={2}>{servicePackage.name}</Text>
                <View style={styles.homeServiceBottom}>
                  <Text style={styles.homeServicePrice}>Rs {Number(servicePackage.price || 0).toFixed(0)}</Text>
                  <Feather name="chevron-right" size={16} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Groceries</Text>
            <TouchableOpacity
              style={[styles.sectionActionButton, !groceryCategoryIds.length && styles.sectionActionDisabled]}
              disabled={!groceryCategoryIds.length}
              onPress={() => navigation.navigate('Marketplace', { categoryIds: groceryCategoryIds, categoryName: 'Groceries' })}
            >
              <Text style={styles.sectionAction}>View all</Text>
              <Feather name="arrow-up-right" size={13} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.showcaseRow}>
            {groceriesLoading ? <View style={styles.showcaseLoading}><ActivityIndicator color={Colors.success} /></View> : null}
            {!groceriesLoading && groceryProducts.length === 0 ? <Text style={styles.showcaseEmpty}>No grocery products available.</Text> : null}
            {groceryProducts.map((product) => (
              <TouchableOpacity key={product.id} style={styles.trendingCard} activeOpacity={0.84} onPress={() => openTrending(product)}>
                <View style={[styles.trendingArt, { backgroundColor: '#ECFDF5' }]}>
                  {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.trendingImage} /> : <Text style={[styles.trendingInitial, { color: Colors.success }]}>{product.name.charAt(0)}</Text>}
                  <View style={[styles.trendingTag, { backgroundColor: Colors.success }]}><Text style={styles.trendingTagText}>{product.category}</Text></View>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.trendingSub} numberOfLines={1}>{product.variants[0]?.label || product.brand || 'Available now'}</Text>
                <View style={styles.trendingBottom}>
                  <Text style={[styles.trendingPrice, { color: Colors.success }]}>Rs {Number(product.price || 0).toLocaleString()}</Text>
                  <View style={styles.cardArrowButton}><Feather name="chevron-right" size={16} color={Colors.success} /></View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Trending ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity style={styles.sectionActionButton} onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.sectionAction}>See all</Text>
              <Feather name="arrow-up-right" size={13} color={Colors.primary} />
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
                  <View style={styles.cardArrowButton}>
                    <Feather name="chevron-right" size={16} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Properties Near You</Text>
            <TouchableOpacity
              style={styles.sectionActionButton}
              onPress={() => navigation.navigate('Rentals', {
                nearbyOnly: true,
                pincode: defaultAddress?.pincode,
              })}
            >
              <Text style={styles.sectionAction}>View all</Text>
              <Feather name="arrow-up-right" size={13} color={Colors.primary} />
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
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.quickCard, { backgroundColor: action.color }]}
                activeOpacity={0.8}
                disabled={action.action === 'reorder' && reordering}
                onPress={() => runQuickAction(action)}
              >
                <View style={[styles.quickIcon, { borderColor: `${action.iconColor}20` }]}>
                  <ActionIcon action={action} size={22} />
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
      <BusinessAdDetailsModal
        ad={selectedBusinessAd}
        visible={Boolean(selectedBusinessAd)}
        onClose={() => setSelectedBusinessAd(null)}
      />
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
      <View style={styles.propertyNearAddressRow}>
        <Feather name="map-pin" size={11} color={Colors.textMuted} />
        <Text style={styles.propertyNearAddress} numberOfLines={1}>{property.address || 'Location available'}</Text>
      </View>
      <View style={styles.propertyNearFooter}>
        <Text style={styles.propertyNearPrice}>Rs {price}{property.mode === 'RENT' ? '/mo' : ''}</Text>
        <View style={[styles.cardArrowButton, styles.propertyNearArrow]}>
          <Feather name="chevron-right" size={16} color={Colors.secondary} />
        </View>
      </View>
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

function iconForOffer(icon = '') {
  if (icon === 'wallet') return 'Rs';
  if (icon === 'truck') return 'D';
  if (icon === 'users') return 'R';
  if (icon === 'tag') return '%';
  return 'G';
}

function extractOfferPhone(offer = {}) {
  const explicit = String(offer.phoneNumber || '').replace(/[^\d+]/g, '');
  if (explicit.replace(/\D/g, '').length >= 7) return explicit;
  const match = `${offer.buttonLabel || ''} ${offer.subtitle || ''}`.match(/\+?\d[\d\s-]{5,}\d/);
  return match ? match[0].replace(/[^\d+]/g, '') : '';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  /* Top bar */
  topBar: {
    backgroundColor: Colors.primaryLight,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F7D6D9',
  },
  headerMainRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: { marginLeft: 2 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  walletChip: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(227,6,19,0.12)',
    ...Shadow.sm,
  },
  walletIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  walletText: {
    color: Colors.textPrimary,
    fontSize: FontSize.xs,
    lineHeight: 15,
    fontWeight: '900',
  },
  headerIconButton: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.06)',
    ...Shadow.sm,
  },
  locationRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(227,6,19,0.09)',
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.xs,
  },
  locationCopy: { flex: 1, marginLeft: 10, marginRight: 6 },
  locationLabel: {
    color: Colors.primary,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  locationText: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  locationChevron: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    padding: 3,
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileAvatarImage: { width: '100%', height: '100%' },
  profileAvatarText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: { fontSize: 8, color: Colors.white, fontWeight: '900' },

  /* Search */
  searchWrapper: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: 7,
    minHeight: 52,
    borderWidth: 1,
    borderColor: 'rgba(227,6,19,0.12)',
    ...Shadow.md,
  },
  searchIconButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
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

  /* Section */
  section: { paddingHorizontal: Spacing.lg, marginBottom: 22 },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 14,
    letterSpacing: -0.35,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionAction: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  sectionActionButton: {
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionActionDisabled: { opacity: 0.45 },

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
    backgroundColor: 'rgba(0,0,0,0.20)',
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
  offerTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.white, textShadowColor: 'rgba(0,0,0,0.65)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  offerSub: { fontSize: FontSize.xs, color: Colors.white, marginTop: 4, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
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

  showcaseRow: { gap: 12, paddingRight: 4 },
  showcaseLoading: { width: 150, height: 190, alignItems: 'center', justifyContent: 'center' },
  showcaseEmpty: { color: Colors.textMuted, fontSize: FontSize.sm, paddingVertical: 30 },
  homeServiceCard: { width: 156, minHeight: 200, padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, ...Shadow.sm },
  homeServiceArt: { height: 86, overflow: 'hidden', borderRadius: Radius.md, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  homeServiceImage: { width: '100%', height: '100%' },
  homeServiceCategory: { marginTop: 10, color: Colors.primary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  homeServiceName: { marginTop: 4, minHeight: 38, color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 18, fontWeight: '900' },
  homeServiceBottom: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  homeServicePrice: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' },

  /* Trending and groceries */
  trendingCard: {
    width: 166,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 9,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9EDF4',
    ...Shadow.md,
  },
  trendingArt: {
    height: 100,
    borderRadius: 14,
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
    minHeight: 34,
    paddingHorizontal: 2,
  },
  trendingSub: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  trendingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
    paddingLeft: 2,
  },
  trendingPrice: {
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  cardArrowButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Nearby properties */
  propertyNearCard: {
    width: 178,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 9,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9EDF4',
    ...Shadow.md,
  },
  propertyNearImageWrap: {
    height: 104,
    borderRadius: 14,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 11,
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
    minHeight: 34,
    paddingHorizontal: 2,
  },
  propertyNearAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 2,
    marginTop: 3,
  },
  propertyNearAddress: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  propertyNearFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 2,
    marginTop: 9,
  },
  propertyNearPrice: {
    color: Colors.secondary,
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  propertyNearArrow: { backgroundColor: Colors.secondaryLight },
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
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  quickCard: {
    width: '31.5%',
    minHeight: 108,
    borderRadius: Radius.lg,
    paddingHorizontal: 7,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.06)',
    ...Shadow.sm,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    color: Colors.textPrimary,
    fontWeight: '900',
    lineHeight: 14,
    textAlign: 'center',
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
