import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import LogoBrand from '../components/LogoBrand';
import { sendOtp, verifyOtp } from '../services/auth';
import { getProfile } from '../services/provider';
import { Colors } from '../theme';

const OTP_LENGTH = 4;

export default function LoginScreen({ navigation }) {
  const otpRefs = useRef([]);
  const [phone, setPhone] = useState('');
  const [challenge, setChallenge] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!wait) return undefined;
    const timer = setInterval(() => setWait((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [wait]);

  useEffect(() => {
    if (!challenge) return undefined;
    const timer = setTimeout(() => otpRefs.current[0]?.focus(), 100);
    return () => clearTimeout(timer);
  }, [challenge]);

  const requestOtp = async () => {
    try {
      setLoading(true);
      const data = await sendOtp(phone);
      setChallenge(data.challengeToken);
      setOtp(Array(OTP_LENGTH).fill(''));
      setWait(data.resendAfter || 30);
    } catch (error) {
      Alert.alert('Could not send OTP', error?.message || 'Please try again');
    } finally { setLoading(false); }
  };

  const updateOtp = (value, index) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH - index);
    const next = [...otp];
    if (!digits) next[index] = '';
    digits.split('').forEach((digit, offset) => { next[index + offset] = digit; });
    setOtp(next);
    const target = index + digits.length;
    if (digits && target < OTP_LENGTH) otpRefs.current[target]?.focus();
    if (target >= OTP_LENGTH) otpRefs.current[OTP_LENGTH - 1]?.blur();
  };

  const verify = async () => {
    try {
      setLoading(true);
      await verifyOtp(challenge, otp.join(''));
      try {
        await getProfile();
        navigation.replace('ProviderTabs');
      } catch {
        navigation.replace('Onboarding');
      }
    } catch (error) {
      Alert.alert('OTP verification failed', error?.message || 'Please try again');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <LogoBrand size="lg" />
          <Text style={styles.subtitle}>Your Skills. Your Earnings.</Text>
          <View style={styles.partnerPill}><Text style={styles.partnerText}>SERVICE PARTNER</Text></View>
          <View style={styles.logoDivider}><View style={styles.redLine} /><View style={styles.blueLine} /></View>
        </View>

        <View style={styles.card}>
          {!challenge ? (
            <>
              <Text style={styles.title}>Partner Login / Sign up</Text>
              <Text style={styles.hint}>Enter your mobile number to continue</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}><Text style={styles.countryText}>+91</Text></View>
                <TextInput style={styles.phoneInput} placeholder="10-digit mobile number" placeholderTextColor={Colors.muted} keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={(value) => setPhone(value.replace(/\D/g, ''))} />
              </View>
              <TouchableOpacity style={[styles.button, (phone.length !== 10 || loading) && styles.disabled]} disabled={phone.length !== 10 || loading} onPress={requestOtp}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Continue →</Text>}
              </TouchableOpacity>
              <View style={styles.infoBox}><Text style={styles.infoTitle}>Work on your terms</Text><Text style={styles.infoText}>Get local jobs, see your earnings clearly, and choose when you are available.</Text></View>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => { setChallenge(''); setOtp(Array(OTP_LENGTH).fill('')); }} disabled={loading}><Text style={styles.back}>← Change number</Text></TouchableOpacity>
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.hint}>Sent to +91 {phone}</Text>
              <View style={styles.otpRow}>{otp.map((digit, index) => <TextInput key={index} ref={(input) => { otpRefs.current[index] = input; }} style={[styles.otpBox, digit && styles.otpFilled]} value={digit} keyboardType="number-pad" maxLength={OTP_LENGTH} selectTextOnFocus onChangeText={(value) => updateOtp(value, index)} onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus(); }} />)}</View>
              <TouchableOpacity style={[styles.button, (otp.join('').length !== OTP_LENGTH || loading) && styles.disabled]} disabled={otp.join('').length !== OTP_LENGTH || loading} onPress={verify}>
                {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Verify & Login</Text>}
              </TouchableOpacity>
              <TouchableOpacity disabled={wait > 0 || loading} onPress={requestOtp}><Text style={[styles.resend, wait > 0 && styles.resendDisabled]}>{wait ? `Resend OTP in ${wait}s` : 'Resend OTP'}</Text></TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.terms}>By continuing you agree to our <Text style={styles.termLink}>Partner Terms</Text> and <Text style={styles.termLink}>Privacy Policy</Text></Text>
      </ScrollView>
      <View style={styles.bottomStripe}><View style={styles.redStripe} /><View style={styles.blueStripe} /></View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 64, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 34 }, subtitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500', marginTop: 6 },
  partnerPill: { backgroundColor: Colors.secondaryLight, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 4, marginTop: 9 }, partnerText: { color: Colors.secondary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  logoDivider: { flexDirection: 'row', marginTop: 12, width: 80, height: 3, borderRadius: 2, overflow: 'hidden' }, redLine: { flex: 1, backgroundColor: Colors.primary }, blueLine: { flex: 1, backgroundColor: Colors.secondary },
  card: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: .14, shadowRadius: 20, elevation: 10 },
  title: { color: Colors.text, fontSize: 19, fontWeight: '800', marginBottom: 6 }, hint: { color: Colors.textSecondary, fontSize: 13, marginBottom: 24 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, marginBottom: 20, overflow: 'hidden', backgroundColor: Colors.white },
  countryCode: { paddingHorizontal: 16, paddingVertical: 15, backgroundColor: Colors.gray100, borderRightWidth: 1.5, borderRightColor: Colors.border }, countryText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  phoneInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: Colors.text, fontWeight: '600' },
  button: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: .3, shadowRadius: 12, elevation: 8 }, disabled: { backgroundColor: Colors.gray300, shadowOpacity: 0, elevation: 0 }, buttonText: { color: Colors.white, fontWeight: '800', fontSize: 15 },
  infoBox: { backgroundColor: Colors.secondaryLight, borderRadius: 12, padding: 13, marginTop: 20 }, infoTitle: { color: Colors.secondary, fontWeight: '800', fontSize: 13 }, infoText: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 3 },
  back: { color: Colors.secondary, fontWeight: '700', fontSize: 13, marginBottom: 16 }, otpRow: { flexDirection: 'row', gap: 8, marginBottom: 24 }, otpBox: { flex: 1, height: 54, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, textAlign: 'center', fontSize: 19, fontWeight: '800', color: Colors.text, backgroundColor: Colors.gray50 }, otpFilled: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  resend: { color: Colors.secondary, fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: 16 }, resendDisabled: { color: Colors.muted },
  terms: { color: Colors.muted, textAlign: 'center', marginTop: 28, fontSize: 11, lineHeight: 20 }, termLink: { color: Colors.primary, fontWeight: '700' },
  bottomStripe: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, flexDirection: 'row' }, redStripe: { flex: 1, backgroundColor: Colors.primary }, blueStripe: { flex: 1, backgroundColor: Colors.secondary },
});
