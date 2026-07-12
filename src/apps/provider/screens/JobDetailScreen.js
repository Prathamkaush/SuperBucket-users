import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getJobDetails } from '../services/provider';
import { Colors, card } from '../theme';

export default function JobDetailScreen({ navigation, route }) {
  const [job, setJob] = useState(route.params?.job || null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setJob(await getJobDetails(route.params.jobId)); }
    catch (error) { Alert.alert('Could not load job', error.message); }
    finally { setLoading(false); }
  }, [route.params.jobId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading && !job) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  if (!job) return <View style={styles.center}><Text>Job details unavailable.</Text></View>;
  const address = job.address || {};
  const addressText = formatAddress(address);
  const phone = job.customer?.phone || address.phone;
  const open = async (url, fallback) => {
    try { await Linking.openURL(url); } catch { Alert.alert(fallback); }
  };
  const directionsUrl = address.latitude && address.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;

  return <View style={styles.page}>
    <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={21} color={Colors.text} /></TouchableOpacity><View><Text style={styles.headerTitle}>Job details</Text><Text style={styles.booking}>{job.bookingNumber}</Text></View></View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.summary}><View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>{job.categoryName}</Text><Text style={styles.service}>{job.serviceName}</Text></View><Text style={styles.earning}>Rs {Number(job.providerEarning).toFixed(0)}</Text></View><Text style={styles.time}>{new Date(job.scheduledAt).toLocaleString()}</Text><Text style={styles.status}>{String(job.status).replace(/_/g, ' ')}</Text></View>

      <Text style={styles.sectionTitle}>Customer</Text>
      <View style={styles.infoCard}><Info icon="user" label="Name" value={job.customer?.name || address.name || 'Customer'} /><Info icon="phone" label="Phone" value={phone || 'Not provided'} /><Info icon="mail" label="Email" value={job.customer?.email || 'Not provided'} /></View>
      {phone ? <View style={styles.actions}><TouchableOpacity style={styles.call} onPress={() => open(`tel:${phone}`, 'Calling is not available')}><Feather name="phone" size={18} color={Colors.white} /><Text style={styles.actionText}>Call customer</Text></TouchableOpacity><TouchableOpacity style={styles.message} onPress={() => open(`sms:${phone}`, 'Messaging is not available')}><Feather name="message-circle" size={18} color={Colors.secondary} /><Text style={styles.messageText}>Message</Text></TouchableOpacity></View> : null}

      <Text style={styles.sectionTitle}>Service location</Text>
      <View style={styles.infoCard}><Info icon="map-pin" label="Full address" value={addressText} /><Info icon="home" label="Contact at address" value={[address.name, address.phone].filter(Boolean).join(' · ') || 'Same as customer'} /></View>
      <TouchableOpacity style={styles.directions} onPress={() => open(directionsUrl, 'Maps could not be opened')}><Feather name="navigation" size={18} color={Colors.white} /><Text style={styles.actionText}>View location & directions</Text></TouchableOpacity>

      {job.customerNote ? <><Text style={styles.sectionTitle}>Customer note</Text><View style={styles.note}><Text style={styles.noteText}>{job.customerNote}</Text></View></> : null}
    </ScrollView>
  </View>;
}

function Info({ icon, label, value }) { return <View style={styles.infoRow}><View style={styles.infoIcon}><Feather name={icon} size={17} color={Colors.secondary} /></View><View style={{ flex: 1 }}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View></View>; }
function formatAddress(a) { return [a.house, a.street, a.area, a.landmark, a.city, a.state, a.pincode].filter(Boolean).join(', ') || 'Address unavailable'; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }, header: { paddingTop: 52, paddingHorizontal: 18, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }, back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray50 }, headerTitle: { fontSize: 20, fontWeight: '900' }, booking: { color: Colors.muted, fontSize: 11, marginTop: 2 }, content: { padding: 18, paddingBottom: 50 },
  summary: { ...card }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, eyebrow: { color: Colors.secondary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }, service: { fontSize: 20, fontWeight: '900', marginTop: 4 }, earning: { color: Colors.success, fontSize: 19, fontWeight: '900' }, time: { color: Colors.textSecondary, marginTop: 12, fontWeight: '700' }, status: { color: Colors.primary, marginTop: 8, fontSize: 11, fontWeight: '900' }, sectionTitle: { fontSize: 16, fontWeight: '900', marginTop: 22, marginBottom: 9 }, infoCard: { ...card, paddingVertical: 4 }, infoRow: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', paddingVertical: 11 }, infoIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center' }, infoLabel: { color: Colors.muted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }, infoValue: { color: Colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 }, call: { flex: 1, minHeight: 48, borderRadius: 11, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, message: { flex: 1, minHeight: 48, borderRadius: 11, backgroundColor: Colors.secondaryLight, borderWidth: 1, borderColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, actionText: { color: Colors.white, fontWeight: '900' }, messageText: { color: Colors.secondary, fontWeight: '900' }, directions: { marginTop: 12, minHeight: 50, borderRadius: 11, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, note: { ...card, backgroundColor: Colors.warningLight }, noteText: { color: Colors.textSecondary, lineHeight: 20 },
});
