import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import { getServiceCatalog } from '../services/serviceMarketplace';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function PennyWorksScreen({ navigation }) {
  const [catalog, setCatalog] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setCatalog(await getServiceCatalog());
    } catch (e) {
      setError(e?.message || 'Unable to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Home Services</Text>
          <Text style={styles.subtitle}>Fixed prices. Verified professionals.</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ServiceBookings')}>
          <Text style={styles.orders}>My bookings</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {catalog.map((category) => {
            const expanded = selectedId === category.id;
            return (
              <View key={category.id} style={styles.card}>
                <TouchableOpacity style={styles.categoryRow} onPress={() => setSelectedId(expanded ? null : category.id)}>
                  <View style={styles.icon}><Text style={styles.iconText}>{category.icon || category.name[0]}</Text></View>
                  <View style={styles.categoryCopy}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                    <Text style={styles.available}>{category._count?.providers || 0} providers online</Text>
                  </View>
                  <Text style={styles.chevron}>{expanded ? '-' : '+'}</Text>
                </TouchableOpacity>
                {expanded && category.packages.map((item) => (
                  <View key={item.id} style={styles.packageRow}>
                    <View style={styles.packageCopy}>
                      <Text style={styles.packageName}>{item.name}</Text>
                      <Text style={styles.packageDescription}>{item.description}</Text>
                      <Text style={styles.duration}>{item.durationMinutes} min</Text>
                    </View>
                    <View style={styles.priceColumn}>
                      <Text style={styles.price}>₹{Number(item.price).toFixed(0)}</Text>
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('ServiceCheckout', { servicePackage: item, category })}
                      >
                        <Text style={styles.bookText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
          {!error && !catalog.length ? <Text style={styles.empty}>No services are available yet.</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingHorizontal: Spacing.lg, paddingBottom: 16, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1 }, title: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 }, orders: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '800' },
  content: { padding: Spacing.lg, paddingBottom: 60, gap: 14 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: Colors.danger, textAlign: 'center', padding: 20 }, empty: { color: Colors.textMuted, textAlign: 'center', padding: 30 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, overflow: 'hidden', ...Shadow.sm },
  categoryRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: Colors.secondary, fontSize: FontSize.xl, fontWeight: '900' }, categoryCopy: { flex: 1 },
  categoryName: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textPrimary }, categoryDescription: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  available: { fontSize: FontSize.xs, color: Colors.success, fontWeight: '700', marginTop: 5 }, chevron: { fontSize: 24, color: Colors.secondary },
  packageRow: { borderTopWidth: 1, borderTopColor: Colors.border, padding: 16, flexDirection: 'row', gap: 12 }, packageCopy: { flex: 1 },
  packageName: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary }, packageDescription: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 4, lineHeight: 17 },
  duration: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 6 }, priceColumn: { alignItems: 'flex-end', justifyContent: 'space-between' },
  price: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '900' }, bookButton: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 18, paddingVertical: 9 },
  bookText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.sm },
});
