import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import LogoBrand from '../components/LogoBrand';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleSendOTP = () => {
    if (phone.length === 10) setOtpSent(true);
  };

  const handleOtpChange = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
  };

  const handleVerify = () => {
    navigation.replace('Location');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <LogoBrand size="lg" style={styles.logo} />
          <Text style={styles.subtitle}>Your Town. Everything Delivered.</Text>

          {/* Red + Blue decorative underline */}
          <View style={styles.logoDivider}>
            <View style={styles.dividerRed} />
            <View style={styles.dividerBlue} />
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {!otpSent ? (
            <>
              <Text style={styles.title}>Login / Sign up</Text>
              <Text style={styles.hint}>Enter your mobile number to continue</Text>

              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.flagText}>🇮🇳</Text>
                  <Text style={styles.countryText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, phone.length !== 10 && styles.btnDisabled]}
                onPress={handleSendOTP}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>Continue →</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleText}>Continue with Google</Text>
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.backBtn}>
                <Text style={styles.backText}>← Change Number</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.hint}>Sent to +91 {phone}</Text>

              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    style={[styles.otpBox, digit.length > 0 && styles.otpBoxFilled]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.btn} onPress={handleVerify} activeOpacity={0.85}>
                <Text style={styles.btnText}>Verify & Login</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn}>
                <Text style={styles.resendText}>Resend OTP in 30s</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>

      {/* Bottom brand stripe */}
      <View style={styles.bottomStripe}>
        <View style={{ flex: 1, backgroundColor: Colors.primary }} />
        <View style={{ flex: 1, backgroundColor: Colors.secondary }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 64,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  logoDivider: {
    flexDirection: 'row',
    marginTop: 12,
    width: 80,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  dividerRed: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  dividerBlue: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadow.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: Colors.gray100,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
    gap: 6,
  },
  flagText: { fontSize: 18 },
  countryText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.redGlow,
  },
  btnDisabled: {
    backgroundColor: Colors.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: FontSize.md,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: {
    marginHorizontal: 12,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  googleBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.white,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.secondary,
  },
  googleText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  comingSoonBadge: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  comingSoonText: {
    fontSize: FontSize.xxs,
    color: Colors.secondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backBtn: { marginBottom: 16 },
  backText: { color: Colors.secondary, fontWeight: '700', fontSize: FontSize.sm },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  resendBtn: { alignItems: 'center', marginTop: 16 },
  resendText: { color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '600' },
  terms: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  termLink: { color: Colors.primary, fontWeight: '700' },
  bottomStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
  },
});
