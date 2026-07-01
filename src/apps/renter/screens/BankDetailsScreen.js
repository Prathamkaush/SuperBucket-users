import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getProfile, saveBankDetails } from '../services/profile';

export default function BankDetailsScreen({ navigation }) {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    getProfile()
      .then((user) => {
        if (!active) return;
        setAccountNumber(user?.bankAccountNumber || '');
        setIfsc(user?.bankIfsc || '');
        setAccountName(user?.bankAccountName || '');
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not load bank details');
        console.error(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const validate = () => {
    if (!accountNumber.trim()) return 'Please enter your account number';
    if (!/^\d{9,18}$/.test(accountNumber.trim())) return 'Please enter a valid account number (9 to 18 digits)';
    if (!ifsc.trim()) return 'Please enter the IFSC code';
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc.trim().toUpperCase())) return 'Please enter a valid 11-character IFSC code (e.g. SBIN0001234)';
    if (!accountName.trim()) return 'Please enter the account holder name';
    return null;
  };

  const handleSave = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      Alert.alert('Validation Error', errorMsg);
      return;
    }

    try {
      setSaving(true);
      await saveBankDetails(
        accountNumber.trim(),
        ifsc.trim().toUpperCase(),
        accountName.trim()
      );

      Alert.alert('Success', 'Bank details saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Save Failed', error?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.loadingText}>Loading bank details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Bank and payouts</Text>
        </View>
        <Text style={styles.headerSub}>Provide bank details to complete profile and payouts.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Account Holder Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="As per bank passbook / statement"
              placeholderTextColor={Colors.textMuted}
              value={accountName}
              onChangeText={setAccountName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Account Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your bank account number"
              placeholderTextColor={Colors.textMuted}
              value={accountNumber}
              onChangeText={(val) => setAccountNumber(val.replace(/\D/g, ''))}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>IFSC Code*</Text>
            <TextInput
              style={styles.input}
              placeholder="11-digit alphanumeric code (e.g. HDFC0000123)"
              placeholderTextColor={Colors.textMuted}
              value={ifsc}
              onChangeText={setIfsc}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={11}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          disabled={saving}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveText}>LINK BANK ACCOUNT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: FontSize.md },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.secondary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '900', marginLeft: 4 },
  headerSub: { marginTop: 4, color: 'rgba(255,255,255,0.76)', fontSize: FontSize.xs, marginLeft: 4 },
  body: { padding: Spacing.lg, paddingTop: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  field: { marginBottom: 16 },
  fieldLabel: { marginBottom: 6, color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  saveButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.secondary,
    ...Shadow.sm,
  },
  buttonDisabled: { opacity: 0.65 },
  saveText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1 },
});
