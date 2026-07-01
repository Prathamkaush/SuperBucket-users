import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import { getUploadUrl } from '../services/api';
import { getProfile, saveProfile } from '../services/profile';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    getProfile()
      .then((user) => {
        if (!active) return;
        setName(user?.name || '');
        setEmail(user?.email || '');
        setPhone(user?.phone || '');
        setProfileImage(user?.profileImage || null);
      })
      .catch((err) => {
        Alert.alert('Error', 'Could not load profile details');
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
    if (!name.trim()) return 'Please enter your name';
    if (!email.trim()) return 'Please enter your email address';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    if (!/^\d{10}$/.test(phone.trim())) return 'Please enter a valid 10-digit phone number';
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

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());
      formData.append('phone', phone.trim());
      if (selectedImage) {
        const extension = getImageExtension(selectedImage.uri);
        formData.append('image', {
          uri: selectedImage.uri,
          name: selectedImage.fileName || `profile-${Date.now()}.${extension}`,
          type: selectedImage.mimeType || getImageMimeType(extension),
        });
      }

      await saveProfile(formData);

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Save Failed', error?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo permission needed', 'Allow photo access to add your profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.length) return;
      setSelectedImage(result.assets[0]);
    } catch (error) {
      Alert.alert('Image selection failed', error?.message || 'Please try again.');
    }
  };

  const previewImageUri = selectedImage?.uri || (profileImage ? getUploadUrl('profiles', profileImage) : null);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>
        <Text style={styles.headerSub}>Update your personal details below.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.photoPicker}
            onPress={pickProfileImage}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              {previewImageUri ? (
                <Image source={{ uri: previewImageUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>{(name || 'S').charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.photoCopy}>
              <Text style={styles.photoTitle}>Profile photo</Text>
              <Text style={styles.photoSub}>{previewImageUri ? 'Tap to change image' : 'Tap to add image'}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email Address*</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number*</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              onChangeText={(val) => setPhone(val.replace(/\D/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
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
            <Text style={styles.saveText}>SAVE CHANGES</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getImageExtension(uri) {
  const match = String(uri || '').match(/\.([a-z0-9]+)(?:\?|$)/i);
  const extension = (match?.[1] || 'jpg').toLowerCase();
  return extension === 'jpeg' ? 'jpg' : extension;
}

function getImageMimeType(extension) {
  if (extension === 'jpg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
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
    backgroundColor: Colors.primaryLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
  headerSub: { marginTop: 4, color: Colors.textSecondary, fontSize: FontSize.xs, marginLeft: 4 },
  body: { padding: Spacing.lg, paddingTop: Spacing.xl },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  avatar: {
    width: 72,
    height: 72,
    overflow: 'hidden',
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { color: Colors.primary, fontSize: 30, fontWeight: '900' },
  photoCopy: { flex: 1 },
  photoTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '800' },
  photoSub: { marginTop: 3, color: Colors.textMuted, fontSize: FontSize.xs },
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
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  buttonDisabled: { opacity: 0.65 },
  saveText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '800', letterSpacing: 1 },
});
