import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getBusinessAdPlans, submitBusinessAd, updateBusinessAd } from '../services/homeOffers';
import { getUploadUrl } from '../services/api';

export default function AdvertiseBusinessScreen({ navigation, route }) {
  const editingAd = route?.params?.ad || null;
  const [posterImage, setPosterImage] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [offer, setOffer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(editingAd?.planId || null);
  const posterPreviewUri = posterImage?.uri || (editingAd?.imageUrl ? getUploadUrl('business-ads', editingAd.imageUrl) : null);

  useEffect(() => {
    if (editingAd) {
      setBusinessName(editingAd.businessName || '');
      setCategory(editingAd.category || '');
      setDescription(editingAd.description || '');
      setAddress(editingAd.address || '');
      setPhone(editingAd.phone || '');
      setOffer(editingAd.offerText || '');
    }
    getBusinessAdPlans()
      .then((items) => {
        setPlans(items || []);
        setSelectedPlanId((current) => current || items?.[0]?.id || null);
      })
      .catch(() => setPlans([]));
  }, [editingAd]);

  const pickPoster = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Allow photo access to upload your shop image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.[0]) setPosterImage(result.assets[0]);
  };

  const submitAd = async () => {
    if (!businessName.trim() || !description.trim() || !address.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Please add business name, details, address, and phone number.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid phone number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedPlanId) {
      Alert.alert('Select a package', 'Choose how long you want your advertisement to run.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        planId: String(selectedPlanId),
        businessName: businessName.trim(),
        category: category.trim() || undefined,
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        offer: offer.trim() || undefined,
        ...(posterImage ? {
          image: {
            uri: posterImage.uri,
            name: posterImage.fileName || `business-poster-${Date.now()}.jpg`,
            type: posterImage.mimeType || 'image/jpeg',
          },
        } : {}),
      };
      if (editingAd) await updateBusinessAd(editingAd.id, payload);
      else await submitBusinessAd(payload);

      Alert.alert(
        editingAd ? 'Ad updated' : 'Ad submitted for review',
        'Admin will review your advertisement. Payment becomes available after approval, and your campaign days start only after payment.',
        [{
          text: 'View My Ads',
          onPress: () => editingAd ? navigation.goBack() : navigation.replace('MyBusinessAds'),
        }],
      );
    } catch (error) {
      Alert.alert('Could not submit ad', error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>Advertise Business</Text>
          <Text style={styles.headerSub}>Choose a package and submit your campaign for review.</Text>
        </View>
        <TouchableOpacity style={styles.myAdsButton} onPress={() => navigation.navigate('MyBusinessAds')}>
          <Feather name="bar-chart-2" size={15} color={Colors.primary} />
          <Text style={styles.myAdsText}>MY ADS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.posterCard}>
          {posterPreviewUri ? (
            <Image source={{ uri: posterPreviewUri }} style={styles.posterImage} />
          ) : (
            <View style={styles.posterEmpty}>
              <Feather name="image" size={34} color={Colors.primary} />
              <Text style={styles.posterTitle}>Business poster</Text>
              <Text style={styles.posterSub}>Upload a clear photo of your shop.</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Advertising package*</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.planRow}>
              {plans.map((plan) => {
                const selected = selectedPlanId === plan.id;
                return (
                  <TouchableOpacity key={plan.id} style={[styles.planCard, selected && styles.planCardSelected]} onPress={() => setSelectedPlanId(plan.id)}>
                    <Text style={[styles.planName, selected && styles.planTextSelected]}>{plan.name}</Text>
                    <Text style={[styles.planPrice, selected && styles.planTextSelected]}>Rs {Number(plan.price).toFixed(0)}</Text>
                    <Text style={[styles.planDays, selected && styles.planDaysSelected]}>{plan.durationDays} days</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {!plans.length ? <Text style={styles.planEmpty}>No advertising packages are currently available.</Text> : null}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Shop image</Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickPoster} activeOpacity={0.8}>
              <Feather name="upload" size={18} color={Colors.primary} />
              <Text style={styles.imageButtonText}>{posterImage ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Business name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Pizza Palace"
              placeholderTextColor={Colors.textMuted}
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Pizza shop, bakery, salon..."
              placeholderTextColor={Colors.textMuted}
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Business details*</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell customers what you sell, timings, and why they should visit."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Shop address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Sector 14 market, Gurugram"
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone number*</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 10))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Offer or visit message</Text>
            <TextInput
              style={styles.input}
              placeholder="10% off on first order"
              placeholderTextColor={Colors.textMuted}
              value={offer}
              onChangeText={setOffer}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          activeOpacity={0.86}
          onPress={submitAd}
          disabled={submitting}
        >
          <Feather name="send" size={18} color={Colors.white} />
          <Text style={styles.submitText}>{submitting ? 'SUBMITTING...' : editingAd ? 'RESUBMIT FOR REVIEW' : 'SUBMIT AD REQUEST'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primaryLight,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCopy: { flex: 1 },
  myAdsButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: Radius.full, backgroundColor: Colors.white, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#F3B9BE' },
  myAdsText: { color: Colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  headerSub: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '600', marginTop: 3 },
  content: { padding: Spacing.lg, paddingBottom: 36 },
  posterCard: {
    height: 190,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  posterImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  posterEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  posterTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '900', marginTop: 10 },
  posterSub: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600', marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  field: { marginBottom: 15 },
  planRow: { gap: 10, paddingVertical: 2 },
  planCard: { width: 112, minHeight: 92, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.gray50, padding: 12 },
  planCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  planName: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '900' },
  planPrice: { marginTop: 7, color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  planDays: { marginTop: 3, color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  planTextSelected: { color: Colors.white },
  planDaysSelected: { color: 'rgba(255,255,255,0.78)' },
  planEmpty: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 5 },
  label: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '800', marginBottom: 7 },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  textArea: { minHeight: 104 },
  imageButton: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  imageButtonText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '900' },
  submitButton: {
    minHeight: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    marginTop: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    ...Shadow.redGlow,
  },
  submitButtonDisabled: { opacity: 0.65 },
  submitText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900', letterSpacing: 0.8 },
});
