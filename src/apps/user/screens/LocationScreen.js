import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import { createAddress, getAddresses, updateAddress } from '../services/addresses';
import { getProfile } from '../services/profile';
import BackButton from '../components/BackButton';

const EMPTY_FORM = {
  name: '',
  phone: '',
  house: '',
  area: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  floor: '',
  notes: '',
  latitude: '',
  longitude: '',
};

const FIELDS = [
  { key: 'name', label: 'Recipient Name*', placeholder: 'Full name' },
  {
    key: 'phone',
    label: 'Phone Number*',
    placeholder: '10-digit mobile number',
    keyboardType: 'phone-pad',
    maxLength: 10,
  },
  { key: 'house', label: 'House / Flat No.*', placeholder: 'Flat 302, Block B' },
  { key: 'area', label: 'Street / Area / Colony*', placeholder: 'Street name, locality or sector' },
  { key: 'landmark', label: 'Landmark', placeholder: 'Near SBI ATM' },
  { key: 'city', label: 'City*', placeholder: 'City' },
  { key: 'state', label: 'State*', placeholder: 'State' },
  {
    key: 'pincode',
    label: 'Pincode*',
    placeholder: '6-digit pincode',
    keyboardType: 'number-pad',
    maxLength: 6,
  },
  { key: 'floor', label: 'Floor', placeholder: '3rd Floor' },
  {
    key: 'notes',
    label: 'Delivery Notes',
    placeholder: 'Ring bell twice',
    multiline: true,
  },
];

const parseStreet = (streetString) => {
  if (!streetString) return {};
  const parts = streetString.split(', ');
  let house = '';
  let floor = '';
  let area = '';
  let landmark = '';
  let notes = '';
  let type = 'Home';

  const remainingParts = [];
  for (const part of parts) {
    if (part.startsWith('Type: ')) {
      type = part.replace('Type: ', '');
    } else if (part.startsWith('Landmark: ')) {
      landmark = part.replace('Landmark: ', '');
    } else if (part.startsWith('Note: ')) {
      notes = part.replace('Note: ', '');
    } else {
      remainingParts.push(part);
    }
  }

  if (remainingParts.length === 3) {
    house = remainingParts[0];
    floor = remainingParts[1];
    area = remainingParts[2];
  } else if (remainingParts.length === 2) {
    house = remainingParts[0];
    area = remainingParts[1];
  } else if (remainingParts.length === 1) {
    area = remainingParts[0];
  }

  return { house, floor, area, landmark, notes, type };
};


export default function LocationScreen({ navigation, route }) {
  const addNewAddress = Boolean(route?.params?.addNew);
  const [selectedType, setSelectedType] = useState('Home');
  const [form, setForm] = useState(EMPTY_FORM);
  const [isDefault, setIsDefault] = useState(true);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addressId, setAddressId] = useState(null);

  useEffect(() => {
    let active = true;

    Promise.all([getProfile(), getAddresses()])
      .then(([user, addresses]) => {
        if (!active) return;

        // Populate user name and phone from profile as default
        const userName = user?.name || '';
        const userPhone = user?.phone || '';

        // If user already has a saved address, pre-populate it unless user asked to add a fresh one.
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        if (defaultAddr && !addNewAddress) {
          setAddressId(defaultAddr.id);
          setIsDefault(defaultAddr.isDefault);

          const parsed = parseStreet(defaultAddr.street);
          setSelectedType(parsed.type || 'Home');

          setForm({
            name: defaultAddr.name || userName,
            phone: defaultAddr.phone || userPhone,
            house: parsed.house || '',
            area: parsed.area || '',
            landmark: parsed.landmark || '',
            city: defaultAddr.city || '',
            state: defaultAddr.state || '',
            pincode: defaultAddr.pincode || '',
            floor: parsed.floor || '',
            notes: parsed.notes || '',
            latitude: defaultAddr.latitude ? String(defaultAddr.latitude) : '',
            longitude: defaultAddr.longitude ? String(defaultAddr.longitude) : '',
          });
        } else {
          setForm((current) => ({
            ...current,
            name: userName || current.name,
            phone: userPhone || current.phone,
          }));
        }
      })
      .catch((err) => {
        console.error('Error fetching profile or addresses:', err);
      });

    return () => {
      active = false;
    };
  }, [addNewAddress]);


  const updateField = (key, value) => {
    const sanitized =
      key === 'phone' || key === 'pincode' ? value.replace(/\D/g, '') : value;
    setForm((current) => ({ ...current, [key]: sanitized }));
  };

  const detectCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        Alert.alert(
          'Location is turned off',
          'Turn on location services and try again.',
        );
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Location permission needed', 'Allow location access in settings to auto-detect your delivery address.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const results = await Location.reverseGeocodeAsync(position.coords);
      const address = results[0];

      if (!address) {
        throw new Error('Address details were not available for this location');
      }

      const area = [
        address.streetNumber,
        address.street,
        address.district,
        address.subregion,
      ]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(', ');

      setForm((current) => ({
        ...current,
        house: current.house || address.name || '',
        area: area || address.name || current.area,
        city: address.city || address.subregion || current.city,
        state: address.region || current.state,
        pincode: String(address.postalCode || '')
          .replace(/\D/g, '')
          .slice(0, 6),
        latitude: String(position.coords.latitude),
        longitude: String(position.coords.longitude),
      }));

      Alert.alert(
        'Location detected',
        'Please confirm the house number and other address details before saving.',
      );
    } catch (error) {
      Alert.alert(
        'Could not detect location',
        error?.message || 'Enter your address manually.',
      );
    } finally {
      setLocating(false);
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Enter the recipient name';
    if (!/^[6-9]\d{9}$/.test(form.phone)) return 'Enter a valid 10-digit mobile number';
    if (!form.house.trim()) return 'Enter the house or flat number';
    if (!form.area.trim()) return 'Enter the street, area, or colony';
    if (!form.city.trim()) return 'Enter the city';
    if (!form.state.trim()) return 'Enter the state';
    if (!/^\d{6}$/.test(form.pincode)) return 'Enter a valid 6-digit pincode';
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Complete your address', validationError);
      return;
    }

    const street = [
      form.house.trim(),
      form.floor.trim(),
      form.area.trim(),
      form.landmark.trim() ? `Landmark: ${form.landmark.trim()}` : '',
      form.notes.trim() ? `Note: ${form.notes.trim()}` : '',
      `Type: ${selectedType}`,
    ]
      .filter(Boolean)
      .join(', ');

    try {
      setSaving(true);
      const addressData = {
        name: form.name.trim(),
        phone: form.phone,
        street,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        isDefault,
      };

      if (addressId) {
        await updateAddress(addressId, addressData);
      } else {
        await createAddress(addressData);
      }

      if (route?.params?.returnToCart) {
        navigation.navigate('MainTabs', { screen: 'Cart' });
      } else {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Could not save address', error?.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Delivery Address</Text>
        </View>

      </View>


      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.locationButton}
          activeOpacity={0.85}
          disabled={locating}
          onPress={detectCurrentLocation}
        >
          {locating ? (
            <ActivityIndicator color={Colors.primary} style={styles.locationIcon} />
          ) : (
            <Text style={styles.locationIcon}>📍</Text>
          )}
          <View style={styles.locationCopy}>
            <Text style={styles.locationTitle}>
              {locating ? 'Detecting your location...' : 'Use Current Location'}
            </Text>
            <Text style={styles.locationSub}>
              Auto-fill area, city, pincode, and map coordinates
            </Text>
          </View>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>confirm or enter manually</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.typeRow}>
          {['Home', 'Work', 'Other'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  selectedType === type && styles.typeChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {FIELDS.map((field) => (
          <View key={field.key} style={styles.field}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.notesInput]}
              placeholder={field.placeholder}
              placeholderTextColor={Colors.textMuted}
              value={form[field.key]}
              keyboardType={field.keyboardType}
              maxLength={field.maxLength}
              multiline={field.multiline}
              textAlignVertical={field.multiline ? 'top' : 'center'}
              autoCapitalize={
                field.key === 'phone' || field.key === 'pincode' ? 'none' : 'words'
              }
              onChangeText={(value) => updateField(field.key, value)}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.defaultRow}
          onPress={() => setIsDefault((value) => !value)}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
            {isDefault ? <Text style={styles.checkmark}>x</Text> : null}
          </View>
          <Text style={styles.defaultText}>Make this my default address</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          disabled={saving}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveText}>SAVE ADDRESS</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.primaryLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  headerSub: { marginTop: 4, color: Colors.textSecondary, fontSize: FontSize.xs, marginLeft: 4 },

  body: { padding: Spacing.xl, paddingBottom: 50 },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  locationIcon: {
    width: 42,
    marginRight: 10,
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '900',
    textAlign: 'center',
  },
  locationCopy: { flex: 1 },
  locationTitle: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
  locationSub: { marginTop: 2, color: Colors.primaryDark, fontSize: FontSize.xs },
  arrow: { color: Colors.primary, fontSize: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 12, color: Colors.textMuted, fontSize: FontSize.xs },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeChipText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  typeChipTextActive: { color: Colors.primary },
  field: { marginBottom: 14 },
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
  },
  notesInput: { height: 84 },
  defaultRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 18 },
  checkbox: {
    width: 22,
    height: 22,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  checkmark: { color: Colors.white, fontSize: 13, fontWeight: '900' },
  defaultText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  saveButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  buttonDisabled: { opacity: 0.65 },
  saveText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1 },
});
