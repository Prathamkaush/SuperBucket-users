import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function ServiceDetailScreen({ navigation, route }) {
  const { servicePackage, category } = route.params || {};
  if (!servicePackage) return null;

  const included = buildIncludedItems(servicePackage.description);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Service details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Feather name="tool" size={52} color={Colors.white} /></View>
          <Text style={styles.category}>{category?.name || 'Home service'}</Text>
          <Text style={styles.title}>{servicePackage.name}</Text>
          <Text style={styles.description}>{servicePackage.description || 'Professional service delivered by a verified Superbucket partner.'}</Text>
          <View style={styles.ratingLine}>
            <Text style={styles.verified}>✓ Verified professional</Text>
            <Text style={styles.duration}>{servicePackage.durationMinutes} minutes</Text>
          </View>
        </View>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>Service price</Text>
            <Text style={styles.price}>Rs {Number(servicePackage.price).toFixed(0)}</Text>
          </View>
          <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>SET BY SUPERBUCKET</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service includes</Text>
          {included.map((item) => (
            <View key={item} style={styles.includeRow}>
              <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How it works</Text>
          {[
            'Choose your address and preferred time.',
            'Your service order is offered to verified professionals.',
            'A professional accepts and visits your location.',
            'Share the completion OTP only after the work is complete.',
          ].map((item, index) => (
            <View key={item} style={styles.stepRow}>
              <View style={styles.step}><Text style={styles.stepText}>{index + 1}</Text></View>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>Replacement parts or extra work are not included in the service price and require your approval.</Text>
      </ScrollView>
      <View style={styles.bottomBar}>
        <View><Text style={styles.bottomLabel}>Total service price</Text><Text style={styles.bottomPrice}>Rs {Number(servicePackage.price).toFixed(0)}</Text></View>
        <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('ServiceCheckout', { servicePackage, category })}>
          <Text style={styles.bookText}>Book now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function buildIncludedItems(description) {
  const items = String(description || '').split(/[\n;]+/).map((item) => item.trim()).filter(Boolean);
  return items.length > 1 ? items.slice(0, 6) : [
    'Inspection and diagnosis',
    'Professional labour for the selected service',
    'Basic cleanup after service',
    'Service completion support',
  ];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, header: { paddingTop: 50, paddingHorizontal: Spacing.lg, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.primaryLight }, headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' }, content: { padding: Spacing.lg, paddingBottom: 130 },
  hero: { minHeight: 260, padding: 22, justifyContent: 'flex-end', borderRadius: Radius.lg, backgroundColor: '#073B7A', ...Shadow.md }, heroIcon: { position: 'absolute', top: 25, right: 25, width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }, category: { color: '#FBBF24', fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' }, title: { marginTop: 6, color: Colors.white, fontSize: 28, fontWeight: '900' }, description: { marginTop: 8, color: 'rgba(255,255,255,0.82)', fontSize: FontSize.sm, lineHeight: 20 }, ratingLine: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, verified: { color: '#86EFAC', fontSize: FontSize.xs, fontWeight: '800' }, duration: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '800' },
  priceCard: { marginTop: 14, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.lg, backgroundColor: Colors.white, ...Shadow.sm }, priceLabel: { color: Colors.textMuted, fontSize: FontSize.xs }, price: { marginTop: 2, color: Colors.primary, fontSize: FontSize.xxl, fontWeight: '900' }, adminBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.primaryLight }, adminBadgeText: { color: Colors.primary, fontSize: 9, fontWeight: '900' },
  card: { marginTop: 14, padding: 17, borderRadius: Radius.lg, backgroundColor: Colors.white, ...Shadow.sm }, cardTitle: { marginBottom: 11, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' }, includeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 }, check: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successLight }, checkText: { color: Colors.success, fontWeight: '900' }, includeText: { flex: 1, color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 19 }, stepRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 8 }, step: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.secondary }, stepText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' }, note: { marginTop: 15, color: Colors.textMuted, fontSize: FontSize.xs, lineHeight: 18, textAlign: 'center' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.lg, paddingTop: 12, paddingBottom: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white }, bottomLabel: { color: Colors.textMuted, fontSize: FontSize.xs }, bottomPrice: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' }, bookButton: { minWidth: 150, alignItems: 'center', paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.primary }, bookText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
});
