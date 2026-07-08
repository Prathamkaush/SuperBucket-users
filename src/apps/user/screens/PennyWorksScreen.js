import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Star } from 'lucide-react-native';
import BackButton from '../components/BackButton';
import { getUploadUrl } from '../services/api';
import { getServiceCatalog, getServiceProviders } from '../services/serviceMarketplace';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const PAGE_SIZE = 10;

export default function PennyWorksScreen({ navigation, route }) {
  const searchTerm = String(route.params?.search || '').trim();
  const [catalog, setCatalog] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [providers, setProviders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const selectedCategory = catalog.find((item) => item.id === selectedId) || catalog[0];

  const loadCatalog = useCallback(async () => {
    const data = await getServiceCatalog();
    const visible = searchTerm ? filterCatalog(data, searchTerm) : data;
    setCatalog(visible);
    setSelectedId((current) => (
      visible.some((item) => item.id === current) ? current : visible[0]?.id || null
    ));
  }, [searchTerm]);

  const loadProviders = useCallback(async (nextPage = 1, append = false) => {
    const categoryId = selectedCategory?.id;
    if (!categoryId) {
      setProviders([]);
      setHasMore(false);
      return;
    }

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      setError('');
      const response = await getServiceProviders({ categoryId, page: nextPage, limit: PAGE_SIZE });
      setProviders((current) => (append ? [...current, ...(response.items || [])] : response.items || []));
      setPage(nextPage);
      setHasMore(Boolean(response.meta?.hasMore));
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load providers');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [selectedCategory?.id]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadCatalog().catch((loadError) => {
        setError(loadError?.message || 'Unable to load services');
        setLoading(false);
      });
    }, [loadCatalog]),
  );

  useEffect(() => {
    if (selectedCategory?.id) loadProviders(1, false);
  }, [selectedCategory?.id, loadProviders]);

  const refresh = async () => {
    setRefreshing(true);
    await loadCatalog().catch((loadError) => setError(loadError?.message || 'Unable to load services'));
    await loadProviders(1, false);
  };

  const loadMore = () => {
    if (!hasMore || loading || loadingMore) return;
    loadProviders(page + 1, true);
  };

  const openCheckout = (provider) => {
    const servicePackage = selectedCategory?.packages?.[0] || provider.categories?.[0]?.packages?.[0];
    if (!servicePackage) return;
    navigation.navigate('ServiceCheckout', {
      servicePackage,
      category: selectedCategory,
      provider,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Penny Works</Text>
          <Text style={styles.subtitle}>
            {searchTerm ? `Search results for "${searchTerm}"` : 'Choose a verified service partner'}
          </Text>
        </View>
      </View>

      <View style={styles.categoryBand}>
        <FlatList
          horizontal
          data={catalog}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const active = selectedCategory?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => {
                  setSelectedId(item.id);
                  setProviders([]);
                }}
              >
                <Text style={styles.categoryIcon}>{item.icon || item.name?.charAt(0) || 'S'}</Text>
                <Text style={[styles.categoryText, active && styles.categoryTextActive]} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading && !providers.length ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.45}
          ListHeaderComponent={(
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{selectedCategory?.name || 'Service providers'}</Text>
              <Text style={styles.listSub}>Showing 10 providers at a time. Scroll for more.</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          )}
          ListEmptyComponent={!error ? <Text style={styles.empty}>No providers are online for this category right now.</Text> : null}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={Colors.primary} style={{ padding: 18 }} /> : null}
          renderItem={({ item }) => (
            <ProviderCard provider={item} onBook={() => openCheckout(item)} />
          )}
        />
      )}
    </View>
  );
}

function ProviderCard({ provider, onBook }) {
  const imageUrl = provider.profileImage ? getUploadUrl('profiles', provider.profileImage) : null;
  const rating = provider.averageRating || 'New';
  const price = provider.startingPrice ? `From Rs ${Number(provider.startingPrice).toFixed(0)}` : 'Price shown at booking';

  return (
    <View style={styles.providerCard}>
      <View style={styles.providerTop}>
        <View style={styles.avatar}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{provider.name?.charAt(0) || 'P'}</Text>
          )}
        </View>
        <View style={styles.providerCopy}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName} numberOfLines={1}>{provider.name}</Text>
            <View style={styles.ratingPill}>
              <Star size={12} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
          <Text style={styles.providerMeta} numberOfLines={1}>
            {provider.experienceYears || 0} yrs exp · {provider.city || 'Nearby'}
          </Text>
          <Text style={styles.providerBio} numberOfLines={2}>
            {provider.bio || 'Verified Superbucket service partner available for bookings.'}
          </Text>
        </View>
      </View>
      <View style={styles.providerBottom}>
        <View>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.jobs}>{provider.completedJobs || 0} jobs · {provider.ratingCount || 0} ratings</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={onBook}>
          <Text style={styles.bookText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function filterCatalog(catalog = [], term = '') {
  const query = term.toLowerCase();
  return catalog.filter((category) => {
    const categoryText = `${category.name || ''} ${category.description || ''}`.toLowerCase();
    const packageText = (category.packages || [])
      .map((item) => `${item.name || ''} ${item.description || ''}`)
      .join(' ')
      .toLowerCase();
    return categoryText.includes(query) || packageText.includes(query);
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingHorizontal: Spacing.lg, paddingBottom: 16, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1 },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  categoryBand: { backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoryList: { paddingHorizontal: Spacing.lg, paddingVertical: 12, gap: 10 },
  categoryChip: {
    width: 96,
    minHeight: 78,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  categoryChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  categoryIcon: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  categoryText: { marginTop: 6, color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center' },
  categoryTextActive: { color: Colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, paddingBottom: 70 },
  listHeader: { marginBottom: 12 },
  listTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  listSub: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 3 },
  error: { color: Colors.danger, marginTop: 10, fontSize: FontSize.xs, fontWeight: '700' },
  empty: { color: Colors.textMuted, textAlign: 'center', padding: 28 },
  providerCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 12,
    ...Shadow.sm,
  },
  providerTop: { flexDirection: 'row', gap: 12 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: Colors.secondary, fontSize: FontSize.xl, fontWeight: '900' },
  providerCopy: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  providerName: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warningLight, borderRadius: Radius.full, paddingHorizontal: 7, paddingVertical: 4 },
  ratingText: { color: Colors.textPrimary, fontSize: FontSize.xxs, fontWeight: '900' },
  providerMeta: { color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '800', marginTop: 4 },
  providerBio: { color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 17, marginTop: 6 },
  providerBottom: { marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '900' },
  jobs: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 3 },
  bookButton: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 22, paddingVertical: 11 },
  bookText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
});
