import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Mail, MessageSquareText, Phone, Send } from 'lucide-react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getSettings } from '../services/settings';
import { getProfile } from '../services/profile';
import { submitContact } from '../services/contact';

const REASONS = [
  { label: 'General', value: 'GENERAL' },
  { label: 'Order help', value: 'ORDER_QUERY' },
  { label: 'Payment issue', value: 'PAYMENT_FAILED' },
];

export default function ContactSupportScreen({ navigation }) {
  const [support, setSupport] = useState({ email: '', phone: '' });
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    reason: 'GENERAL',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const [settings, profile] = await Promise.all([
        getSettings().catch(() => ({})),
        getProfile().catch(() => null),
      ]);
      setSupport({
        email: settings.supportEmail || '',
        phone: settings.supportPhone || '',
      });
      setForm((current) => ({
        ...current,
        name: profile?.name || current.name,
        email: profile?.email || current.email,
        phone: profile?.phone || current.phone,
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (!email && !phone) {
      Alert.alert('Contact required', 'Please add an email or phone number.');
      return;
    }
    if (!message || message.length < 10) {
      Alert.alert('Message too short', 'Please describe your issue in at least 10 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await submitContact({
        name,
        email: email || undefined,
        phone: phone || undefined,
        subject: subject || reasonLabel(form.reason),
        message,
        reason: form.reason,
        page: 'user-help-center',
      });
      Alert.alert('Message sent', 'Our support team will review your request and contact you soon.');
      setForm((current) => ({
        ...current,
        subject: '',
        message: '',
        reason: 'GENERAL',
      }));
    } catch (error) {
      Alert.alert('Could not send message', error?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Help Center</Text>
          <Text style={styles.subtitle}>Contact Superbucket support</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contactBand}>
          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Phone size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactLabel}>Call us</Text>
              <Text style={styles.contactValue}>{support.phone || 'Phone number unavailable'}</Text>
            </View>
          </View>
          <View style={styles.contactDivider} />
          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Mail size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactLabel}>Email us</Text>
              <Text style={styles.contactValue}>{support.email || 'Email unavailable'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <MessageSquareText size={20} color={Colors.primary} strokeWidth={2.5} />
            <Text style={styles.formTitle}>Send a message</Text>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>Loading support details...</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Reason</Text>
          <View style={styles.reasonRow}>
            {REASONS.map((reason) => {
              const active = form.reason === reason.value;
              return (
                <TouchableOpacity
                  key={reason.value}
                  style={[styles.reasonChip, active && styles.reasonChipActive]}
                  onPress={() => updateField('reason', reason.value)}
                >
                  <Text style={[styles.reasonText, active && styles.reasonTextActive]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={(value) => updateField('phone', value.replace(/[^\d+]/g, ''))}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            value={form.subject}
            onChangeText={(value) => updateField('subject', value)}
            placeholder="What is this about?"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={form.message}
            onChangeText={(value) => updateField('message', value)}
            placeholder="Tell us what happened..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={submit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Send size={17} color={Colors.white} strokeWidth={2.5} />
                <Text style={styles.submitText}>Send request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function reasonLabel(value) {
  return REASONS.find((reason) => reason.value === value)?.label || 'General';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 50,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 16,
    backgroundColor: Colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCopy: { flex: 1 },
  title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 2 },
  content: { padding: Spacing.lg, paddingBottom: 42 },
  contactBand: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 16,
    ...Shadow.sm,
  },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactCopy: { flex: 1 },
  contactLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '800', textTransform: 'uppercase' },
  contactValue: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '800', marginTop: 3 },
  contactDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },
  formCard: {
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: 16,
    ...Shadow.sm,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 16 },
  formTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  loadingText: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  label: { color: Colors.textPrimary, fontSize: FontSize.xs, fontWeight: '900', marginBottom: 7, marginTop: 12 },
  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.white,
  },
  reasonChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  reasonText: { color: Colors.textSecondary, fontSize: FontSize.xs, fontWeight: '800' },
  reasonTextActive: { color: Colors.primary },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    backgroundColor: Colors.gray50 || '#FAFAFA',
  },
  messageInput: { minHeight: 120, lineHeight: 20 },
  submitButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.65 },
  submitText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900', textTransform: 'uppercase' },
});
