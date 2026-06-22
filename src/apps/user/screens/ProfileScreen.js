import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import LogoBrand from '../components/LogoBrand';
import { getUploadUrl } from '../services/api';
import { clearAuth, getStoredUser } from '../services/auth';
import { getProfile, getProfileStats } from '../services/profile';

const MENU_ITEMS = [
  { label: 'Edit Profile', screen: 'EditProfile', icon: 'P' },
  { label: 'Saved Addresses', screen: 'Location', icon: 'A' },
  { label: 'Order History', screen: 'OrderTracking', icon: 'O' },
  { label: 'Service Bookings', screen: 'ServiceBookings', icon: 'S' },
  { label: 'My Wallet', screen: 'Wallet', icon: 'W' },
  { label: 'Help Center', screen: null, icon: '?' },
  { label: 'Logout', screen: 'Login', icon: 'L', danger: true },
];


export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const storedUser = await getStoredUser();
      if (storedUser) setUser(storedUser);

      const [profile, stats] = await Promise.all([
        getProfile(),
        getProfileStats(),
      ]);
      setUser(profile);
      setOrderCount(stats.orders);
    } catch (error) {
      Alert.alert('Could not load profile', error?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleMenuPress = async (item) => {
    if (item.label === 'Logout') {
      await clearAuth();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      return;
    }

    if (item.screen) navigation.navigate(item.screen);
  };

  const imageUrl = user?.profileImage
    ? getUploadUrl('profiles', user.profileImage)
    : null;
  const contact = user?.phone
    ? `+91 ${String(user.phone).replace(/(\d{5})(\d{5})/, '$1 $2')}`
    : user?.email || 'Complete your profile';
  const stats = [
    { label: 'Orders', value: String(orderCount), color: Colors.secondary },
    {
      label: 'Status',
      value: user?.isVerified ? 'Verified' : 'Pending',
      color: user?.isVerified ? Colors.success : Colors.textMuted,
    },
    {
      label: 'Member',
      value: user?.createdAt ? String(new Date(user.createdAt).getFullYear()) : '-',
      color: '#7C3AED',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <View style={styles.headerDecorLeft} />
        <View style={styles.headerDecorRight} />
        <LogoBrand size="sm" style={styles.logo} />

        <View style={styles.avatar}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{user?.name || 'SuperBucket User'}</Text>
          <TouchableOpacity
            style={styles.editPenBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <Text style={styles.editPen}>✏️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.userContact}>{contact}</Text>
        {user?.email && user?.phone ? (
          <Text style={styles.userEmail}>{user.email}</Text>
        ) : null}

        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              {index < stats.length - 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadProfile}
      >
        {loading && !user ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : null}

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, index < MENU_ITEMS.length - 1 && styles.menuBorder]}
              onPress={() => handleMenuPress(item)}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIcon, item.danger && styles.dangerIcon]}>
                <Text style={[styles.menuIconText, item.danger && styles.dangerText]}>
                  {item.icon}
                </Text>
              </View>
              <View style={styles.menuCopy}>
                <Text style={[styles.menuLabel, item.danger && styles.dangerText]}>
                  {item.label}
                </Text>
                {!item.danger ? (
                  <Text style={styles.menuSub}>
                  {item.label === 'Edit Profile'
                    ? 'Update your name, email, and phone'
                    : item.label === 'Order History'
                      ? `${orderCount} orders placed`
                      : item.label === 'Service Bookings'
                        ? 'Track jobs and rate service partners'
                      : item.label === 'Saved Addresses'
                        ? 'Manage delivery locations'
                        : item.label === 'My Wallet'
                          ? 'View balance and transactions'
                          : 'FAQs and support'}

                  </Text>
                ) : null}
              </View>
              {!item.danger ? <Text style={styles.chevron}>{'>'}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.version}>SUPERBUCKET v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: 52,
    paddingBottom: 28,
    backgroundColor: Colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerDecorLeft: {
    position: 'absolute',
    left: -40,
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(227,6,19,0.05)',
  },
  headerDecorRight: {
    position: 'absolute',
    right: -50,
    bottom: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.secondary,
    opacity: 0.25,
  },
  logo: { marginBottom: 18 },
  avatar: {
    width: 88,
    height: 88,
    overflow: 'hidden',
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#F3B9BE',
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { color: Colors.primary, fontSize: 36, fontWeight: '900' },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  userName: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '800' },
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

  userContact: { marginTop: 3, color: Colors.textSecondary, fontSize: FontSize.sm },
  userEmail: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.xs },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: Spacing.lg,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.md, fontWeight: '900' },
  statLabel: { marginTop: 3, color: Colors.textMuted, fontSize: FontSize.xxs, fontWeight: '600' },
  divider: { width: 1, marginHorizontal: 8, backgroundColor: Colors.border },
  content: { paddingBottom: 50 },
  loader: { marginTop: 24 },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: Spacing.lg,
    color: Colors.textMuted,
    fontSize: FontSize.xxs,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuCard: {
    marginHorizontal: Spacing.lg,
    overflow: 'hidden',
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerIcon: { backgroundColor: Colors.dangerLight },
  menuIconText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '900' },
  menuCopy: { flex: 1 },
  menuLabel: { color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: '700' },
  menuSub: { marginTop: 2, color: Colors.textMuted, fontSize: FontSize.xs },
  dangerText: { color: Colors.danger },
  chevron: { color: Colors.gray400, fontSize: FontSize.lg, fontWeight: '700' },
  version: { marginTop: 28, textAlign: 'center', color: Colors.textMuted, fontSize: FontSize.xs },
});
