import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { submitServiceExtension } from '../services/provider';
import { Colors, card } from '../theme';

const PHOTO_FIELDS = [
  { key: 'problemImage1', label: 'Problem photo 1' },
  { key: 'problemImage2', label: 'Problem photo 2' },
  { key: 'solvedImage1', label: 'Solved work photo 1' },
  { key: 'solvedImage2', label: 'Solved work photo 2' },
];

export default function ServiceExtensionScreen({ navigation, route }) {
  const job = route.params?.job;
  const [serviceName, setServiceName] = useState('');
  const [customerName, setCustomerName] = useState(job?.customer?.name || job?.address?.name || '');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [charge, setCharge] = useState('');
  const [photos, setPhotos] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async (key) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Photo permission required', 'Allow photo access to attach work evidence.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) setPhotos((current) => ({ ...current, [key]: result.assets[0] }));
  };

  const submit = async () => {
    if (!serviceName.trim() || !customerName.trim() || !durationMinutes || !charge) return Alert.alert('Complete the form', 'Add the service, customer, time, and charge.');
    if (PHOTO_FIELDS.some(({ key }) => !photos[key])) return Alert.alert('Four photos required', 'Add two problem photos and two photos of the solved work.');
    try {
      setSubmitting(true);
      const payload = { serviceName: serviceName.trim(), customerName: customerName.trim(), durationMinutes, charge };
      PHOTO_FIELDS.forEach(({ key }) => {
        const photo = photos[key];
        payload[key] = { uri: photo.uri, name: photo.fileName || `${key}-${Date.now()}.jpg`, type: photo.mimeType || 'image/jpeg' };
      });
      await submitServiceExtension(job.id, payload);
      Alert.alert('Extended service submitted', 'The customer invoice and admin Extended section now include this work.', [{ text: 'Done', onPress: () => navigation.goBack() }]);
    } catch (error) { Alert.alert('Could not submit extended service', error.message); }
    finally { setSubmitting(false); }
  };

  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View style={styles.header}><TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}><Feather name="arrow-left" size={21} color={Colors.text} /></TouchableOpacity><View><Text style={styles.title}>Extended service</Text><Text style={styles.sub}>{job?.bookingNumber}</Text></View></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Field label="Extended service name" value={serviceName} onChangeText={setServiceName} placeholder="Example: Wiring replacement" />
        <Field label="Customer name" value={customerName} onChangeText={setCustomerName} placeholder="Customer name" />
        <Text style={styles.label}>Work photos</Text>
        <View style={styles.photoGrid}>{PHOTO_FIELDS.map(({ key, label }) => <TouchableOpacity key={key} style={styles.photo} onPress={() => pickPhoto(key)}>{photos[key] ? <Image source={{ uri: photos[key].uri }} style={styles.photoImage} /> : <><Feather name="camera" size={25} color={Colors.secondary} /><Text style={styles.photoLabel}>{label}</Text></>}</TouchableOpacity>)}</View>
        <Field label="Extended work time (minutes)" value={durationMinutes} onChangeText={(value) => setDurationMinutes(value.replace(/\D/g, ''))} keyboardType="number-pad" placeholder="90" />
        <Field label="Extended work charge (Rs)" value={charge} onChangeText={(value) => setCharge(value.replace(/[^\d.]/g, ''))} keyboardType="decimal-pad" placeholder="750" />
      </View>
      <TouchableOpacity style={styles.submit} disabled={submitting} onPress={submit}>{submitting ? <ActivityIndicator color={Colors.white} /> : <><Feather name="send" size={18} color={Colors.white} /><Text style={styles.submitText}>SUBMIT TO CUSTOMER & ADMIN</Text></>}</TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Field({ label, ...props }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} placeholderTextColor={Colors.muted} {...props} /></View>; }

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background }, header: { paddingTop: 52, paddingHorizontal: 18, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border }, back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray50 }, title: { color: Colors.text, fontSize: 20, fontWeight: '900' }, sub: { color: Colors.muted, fontSize: 11, marginTop: 2 }, content: { padding: 18, paddingBottom: 50 }, form: { ...card }, field: { marginBottom: 16 }, label: { color: Colors.text, fontSize: 12, fontWeight: '900', marginBottom: 7 }, input: { minHeight: 48, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, paddingHorizontal: 12, color: Colors.text, backgroundColor: Colors.gray50 }, photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }, photo: { width: '48%', aspectRatio: 1.25, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.secondary, borderRadius: 11, overflow: 'hidden', backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center', padding: 8 }, photoImage: { width: '100%', height: '100%' }, photoLabel: { marginTop: 7, color: Colors.secondary, fontSize: 10, fontWeight: '800', textAlign: 'center' }, submit: { marginTop: 16, minHeight: 52, borderRadius: 12, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, submitText: { color: Colors.white, fontWeight: '900', fontSize: 12 },
});
