import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import BackButton from '../components/BackButton';
import { getUploadUrl } from '../services/api';
import { getServiceBooking, getServiceInvoice } from '../services/serviceMarketplace';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function ServiceBookingDetailScreen({ navigation, route }) {
  const [booking, setBooking] = useState(route.params?.booking || null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const load = useCallback(async () => {
    try { setBooking(await getServiceBooking(route.params.bookingId)); }
    catch (error) { Alert.alert('Could not load service details', error.message); }
    finally { setLoading(false); }
  }, [route.params.bookingId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const downloadInvoice = async () => {
    try {
      setDownloading(true);
      const invoice = await getServiceInvoice(booking.id);
      const { uri } = await Print.printToFileAsync({ html: invoiceHtml(invoice) });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save service invoice', UTI: 'com.adobe.pdf' });
      else Alert.alert('Invoice created', uri);
    } catch (error) { Alert.alert('Could not download invoice', error.message); }
    finally { setDownloading(false); }
  };

  if (loading && !booking) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  if (!booking) return <View style={styles.center}><Text>Service details unavailable.</Text></View>;
  const extension = booking.extension;
  const provider = booking.provider;
  const extensionImages = extension ? [extension.problemImage1, extension.problemImage2, extension.solvedImage1, extension.solvedImage2] : [];
  return <View style={styles.page}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
    <View style={styles.header}><BackButton onPress={() => navigation.goBack()} /><View><Text style={styles.title}>Service details</Text><Text style={styles.bookingNumber}>{booking.bookingNumber}</Text></View></View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.summary}><Text style={styles.category}>{booking.categoryName}</Text><Text style={styles.service}>{booking.serviceName}</Text><Text style={styles.meta}>{new Date(booking.scheduledAt).toLocaleString()}</Text><View style={styles.priceRow}><Text style={styles.status}>{booking.status.replace(/_/g, ' ')}</Text><Text style={styles.price}>Rs {Number(booking.price).toFixed(0)}</Text></View></View>
      {provider ? <><Text style={styles.sectionTitle}>Service provider</Text><View style={styles.card}><Info label="Name" value={provider.name || 'Service Partner'} /><Info label="Phone" value={provider.phone || 'Not provided'} /><Info label="Experience" value={`${provider.providerProfile?.experienceYears || 0} years`} /><Info label="Rating" value={provider.averageRating ? `${provider.averageRating} (${provider.ratingCount || 0} ratings)` : 'New provider'} /><Info label="About" value={provider.providerProfile?.bio || 'Verified Superbucket service provider'} /></View></> : null}
      {extension ? <><Text style={styles.sectionTitle}>Extended work</Text><View style={styles.extensionCard}><Text style={styles.extensionName}>{extension.serviceName}</Text><Info label="Customer" value={extension.customerName} /><Info label="Time taken" value={`${extension.durationMinutes} minutes`} /><Info label="Extended charge" value={`Rs ${Number(extension.charge).toFixed(0)}`} /><Text style={styles.photoHeading}>Problem and completed-work photos</Text><View style={styles.photoGrid}>{extensionImages.map((value, index) => <View key={value} style={styles.photoWrap}><Image source={{ uri: getUploadUrl('service-extensions', value) }} style={styles.photo} /><Text style={styles.photoLabel}>{index < 2 ? `Problem ${index + 1}` : `Solved ${index - 1}`}</Text></View>)}</View></View></> : null}
      {booking.status === 'COMPLETED' ? <TouchableOpacity style={styles.invoiceButton} disabled={downloading} onPress={downloadInvoice}>{downloading ? <ActivityIndicator color={Colors.white} /> : <><Feather name="download" size={18} color={Colors.white} /><Text style={styles.invoiceText}>DOWNLOAD SERVICE INVOICE</Text></>}</TouchableOpacity> : null}
    </ScrollView>
  </View>;
}

function Info({ label, value }) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }
function invoiceHtml(invoice) {
  const extension = invoice.extension;
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#111;padding:36px}h1{color:#e30613;margin:0}.muted{color:#666}.box{margin-top:24px;border:1px solid #ddd;border-radius:10px;padding:18px}.row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #eee}.total{font-size:20px;font-weight:700;border-bottom:0}</style></head><body><h1>Superbucket Service Invoice</h1><p class="muted">${escapeHtml(invoice.invoiceNumber)} · ${new Date(invoice.issuedAt).toLocaleDateString()}</p><div class="box"><p><b>Booking:</b> ${escapeHtml(invoice.bookingNumber)}</p><p><b>Customer:</b> ${escapeHtml(invoice.customerName)}</p><p><b>Provider:</b> ${escapeHtml(invoice.providerName)}</p><p><b>Service:</b> ${escapeHtml(invoice.serviceName)}</p></div><div class="box"><div class="row"><span>Inspection/service charge</span><b>Rs ${Number(invoice.baseCharge).toFixed(2)}</b></div>${extension ? `<div class="row"><span>Extended: ${escapeHtml(extension.serviceName)} (${extension.durationMinutes} minutes)</span><b>Rs ${Number(extension.charge).toFixed(2)}</b></div>` : ''}<div class="row total"><span>Total</span><span>Rs ${Number(invoice.total).toFixed(2)}</span></div></div></body></html>`;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: Colors.background }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, header: { paddingTop: 50, paddingHorizontal: Spacing.lg, paddingBottom: 16, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' }, bookingNumber: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.xs }, content: { padding: Spacing.lg, paddingBottom: 60 }, summary: { padding: 17, borderRadius: Radius.lg, backgroundColor: Colors.white, ...Shadow.sm }, category: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' }, service: { marginTop: 5, color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' }, meta: { marginTop: 8, color: Colors.textSecondary, fontSize: FontSize.xs }, priceRow: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' }, status: { color: Colors.success, fontWeight: '900' }, price: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '900' }, sectionTitle: { marginTop: 22, marginBottom: 9, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' }, card: { padding: 16, borderRadius: Radius.lg, backgroundColor: Colors.white, ...Shadow.sm }, info: { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border }, infoLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }, infoValue: { marginTop: 3, color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 19, fontWeight: '700' }, extensionCard: { padding: 16, borderRadius: Radius.lg, backgroundColor: Colors.warningLight, ...Shadow.sm }, extensionName: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900', marginBottom: 5 }, photoHeading: { marginTop: 16, marginBottom: 9, color: Colors.textPrimary, fontWeight: '900' }, photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, photoWrap: { width: '48%' }, photo: { width: '100%', aspectRatio: 1.25, borderRadius: Radius.md, backgroundColor: Colors.gray100 }, photoLabel: { marginTop: 4, color: Colors.textSecondary, fontSize: 10, fontWeight: '800' }, invoiceButton: { marginTop: 24, minHeight: 52, borderRadius: Radius.md, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, invoiceText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' } });
