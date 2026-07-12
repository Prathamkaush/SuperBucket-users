import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  NativeModules,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import LogoBrand from '../components/LogoBrand';
import {
  exchangeGoogleIdToken,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../services/auth';
import { getAddresses } from '../services/addresses';

const OTP_LENGTH = 4;

function getGoogleSignInModule() {
  if (!NativeModules.RNGoogleSignin) {
    return null;
  }

  return require('@react-native-google-signin/google-signin');
}

export default function LoginScreen({ navigation }) {
  const otpInputRefs = useRef([]);

  const continueAfterLogin = async () => {
    try {
      const addresses = await getAddresses();
      navigation.replace(Array.isArray(addresses) && addresses.length ? 'MainTabs' : 'Location');
    } catch {
      navigation.replace('MainTabs');
    }
  };
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [challengeToken, setChallengeToken] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!resendSeconds) return undefined;
    const timer = setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!otpSent) return undefined;

    const focusTimer = setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);

    return () => clearTimeout(focusTimer);
  }, [otpSent]);

  const handleSendOTP = async () => {
    if (phone.length !== 10 || otpLoading) return;

    try {
      setOtpLoading(true);
      const response = await sendPhoneOtp(phone);
      setChallengeToken(response.challengeToken);
      setOtp(Array(OTP_LENGTH).fill(''));
      setOtpSent(true);
      setResendSeconds(response.resendAfter || 30);
    } catch (error) {
      Alert.alert('Could not send OTP', error?.message || 'Please try again');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    const digits = val.replace(/\D/g, '');
    const newOtp = [...otp];

    if (!digits) {
      newOtp[idx] = '';
      setOtp(newOtp);
      return;
    }

    digits
      .slice(0, OTP_LENGTH - idx)
      .split('')
      .forEach((digit, offset) => {
        newOtp[idx + offset] = digit;
      });

    setOtp(newOtp);

    const nextIndex = Math.min(idx + digits.length, OTP_LENGTH - 1);
    if (idx + digits.length < OTP_LENGTH) {
      otpInputRefs.current[nextIndex]?.focus();
    } else {
      otpInputRefs.current[OTP_LENGTH - 1]?.blur();
    }
  };

  const handleOtpKeyPress = (key, idx) => {
    if (key !== 'Backspace' || otp[idx] || idx === 0) return;

    const newOtp = [...otp];
    newOtp[idx - 1] = '';
    setOtp(newOtp);
    otpInputRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH || !challengeToken || otpLoading) return;

    try {
      setOtpLoading(true);
      await verifyPhoneOtp(challengeToken, code);
      await continueAfterLogin();
    } catch (error) {
      Alert.alert('OTP verification failed', error?.message || 'Please try again');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const googleModule = getGoogleSignInModule();

    if (!googleModule) {
      Alert.alert(
        'Development build required',
        'Google sign-in uses native code and cannot run in Expo Go. You can continue testing the rest of the app here.',
      );
      return;
    }

    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Google sign-in is not configured',
        'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to the app environment and rebuild the app.',
      );
      return;
    }

    try {
      setGoogleLoading(true);
      const {
        GoogleSignin,
        isCancelledResponse,
        isErrorWithCode,
        isSuccessResponse,
        statusCodes,
      } = googleModule;

      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId:
          process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
        offlineAccess: false,
      });

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error(
          'Google did not return an ID token. Check the Web client ID.',
        );
      }

      await exchangeGoogleIdToken(idToken);
      await continueAfterLogin();
    } catch (error) {
      const {
        isCancelledResponse,
        isErrorWithCode,
        statusCodes,
      } = googleModule;

      if (isCancelledResponse(error)) {
        return;
      }

      let message = error?.message || 'Unable to sign in with Google';
      if (isErrorWithCode(error)) {
        const errorCode = String(error.code);

        if (
          Platform.OS === 'android' &&
          (errorCode === '10' ||
            /developer_error|non-recoverable/i.test(error?.message || ''))
        ) {
          message =
            'This Android build is not registered with Google. Add the SHA-1 of the certificate that signed this APK to an Android OAuth client for package com.superbuket.user, in the same Google Cloud project as the Web client ID, then rebuild the app.';
        } else if (error.code === statusCodes.IN_PROGRESS) {
          message = 'Google sign-in is already in progress';
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          message = 'Google Play Services is unavailable or out of date';
        }
      }

      Alert.alert('Google sign-in failed', message);
    } finally {
      setGoogleLoading(false);
    }
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
                  onChangeText={(value) => setPhone(value.replace(/\D/g, ''))}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.btn,
                  (phone.length !== 10 || otpLoading) && styles.btnDisabled,
                ]}
                onPress={handleSendOTP}
                disabled={phone.length !== 10 || otpLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>Continue →</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.line} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={[styles.googleBtn, googleLoading && styles.googleBtnDisabled]}
                activeOpacity={0.8}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color={Colors.secondary} />
                ) : (
                  <>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setOtpSent(false);
                  setOtp(Array(OTP_LENGTH).fill(''));
                }}
                style={styles.backBtn}
                disabled={otpLoading}
              >
                <Text style={styles.backText}>← Change Number</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.hint}>Sent to +91 {phone}</Text>

              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(input) => {
                      otpInputRefs.current[idx] = input;
                    }}
                    style={[styles.otpBox, digit.length > 0 && styles.otpBoxFilled]}
                    maxLength={OTP_LENGTH}
                    keyboardType="number-pad"
                    textContentType={idx === 0 ? 'oneTimeCode' : 'none'}
                    autoComplete={idx === 0 ? 'sms-otp' : 'off'}
                    selectTextOnFocus
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, idx)}
                    onKeyPress={({ nativeEvent }) =>
                      handleOtpKeyPress(nativeEvent.key, idx)
                    }
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.btn,
                  (otp.join('').length !== OTP_LENGTH || otpLoading) &&
                    styles.btnDisabled,
                ]}
                onPress={handleVerify}
                disabled={otp.join('').length !== OTP_LENGTH || otpLoading}
                activeOpacity={0.85}
              >
                {otpLoading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.btnText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleSendOTP}
                disabled={resendSeconds > 0 || otpLoading}
              >
                <Text
                  style={[
                    styles.resendText,
                    resendSeconds > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {resendSeconds > 0
                    ? `Resend OTP in ${resendSeconds}s`
                    : 'Resend OTP'}
                </Text>
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
  googleBtnDisabled: {
    opacity: 0.65,
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
  resendTextDisabled: { color: Colors.textMuted },
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
