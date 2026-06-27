import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCatalog, getProfile, saveProfile } from '../services/provider';
import { Colors, card } from '../theme';

const MVP_CATALOG = [
  { id: 1, name: 'Electrician' },
  { id: 2, name: 'Plumbing' },
  { id: 3, name: 'Home Cleaning' },
  { id: 4, name: 'Carpentry' },
];

export default function OnboardingScreen({ navigation }) {
  const [catalog, setCatalog] = useState(MVP_CATALOG);
  const [selected, setSelected] = useState([]);
  const [city, setCity] = useState('');
  const [experienceYears, setExperience] = useState('0');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverUnavailable, setServerUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const categories = await getCatalog();
      setCatalog(categories.length ? categories : MVP_CATALOG);
      setServerUnavailable(false);
      const profile = await getProfile().catch(() => null);
      if (profile) {
        setSelected(profile.services.map((item) => item.categoryId));
        setCity(profile.city || '');
        setExperience(String(profile.experienceYears || 0));
        setBio(profile.bio || '');
      }
    } catch (error) {
      setCatalog(MVP_CATALOG);
      setServerUnavailable(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  const submit = async () => {
    if (!selected.length || !city.trim()) {
      Alert.alert('Complete your profile', 'Choose a service and enter your city.');
      return;
    }
    try {
      setSaving(true);
      await saveProfile({ categoryIds: selected, city, experienceYears: Number(experienceYears), bio, serviceRadiusKm: 10 });
      Alert.alert('Profile submitted', 'An admin must approve your profile before you can accept jobs.', [{ text: 'Continue', onPress: () => navigation.replace('ProviderTabs') }]);
    } catch (error) {
      const missingApi = /cannot (get|post)|not found|404/i.test(error?.message || '') || serverUnavailable;
      Alert.alert(
        missingApi ? 'Backend update required' : 'Could not save',
        missingApi
          ? 'The provider-service API has not been deployed to apiv1.freeqr.live yet. Deploy the updated backend and database migration, then tap Retry connection.'
          : error?.message || 'Please try again',
      );
    } finally { setSaving(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.headingRow}><View style={styles.headingLineRed} /><View style={styles.headingLineBlue} /></View>
      <Text style={styles.title}>Set up your provider profile</Text>
      <Text style={styles.help}>Choose what you can do. Superbucket controls customer prices.</Text>
      {serverUnavailable ? (
        <View style={styles.warning}>
          <Text style={styles.warningTitle}>Showing starter services</Text>
          <Text style={styles.warningText}>The production backend is still on the older version. You can prepare this form, but deployment is required before it can be submitted.</Text>
          <TouchableOpacity onPress={load}><Text style={styles.retry}>Retry connection</Text></TouchableOpacity>
        </View>
      ) : null}
      <Text style={styles.label}>Your services</Text>
      <View style={styles.chips}>{catalog.map((item) => <TouchableOpacity key={item.id} onPress={() => toggle(item.id)} style={[styles.chip, selected.includes(item.id) && styles.chipActive]}><Text style={[styles.chipText, selected.includes(item.id) && styles.chipTextActive]}>{item.name}</Text></TouchableOpacity>)}</View>
      <Text style={styles.label}>City</Text><TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Gurugram" placeholderTextColor={Colors.muted} />
      <Text style={styles.label}>Years of experience</Text><TextInput style={styles.input} value={experienceYears} onChangeText={(value) => setExperience(value.replace(/\D/g, ''))} keyboardType="number-pad" />
      <Text style={styles.label}>About your work</Text><TextInput style={[styles.input, styles.bio]} multiline value={bio} onChangeText={setBio} placeholder="Briefly describe your experience" placeholderTextColor={Colors.muted} />
      <TouchableOpacity style={[styles.button, saving && styles.disabled]} disabled={saving} onPress={submit}>{saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Submit for approval</Text>}</TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: Colors.background, paddingTop: 58, paddingHorizontal: 20, paddingBottom: 50 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headingRow: { width: 70, height: 4, borderRadius: 2, overflow: 'hidden', flexDirection: 'row', marginBottom: 15 }, headingLineRed: { flex: 1, backgroundColor: Colors.primary }, headingLineBlue: { flex: 1, backgroundColor: Colors.secondary },
  title: { fontSize: 25, fontWeight: '900', color: Colors.text }, help: { color: Colors.textSecondary, lineHeight: 20, marginTop: 7 },
  warning: { backgroundColor: Colors.warningLight, borderWidth: 1, borderColor: '#F5C96A', borderRadius: 13, padding: 13, marginTop: 18 }, warningTitle: { color: '#9A6700', fontWeight: '900' }, warningText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 4 }, retry: { color: Colors.secondary, fontWeight: '900', fontSize: 12, marginTop: 9 },
  label: { fontWeight: '900', marginTop: 22, marginBottom: 8, color: Colors.text }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border }, chipActive: { backgroundColor: Colors.secondaryLight, borderColor: Colors.secondary }, chipText: { color: Colors.textSecondary, fontWeight: '700' }, chipTextActive: { color: Colors.secondary },
  input: { ...card, padding: 13, color: Colors.text }, bio: { minHeight: 90, textAlignVertical: 'top' }, button: { backgroundColor: Colors.primary, padding: 16, borderRadius: 13, alignItems: 'center', marginTop: 26, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: .25, shadowRadius: 10, elevation: 7 }, disabled: { opacity: .6 }, buttonText: { color: Colors.white, fontWeight: '900' },
});
