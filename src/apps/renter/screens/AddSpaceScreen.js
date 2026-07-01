import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import RenterHeader from '../components/RenterHeader';
import { furnishedOptions, listingCategories, listingModes } from '../data/mockRenterData';
import { createProperty } from '../services/properties';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

function OptionRow({ label, options, value, onChange }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionChip, value === option && styles.optionChipActive]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function Field({ label, placeholder, value, onChangeText, keyboardType = 'default', multiline = false }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

export default function AddSpaceScreen({ navigation }) {
  const [mode, setMode] = useState('Rent');
  const [category, setCategory] = useState('Residential');
  const [furnished, setFurnished] = useState('Semi furnished');
  const [form, setForm] = useState({
    title: '',
    address: '',
    pincode: '',
    price: '',
    size: '',
    floor: '',
    details: '',
  });

  const [frontImage, setFrontImage] = useState(null);
  const [roomsImage, setRoomsImage] = useState(null);
  const [docsFile, setDocsFile] = useState(null);
  const [docsFileName, setDocsFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const pickImage = async (type) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      if (type === 'front') setFrontImage(selectedUri);
      if (type === 'rooms') setRoomsImage(selectedUri);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setDocsFile(result.assets[0].uri);
      setDocsFileName(result.assets[0].name || 'document.pdf');
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.address || !/^\d{6}$/.test(form.pincode) || !form.price || !form.size) {
      Alert.alert('Validation Error', 'Please enter Title, Address, a valid 6-digit PIN code, Price, and Size.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('address', form.address);
      formData.append('pincode', form.pincode);
      formData.append('mode', mode.toUpperCase()); // RENT or SELL
      formData.append('category', category.toUpperCase()); // RESIDENTIAL, etc.
      formData.append('price', parseFloat(form.price));
      formData.append('size', form.size);
      
      if (form.floor) {
        formData.append('floor', form.floor);
      }

      const furnishedVal = furnished.toUpperCase().replace(' ', '_');
      formData.append('furnished', furnishedVal); // UNFURNISHED, SEMI_FURNISHED, FULLY_FURNISHED
      
      if (form.details) {
        formData.append('details', form.details);
      }

      if (frontImage) {
        formData.append('frontImage', {
          uri: frontImage,
          name: 'front.jpg',
          type: 'image/jpeg',
        });
      }

      if (roomsImage) {
        formData.append('roomsImage', {
          uri: roomsImage,
          name: 'rooms.jpg',
          type: 'image/jpeg',
        });
      }

      if (docsFile) {
        formData.append('docsFile', {
          uri: docsFile,
          name: docsFileName || 'document.pdf',
          type: 'application/octet-stream',
        });
      }

      await createProperty(formData);

      Alert.alert(
        'Success',
        'Property listing submitted for admin review!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Submission Failed', error.message || 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <RenterHeader title="Add space" subtitle="Create a rental or selling listing." />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <OptionRow label="Listing type" options={listingModes} value={mode} onChange={setMode} />
          <OptionRow label="Category" options={listingCategories} value={category} onChange={setCategory} />

          <Field
            label="Space title"
            placeholder="Example: 2BHK Apartment near college"
            value={form.title}
            onChangeText={(value) => updateForm('title', value)}
          />
          <Field
            label="Full address"
            placeholder="Street, area, city"
            value={form.address}
            onChangeText={(value) => updateForm('address', value)}
          />
          <Field
            label="Property PIN code"
            placeholder="6-digit PIN code"
            value={form.pincode}
            onChangeText={(value) => updateForm('pincode', value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
          />

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field
                label={mode === 'Sell' ? 'Selling price' : 'Monthly rent'}
                placeholder="12000"
                value={form.price}
                onChangeText={(value) => updateForm('price', value)}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.column}>
              <Field
                label="Size"
                placeholder="850 sq ft"
                value={form.size}
                onChangeText={(value) => updateForm('size', value)}
              />
            </View>
          </View>

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field
                label="Floor"
                placeholder="3rd floor"
                value={form.floor}
                onChangeText={(value) => updateForm('floor', value)}
              />
            </View>
            <View style={styles.column}>
              <OptionRow
                label="Furnished"
                options={furnishedOptions}
                value={furnished}
                onChange={setFurnished}
              />
            </View>
          </View>

          <Field
            label="Description"
            placeholder="Add facilities, rules, documents, nearby landmarks..."
            value={form.details}
            onChangeText={(value) => updateForm('details', value)}
            multiline
          />
        </View>

        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Photos and documents</Text>
          <Text style={styles.uploadCopy}>Add front view, room photos, ownership proof, and ID proof.</Text>
          <View style={styles.uploadGrid}>
            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('front')}>
              {frontImage ? (
                <Text style={styles.uploadCheck}>✓ Front View</Text>
              ) : (
                <>
                  <Text style={styles.uploadPlus}>+</Text>
                  <Text style={styles.uploadLabel}>Front</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('rooms')}>
              {roomsImage ? (
                <Text style={styles.uploadCheck}>✓ Rooms View</Text>
              ) : (
                <>
                  <Text style={styles.uploadPlus}>+</Text>
                  <Text style={styles.uploadLabel}>Rooms</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
              {docsFile ? (
                <Text style={styles.uploadCheck}>✓ {docsFileName.slice(0, 10)}...</Text>
              ) : (
                <>
                  <Text style={styles.uploadPlus}>+</Text>
                  <Text style={styles.uploadLabel}>Docs</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stickyActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Submit listing</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.lg,
    ...Shadow.sm,
  },
  fieldBlock: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  optionChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  optionTextActive: {
    color: Colors.white,
  },
  input: {
    minHeight: 46,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 104,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
  uploadCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  uploadTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  uploadCopy: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 19,
  },
  uploadGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  uploadBox: {
    flex: 1,
    minHeight: 92,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlus: {
    color: Colors.secondary,
    fontSize: FontSize.xxl,
    fontWeight: '900',
  },
  uploadLabel: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  uploadCheck: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  stickyActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  btnDisabled: {
    backgroundColor: Colors.gray400,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
});
