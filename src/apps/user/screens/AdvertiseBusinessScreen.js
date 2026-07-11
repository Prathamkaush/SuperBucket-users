import React, { useState } from 'react';
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
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';
import BackButton from '../components/BackButton';
import { submitBusinessAd } from '../services/homeOffers';

export default function AdvertiseBusinessScreen({ navigation }) {
  const [posterUrl, setPosterUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [offer, setOffer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitAd = async () => {
    if (!businessName.trim() || !description.trim() || !address.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Please add business name, details, address, and phone number.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid phone number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setSubmitting(true);
      await submitBusinessAd({
        businessName: businessName.trim(),
        category: category.trim() || undefined,
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        offer: offer.trim() || undefined,
        posterUrl: posterUrl.trim() || undefined,
      });

      Alert.alert(
        'Ad submitted',
        'Your business ad is now visible in the sponsored Home hero carousel.',
        [{ text: 'Done', onPress: () => navigation.goBack() }],
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
          <Text style={styles.headerSub}>Create a local poster card for customers.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.posterCard}>
          {posterUrl.trim() ? (
            <Image source={{ uri: posterUrl.trim() }} style={styles.posterImage} />
          ) : (
            <View style={styles.posterEmpty}>
              <Feather name="image" size={34} color={Colors.primary} />
              <Text style={styles.posterTitle}>Business poster</Text>
              <Text style={styles.posterSub}>Paste an image URL below for now.</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Poster image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/pizza-shop.jpg"
              placeholderTextColor={Colors.textMuted}
              value={posterUrl}
              onChangeText={setPosterUrl}
              autoCapitalize="none"
            />
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
          <Text style={styles.submitText}>{submitting ? 'SUBMITTING...' : 'SUBMIT AD REQUEST'}</Text>
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
