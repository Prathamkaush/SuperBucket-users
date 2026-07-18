import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import BusinessAdDetailsModal from '../components/BusinessAdDetailsModal';
import { getLocalShops, registerBusinessAdClick } from '../services/homeOffers';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function LocalShopsScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);

  const loadShops = useCallback(async () => {
    try { setLoading(true); setShops(await getLocalShops()); } catch { setShops([]); } finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadShops(); }, [loadShops]));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}><BackButton onPress={() => navigation.goBack()} /><View><Text style={styles.title}>Local Shops</Text><Text style={styles.sub}>Discover businesses near you</Text></View></View>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadShops} tintColor={Colors.primary} />}>
        {loading && !shops.length ? <ActivityIndicator color={Colors.primary} style={styles.loader} /> : null}
        {!loading && !shops.length ? (
          <View style={styles.empty}><MaterialCommunityIcons name="storefront-outline" size={52} color={Colors.gray400} /><Text style={styles.emptyTitle}>No local shops yet</Text><Text style={styles.emptySub}>Active local shop listings will appear here.</Text></View>
        ) : null}
        {shops.map((shop) => (
          <TouchableOpacity key={shop.id} style={styles.card} onPress={() => { registerBusinessAdClick(shop.id).catch(() => undefined); setSelectedShop(shop); }} activeOpacity={0.84}>
            {shop.imageUrl ? <Image source={{ uri: shop.imageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><MaterialCommunityIcons name="storefront-outline" size={34} color={Colors.primary} /></View>}
            <View style={styles.copy}>{shop.category ? <Text style={styles.category}>{shop.category}</Text> : null}<Text style={styles.shopName}>{shop.businessName}</Text><Text style={styles.description} numberOfLines={2}>{shop.offerText || shop.description}</Text><View style={styles.addressRow}><Feather name="map-pin" size={13} color={Colors.textMuted} /><Text style={styles.address} numberOfLines={1}>{shop.address}</Text></View></View>
            <Feather name="chevron-right" size={20} color={Colors.gray400} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BusinessAdDetailsModal ad={selectedShop} visible={Boolean(selectedShop)} onClose={() => setSelectedShop(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 48, paddingBottom: 18, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' }, sub: { marginTop: 3, color: Colors.textSecondary, fontSize: FontSize.xs },
  content: { padding: Spacing.lg, gap: 13, flexGrow: 1 }, loader: { marginTop: 60 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }, emptyTitle: { marginTop: 13, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' }, emptySub: { marginTop: 5, color: Colors.textMuted, fontSize: FontSize.sm },
  card: { padding: 12, borderRadius: Radius.lg, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadow.sm },
  image: { width: 82, height: 82, borderRadius: Radius.md, backgroundColor: Colors.gray100 }, placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight }, copy: { flex: 1 },
  category: { color: Colors.primary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }, shopName: { marginTop: 3, color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' }, description: { marginTop: 4, color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 16 },
  addressRow: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 5 }, address: { flex: 1, color: Colors.textMuted, fontSize: 10 },
});
