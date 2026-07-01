import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RenterHeader from '../components/RenterHeader';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';
import { clearAuth, getStoredUser } from '../services/auth';
import { getProfile } from '../services/profile';
import { getMyProperties } from '../services/properties';


// Static list is removed and replaced by dynamic items inside the component.


export default function RenterProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [spacesCount, setSpacesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const items = [
    { title: 'Edit Profile', value: 'Update owner name, email, and phone', screen: 'EditProfile' },
    { title: 'Owner verification', value: user?.isVerified ? '100% complete' : '80% complete' },
    {
      title: 'Bank and payouts',
      value: user?.bankAccountNumber ? 'Primary account linked' : 'Details pending',
      screen: 'BankDetails',
    },
    { title: 'Support', value: 'Open tickets and help' },
    { title: 'Listing policy', value: 'Rules for rent and sell' },
  ];

  const loadProfile = useCallback(async () => {
    try {
      const storedUser = await getStoredUser();
      if (storedUser) setUser(storedUser);

      const [profile, properties] = await Promise.all([
        getProfile(),
        getMyProperties(),
      ]);
      setUser(profile);
      setSpacesCount(properties.length);
    } catch (error) {
      console.log('Error loading renter profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleLogout = async () => {
    await clearAuth();
    const rootNavigation = navigation.getParent()?.getParent() || navigation;
    rootNavigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const navigateFromProfile = (screen) => {
    if (!screen) return;
    if (screen === 'EditProfile') {
      const rootNavigation = navigation.getParent()?.getParent() || navigation;
      rootNavigation.navigate('EditProfile');
      return;
    }
    navigation.navigate(screen);
  };

  const name = user?.name || 'Renter Kiosk';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <RenterHeader title="Profile" subtitle="Owner account, documents, and settings." />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ownerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.ownerBody}>
            <View style={styles.userNameRow}>
              <Text style={styles.ownerName}>{name}</Text>
              <TouchableOpacity
                style={styles.editPenBtn}
                onPress={() => navigation.navigate('EditProfile')}
                activeOpacity={0.7}
              >
                <Text style={styles.editPen}>✏️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.ownerMeta}>{spacesCount} active spaces - 4.8 rating</Text>
            {user?.phone ? (
              <Text style={styles.ownerContact}>+91 {user.phone}</Text>
            ) : user?.email ? (
              <Text style={styles.ownerContact}>{user.email}</Text>
            ) : null}
          </View>
          <View style={[
            styles.verifiedBadge,
            { backgroundColor: user?.isVerified ? Colors.successLight : Colors.gray100 }
          ]}>
            <Text style={[
              styles.verifiedText,
              { color: user?.isVerified ? Colors.success : Colors.textMuted }
            ]}>
              {user?.isVerified ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>


        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Verification progress</Text>
            <Text style={styles.progressValue}>{user?.isVerified ? '100%' : '80%'}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: user?.isVerified ? '100%' : '80%' }]} />
          </View>
          <Text style={styles.progressCopy}>
            {user?.isVerified
              ? 'Your owner account is fully verified!'
              : 'Complete address proof to show higher in search results.'}
          </Text>
        </View>


        {items.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.settingRow}
            activeOpacity={0.86}
            onPress={() => navigateFromProfile(item.screen)}
          >
            <View>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingValue}>{item.value}</Text>
            </View>
            <Text style={styles.chevron}>Go</Text>
          </TouchableOpacity>
        ))}


        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>LOG OUT</Text>
        </TouchableOpacity>
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
  ownerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.secondary,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  ownerBody: { flex: 1 },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerName: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  editPenBtn: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  editPen: {
    fontSize: FontSize.xs,
  },
  ownerMeta: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 3,
  },

  verifiedBadge: {
    borderRadius: Radius.full,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedText: {
    color: Colors.success,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  progressCard: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  progressValue: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.white,
  },

  progressCopy: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  settingRow: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.sm,
  },
  settingTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  settingValue: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 3,
  },
  chevron: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  ownerContact: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    ...Shadow.sm,
  },
  logoutButtonText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
