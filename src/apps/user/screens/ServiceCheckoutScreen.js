import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BackButton from '../components/BackButton';
import { getAddresses } from '../services/addresses';
import { createServiceBooking } from '../services/serviceMarketplace';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

function nextSlots() {
  const base = new Date();
  const first = new Date(base.getTime() + 2 * 60 * 60 * 1000);
  first.setMinutes(first.getMinutes() < 30 ? 30 : 0, 0, 0);
  if (first.getMinutes() === 0) first.setHours(first.getHours() + 1);
  return [first, new Date(first.getTime() + 3 * 60 * 60 * 1000), new Date(first.getTime() + 24 * 60 * 60 * 1000)];
}

export default function ServiceCheckoutScreen({ navigation, route }) {
  const { servicePackage, category, provider } = route.params;
  const slots = useMemo(nextSlots, []);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [slot, setSlot] = useState(slots[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAddresses().then((items) => {
      setAddresses(items);
      setAddressId((items.find((item) => item.isDefault) || items[0])?.id || null);
    }).catch((e) => Alert.alert('Address unavailable', e.message)).finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    const address = addresses.find((item) => item.id === addressId);
    if (!address) {
      Alert.alert('Add an address', 'Save a delivery address before booking a service.');
      return;
    }
    try {
      setSubmitting(true);
      await createServiceBooking({ packageId: servicePackage.id, providerId: provider?.id, scheduledAt: slot.toISOString(), address, customerNote: note });
      Alert.alert('Service order placed', provider ? `${provider.name} has been assigned to your service order.` : 'Your service order is ready for a verified professional to accept.', [
        { text: 'View booking', onPress: () => navigation.replace('ServiceBookings') },
      ]);
    } catch (e) {
      Alert.alert('Booking failed', e.message);
    } finally { setSubmitting(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}><BackButton onPress={() => navigation.goBack()} /><Text style={styles.headerTitle}>Confirm service order</Text></View>
      {loading ? <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View> : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.summary}>
            <Text style={styles.eyebrow}>{category.name}</Text>
            <Text style={styles.service}>{servicePackage.name}</Text>
            <Text style={styles.description}>{servicePackage.description}</Text>
            {provider ? (
              <View style={styles.providerBox}>
                <Text style={styles.providerLabel}>Selected worker</Text>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerMeta}>
                  {provider.averageRating ? `${provider.averageRating} stars` : 'New'} - {provider.experienceYears || 0} yrs exp
                </Text>
              </View>
            ) : null}
            <View style={styles.summaryBottom}>
              <Text>{servicePackage.durationMinutes} minutes</Text>
              <Text style={styles.price}>Rs {Number(servicePackage.price).toFixed(0)}</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>Choose time</Text>
          <View style={styles.options}>{slots.map((item) => <TouchableOpacity key={item.toISOString()} style={[styles.option, slot === item && styles.optionActive]} onPress={() => setSlot(item)}><Text style={[styles.optionText, slot === item && styles.optionTextActive]}>{item.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</Text></TouchableOpacity>)}</View>
          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Service address</Text><TouchableOpacity onPress={() => navigation.navigate('Location')}><Text style={styles.link}>Add address</Text></TouchableOpacity></View>
          {addresses.map((item) => <TouchableOpacity key={item.id} style={[styles.address, addressId === item.id && styles.addressActive]} onPress={() => setAddressId(item.id)}><Text style={styles.addressName}>{item.name} · {item.phone}</Text><Text style={styles.addressText}>{item.street}, {item.city}, {item.state} {item.pincode}</Text></TouchableOpacity>)}
          {!addresses.length ? <Text style={styles.empty}>No saved address found.</Text> : null}
          <Text style={styles.sectionTitle}>Anything we should know?</Text>
          <TextInput style={styles.note} multiline value={note} onChangeText={setNote} placeholder="Describe the issue (optional)" placeholderTextColor={Colors.textMuted} />
          <TouchableOpacity style={[styles.confirm, submitting && styles.disabled]} disabled={submitting} onPress={submit}>{submitting ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.confirmText}>Place service order - Rs {Number(servicePackage.price).toFixed(0)}</Text>}</TouchableOpacity>
          <Text style={styles.disclaimer}>The service price is set by Superbucket admin and verified again by the server when this order is placed. Replacement parts require your separate approval.</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '900' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, content: { padding: Spacing.lg, paddingBottom: 50 },
  summary: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 18, ...Shadow.sm }, eyebrow: { color: Colors.secondary, fontWeight: '800', fontSize: FontSize.xs }, service: { fontSize: FontSize.xl, fontWeight: '900', marginTop: 5 },
  description: { color: Colors.textSecondary, marginTop: 6, lineHeight: 19 }, summaryBottom: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' }, price: { color: Colors.primary, fontWeight: '900', fontSize: FontSize.lg },
  providerBox: { marginTop: 14, borderRadius: Radius.md, backgroundColor: Colors.primaryLight, padding: 12 },
  providerLabel: { color: Colors.textMuted, fontSize: FontSize.xxs, fontWeight: '900', textTransform: 'uppercase' },
  providerName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900', marginTop: 3 },
  providerMeta: { color: Colors.secondary, fontSize: FontSize.xs, fontWeight: '800', marginTop: 3 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '900', marginTop: 22, marginBottom: 10 }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, link: { color: Colors.secondary, fontWeight: '800', marginTop: 14 },
  options: { flexDirection: 'row', gap: 8 }, option: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, padding: 10, borderRadius: Radius.md }, optionActive: { backgroundColor: Colors.secondaryLight, borderColor: Colors.secondary }, optionText: { textAlign: 'center', fontSize: FontSize.xs, fontWeight: '700' }, optionTextActive: { color: Colors.secondary },
  address: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, marginBottom: 8 }, addressActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight }, addressName: { fontWeight: '800' }, addressText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 4, lineHeight: 17 }, empty: { color: Colors.textMuted },
  note: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, minHeight: 90, padding: 13, textAlignVertical: 'top' }, confirm: { backgroundColor: Colors.primary, padding: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: 24, ...Shadow.redGlow }, confirmText: { color: Colors.white, fontWeight: '900' }, disabled: { opacity: 0.6 }, disclaimer: { color: Colors.textMuted, fontSize: FontSize.xs, textAlign: 'center', lineHeight: 17, marginTop: 12 },
});
