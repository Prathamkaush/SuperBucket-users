import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../components/BackButton';
import {
  acceptServiceRevisit,
  cancelServiceBooking,
  getMyServiceBookings,
  reviewServiceBooking,
} from '../services/serviceMarketplace';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const ACTIVE = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'REVISIT_REQUESTED'];
const STEPS = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'REVISIT_REQUESTED', 'COMPLETED'];

export default function ServiceBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const load = useCallback(async () => {
    try { setBookings(await getMyServiceBookings()); }
    catch (error) { Alert.alert('Could not load bookings', error.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const requestCancel = (booking) => {
    setCancelTarget(booking);
    setCancelReason('');
  };

  const submitCancel = async () => {
    if (!cancelTarget) return;
    const reason = cancelReason.trim();
    if (!reason) {
      Alert.alert('Reason required', 'Please tell us why you are cancelling this service.');
      return;
    }

    try {
      setSubmittingId(cancelTarget.id);
      await cancelServiceBooking(cancelTarget.id, reason);
      setCancelTarget(null);
      setCancelReason('');
      await load();
    } catch (error) {
      Alert.alert('Could not cancel', error.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const submitReview = async (booking) => {
    const rating = ratings[booking.id];
    if (!rating) return Alert.alert('Choose a rating', 'Tap between one and five stars.');
    try {
      setSubmittingId(booking.id);
      await reviewServiceBooking(booking.id, rating, reviews[booking.id] || '');
      await load();
    } catch (error) { Alert.alert('Could not submit review', error.message); }
    finally { setSubmittingId(null); }
  };

  const acceptRevisit = (booking) => {
    const scheduledAt = getSameTimeTomorrow(booking.scheduledAt);
    Alert.alert(
      'Accept revisit?',
      `The provider will revisit on ${scheduledAt.toLocaleString()}.`,
      [
        { text: 'Not now' },
        {
          text: 'Accept revisit',
          onPress: async () => {
            try {
              setSubmittingId(booking.id);
              await acceptServiceRevisit(booking.id, scheduledAt.toISOString());
              await load();
            } catch (error) {
              Alert.alert('Could not accept revisit', error.message);
            } finally {
              setSubmittingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}><BackButton onPress={() => navigation.goBack()} /><Text style={styles.title}>My service bookings</Text></View>
      {loading ? <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View> : (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
          {bookings.map((item) => {
            const currentStep = STEPS.indexOf(item.status);
            const profile = item.provider?.providerProfile;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.row}><Text style={styles.number}>{item.bookingNumber}</Text><View style={[styles.badge, { backgroundColor: ACTIVE.includes(item.status) ? Colors.secondaryLight : item.status === 'COMPLETED' ? Colors.successLight : Colors.gray100 }]}><Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text></View></View>
                <Text style={styles.service}>{item.serviceName}</Text>
                <Text style={styles.meta}>{new Date(item.scheduledAt).toLocaleString()}</Text>
                <Text style={styles.meta}>{item.address?.street}, {item.address?.city}</Text>
                <View style={styles.timeline}>{STEPS.map((step, index) => <View key={step} style={styles.stepWrap}><View style={[styles.stepDot, index <= currentStep && styles.stepDone]} />{index < STEPS.length - 1 ? <View style={[styles.stepLine, index < currentStep && styles.stepLineDone]} /> : null}</View>)}</View>
                <View style={styles.row}><Text style={styles.price}>₹{Number(item.price).toFixed(0)}</Text>{!item.provider ? <Text style={styles.finding}>Finding a provider</Text> : null}</View>

                {item.provider ? (
                  <View style={styles.providerCard}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{item.provider.name?.[0] || 'P'}</Text></View>
                    <View style={styles.providerCopy}>
                      <View style={styles.providerNameRow}><Text style={styles.providerName}>{item.provider.name || 'Service Partner'}</Text>{item.provider.isVerified ? <Text style={styles.verified}>✓ VERIFIED</Text> : null}</View>
                      <Text style={styles.providerMeta}>★ {item.provider.averageRating || 'New'} {item.provider.ratingCount ? `(${item.provider.ratingCount})` : ''} · {item.provider.completedJobs} jobs</Text>
                      <Text style={styles.providerMeta}>{profile?.experienceYears || 0} years experience · {profile?.city || 'Local provider'}</Text>
                    </View>
                  </View>
                ) : null}

                {['ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(item.status) ? <View style={styles.otp}><Text style={styles.otpLabel}>Completion OTP</Text><Text style={styles.otpValue}>{item.completionOtp}</Text><Text style={styles.otpHelp}>Share only after the work is finished.</Text></View> : null}
                {item.status === 'REVISIT_REQUESTED' ? (
                  <View style={styles.revisitBox}>
                    <Text style={styles.revisitTitle}>Revisit requested</Text>
                    <Text style={styles.revisitText}>{item.revisitReason || 'Provider reached your address but could not complete the service because you were unavailable.'}</Text>
                    <TouchableOpacity style={styles.revisitButton} disabled={submittingId === item.id} onPress={() => acceptRevisit(item)}>
                      {submittingId === item.id ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.revisitButtonText}>Accept revisit tomorrow</Text>}
                    </TouchableOpacity>
                  </View>
                ) : null}
                {item.status === 'CANCELLED' && item.cancellationReason ? <View style={styles.cancelReasonBox}><Text style={styles.cancelReasonTitle}>Cancellation reason</Text><Text style={styles.cancelReasonText}>{item.cancellationReason}</Text></View> : null}
                {['PENDING', 'ACCEPTED'].includes(item.status) ? <TouchableOpacity style={styles.cancel} onPress={() => requestCancel(item)}><Text style={styles.cancelText}>Cancel booking</Text></TouchableOpacity> : null}
                <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('ServiceBookingDetail', { bookingId: item.id, booking: item })}><Text style={styles.detailsButtonText}>View service details</Text></TouchableOpacity>

                {item.status === 'COMPLETED' && !item.rating ? (
                  <View style={styles.reviewBox}>
                    <Text style={styles.reviewTitle}>How was your service?</Text>
                    <View style={styles.stars}>{[1, 2, 3, 4, 5].map((star) => <TouchableOpacity key={star} onPress={() => setRatings((all) => ({ ...all, [item.id]: star }))}><Text style={[styles.star, star <= (ratings[item.id] || 0) && styles.starActive]}>★</Text></TouchableOpacity>)}</View>
                    <TextInput style={styles.reviewInput} multiline placeholder="Share feedback (optional)" placeholderTextColor={Colors.textMuted} value={reviews[item.id] || ''} onChangeText={(value) => setReviews((all) => ({ ...all, [item.id]: value }))} />
                    <TouchableOpacity style={styles.reviewButton} disabled={submittingId === item.id} onPress={() => submitReview(item)}>{submittingId === item.id ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.reviewButtonText}>Submit review</Text>}</TouchableOpacity>
                  </View>
                ) : null}
                {item.rating ? <View style={styles.submittedReview}><Text style={styles.submittedTitle}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text><Text style={styles.submittedText}>{item.review || 'Rating submitted'}</Text></View> : null}
              </View>
            );
          })}
          {!bookings.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No service bookings yet</Text><TouchableOpacity onPress={() => navigation.navigate('PennyWorks')}><Text style={styles.link}>Browse services</Text></TouchableOpacity></View> : null}
        </ScrollView>
      )}
      <Modal visible={Boolean(cancelTarget)} transparent animationType="fade" onRequestClose={() => setCancelTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel service?</Text>
            <Text style={styles.modalText}>Please add a reason. The provider and admin will be able to see it.</Text>
            <TextInput
              style={styles.cancelInput}
              multiline
              textAlignVertical="top"
              placeholder="Example: I am not available at this time"
              placeholderTextColor={Colors.textMuted}
              value={cancelReason}
              onChangeText={setCancelReason}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setCancelTarget(null)}>
                <Text style={styles.modalSecondaryText}>Keep booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDanger} disabled={submittingId === cancelTarget?.id} onPress={submitCancel}>
                {submittingId === cancelTarget?.id ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.modalDangerText}>Cancel service</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getSameTimeTomorrow(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) {
    date.setTime(Date.now());
  }
  date.setDate(date.getDate() + 1);
  return date;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, header: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 12 }, title: { fontSize: FontSize.xl, fontWeight: '900' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, content: { padding: Spacing.lg, paddingBottom: 50, gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, ...Shadow.sm }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, number: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' }, badge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.full }, badgeText: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.secondary }, service: { fontSize: FontSize.lg, fontWeight: '900', marginTop: 12 }, meta: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 5 },
  timeline: { flexDirection: 'row', marginTop: 16 }, stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' }, stepDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.gray300 }, stepDone: { backgroundColor: Colors.success }, stepLine: { flex: 1, height: 2, backgroundColor: Colors.gray300 }, stepLineDone: { backgroundColor: Colors.success },
  price: { color: Colors.primary, fontWeight: '900', fontSize: FontSize.lg, marginTop: 12 }, finding: { color: Colors.warning, fontWeight: '700', fontSize: FontSize.xs, marginTop: 12 },
  providerCard: { backgroundColor: Colors.secondaryLight, borderRadius: Radius.md, padding: 12, flexDirection: 'row', gap: 10, marginTop: 14 }, avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: Colors.white, fontWeight: '900', fontSize: FontSize.lg }, providerCopy: { flex: 1 }, providerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }, providerName: { fontWeight: '900', color: Colors.textPrimary }, verified: { color: Colors.success, fontSize: 9, fontWeight: '900' }, providerMeta: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 4 },
  otp: { backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: 12, marginTop: 14 }, otpLabel: { fontSize: FontSize.xs, fontWeight: '700' }, otpValue: { fontSize: 26, letterSpacing: 8, fontWeight: '900', color: Colors.textPrimary, marginTop: 3 }, otpHelp: { color: Colors.textSecondary, fontSize: FontSize.xs }, cancel: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 14, paddingTop: 12 }, cancelText: { color: Colors.danger, textAlign: 'center', fontWeight: '800' },
  cancelReasonBox: { backgroundColor: Colors.gray50, borderRadius: Radius.md, padding: 12, marginTop: 14, borderWidth: 1, borderColor: Colors.border }, cancelReasonTitle: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '900' }, cancelReasonText: { color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 18, marginTop: 5 },
  detailsButton: { marginTop: 13, padding: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, alignItems: 'center' }, detailsButtonText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: Spacing.lg }, modalCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md }, modalTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' }, modalText: { color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20, marginTop: 6 }, cancelInput: { minHeight: 96, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, marginTop: 14, color: Colors.textPrimary }, modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 }, modalSecondary: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, alignItems: 'center' }, modalSecondaryText: { color: Colors.textSecondary, fontWeight: '900' }, modalDanger: { flex: 1, backgroundColor: Colors.danger, borderRadius: Radius.md, padding: 12, alignItems: 'center' }, modalDangerText: { color: Colors.white, fontWeight: '900' },
  revisitBox: { backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: 12, marginTop: 14, borderWidth: 1, borderColor: Colors.warning }, revisitTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900' }, revisitText: { color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 18, marginTop: 6 }, revisitButton: { backgroundColor: Colors.warning, borderRadius: Radius.md, padding: 12, alignItems: 'center', marginTop: 12 }, revisitButtonText: { color: Colors.white, fontWeight: '900' },
  reviewBox: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 15, paddingTop: 15 }, reviewTitle: { fontWeight: '900', fontSize: FontSize.md }, stars: { flexDirection: 'row', gap: 6, marginVertical: 10 }, star: { fontSize: 30, color: Colors.gray300 }, starActive: { color: Colors.warning }, reviewInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 11, minHeight: 70, textAlignVertical: 'top' }, reviewButton: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: 12, alignItems: 'center', marginTop: 10 }, reviewButtonText: { color: Colors.white, fontWeight: '900' }, submittedReview: { backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: 12, marginTop: 14 }, submittedTitle: { color: Colors.warning, fontSize: FontSize.lg, fontWeight: '900' }, submittedText: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 4 },
  empty: { alignItems: 'center', padding: 40 }, emptyTitle: { fontWeight: '800', color: Colors.textSecondary }, link: { color: Colors.primary, fontWeight: '800', marginTop: 10 },
});
