import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import { getServiceCatalog } from '../services/serviceMarketplace';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function PennyWorksScreen({ navigation, route }) {
  const [catalog, setCatalog] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState(String(route.params?.search || ''));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getServiceCatalog();
      setCatalog(data);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visibleCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return catalog;
    return catalog.filter((category) =>
      `${category.name} ${category.description || ''} ${(category.packages || []).map((item) => `${item.name} ${item.description || ''}`).join(' ')}`
        .toLowerCase()
        .includes(query),
    );
  }, [catalog, search]);

  const selectedCategory = visibleCatalog.find((item) => item.id === selectedId) || null;
  const packages = selectedCategory
    ? selectedCategory.packages || []
    : visibleCatalog.flatMap((category) => (category.packages || []).map((item) => ({ ...item, category })));

  const openService = (servicePackage, category = selectedCategory || servicePackage.category) => {
    navigation.navigate('ServiceDetail', { servicePackage, category });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Home Services</Text>
          <Text style={styles.subtitle}>Admin-priced services from verified professionals</Text>
        </View>
      </View>

      {loading ? <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View> : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={load}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={packages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.content}
          ListHeaderComponent={(
            <>
              <View style={styles.hero}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>ALL YOUR HOME REPAIR NEEDS</Text>
                  <Text style={styles.heroTitle}>Expert service, one tap away.</Text>
                  <Text style={styles.heroText}>Choose a service and book at the price set by Superbucket.</Text>
                </View>
                <View style={styles.heroIcon}><Feather name="tool" size={42} color={Colors.white} /></View>
              </View>

              <View style={styles.searchBox}>
                <Feather name="search" size={18} color={Colors.textMuted} />
                <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search for a service" placeholderTextColor={Colors.textMuted} />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shop by category</Text>
                {selectedCategory ? <TouchableOpacity onPress={() => setSelectedId(null)}><Text style={styles.viewAll}>View all</Text></TouchableOpacity> : null}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {visibleCatalog.map((category) => {
                  const active = selectedCategory?.id === category.id;
                  return (
                    <TouchableOpacity key={category.id} style={[styles.categoryCard, active && styles.categoryCardActive]} onPress={() => setSelectedId(active ? null : category.id)}>
                      <Text style={styles.categoryIcon}>{category.icon || category.name.charAt(0)}</Text>
                      <Text style={[styles.categoryName, active && styles.categoryNameActive]} numberOfLines={2}>{category.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.servicesTitle}>{selectedCategory ? selectedCategory.name : 'Book a service'}</Text>
            </>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No active services found.</Text>}
          renderItem={({ item }) => {
            const category = selectedCategory || item.category;
            return (
              <TouchableOpacity style={styles.serviceCard} activeOpacity={0.86} onPress={() => openService(item, category)}>
                <View style={styles.serviceIcon}><Feather name="tool" size={22} color={Colors.primary} /></View>
                <View style={styles.serviceCopy}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={2}>{item.description || category?.description || 'Professional home service'}</Text>
                  <Text style={styles.serviceMeta}>{item.durationMinutes} min · Price set by Superbucket</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.price}>Rs {Number(item.price).toFixed(0)}</Text>
                  <Text style={styles.book}>Book</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingHorizontal: Spacing.lg, paddingBottom: 16, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1 }, title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' }, subtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, error: { color: Colors.danger, textAlign: 'center' }, retry: { marginTop: 14, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 9 }, retryText: { color: Colors.white, fontWeight: '800' },
  content: { padding: Spacing.lg, paddingBottom: 80 },
  hero: { minHeight: 180, flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, padding: 20, backgroundColor: '#073B7A', overflow: 'hidden', ...Shadow.md },
  heroCopy: { flex: 1 }, heroEyebrow: { color: '#FBBF24', fontSize: 10, fontWeight: '900' }, heroTitle: { marginTop: 6, color: Colors.white, fontSize: 25, lineHeight: 29, fontWeight: '900' }, heroText: { marginTop: 8, color: 'rgba(255,255,255,0.78)', fontSize: FontSize.xs, lineHeight: 17 },
  heroIcon: { width: 78, height: 78, marginLeft: 12, borderRadius: 39, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchBox: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.white, paddingHorizontal: 13 }, searchInput: { flex: 1, paddingVertical: 12, color: Colors.textPrimary },
  sectionHeader: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' }, viewAll: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '800' },
  categoryRow: { gap: 10, paddingBottom: 4 }, categoryCard: { width: 88, minHeight: 90, alignItems: 'center', justifyContent: 'center', padding: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.white }, categoryCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight }, categoryIcon: { color: Colors.primary, fontSize: 25, fontWeight: '900' }, categoryName: { marginTop: 7, color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center' }, categoryNameActive: { color: Colors.primary },
  servicesTitle: { marginTop: 25, marginBottom: 12, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  serviceCard: { marginBottom: 11, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.white, ...Shadow.sm }, serviceIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight }, serviceCopy: { flex: 1 }, serviceName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' }, serviceDescription: { marginTop: 3, color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 16 }, serviceMeta: { marginTop: 5, color: Colors.textMuted, fontSize: 10 }, priceBox: { alignItems: 'flex-end' }, price: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' }, book: { marginTop: 6, color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' }, empty: { padding: 30, textAlign: 'center', color: Colors.textMuted },
});
