import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function AdvertiseChoiceScreen({ navigation }) {
  const choices = [
    { type: 'BUSINESS', title: 'Business', subtitle: 'Show your ad in the home sponsored banner.', Icon: Feather, icon: 'briefcase' },
    { type: 'LOCAL_SHOP', title: 'Local Shop', subtitle: 'List your shop in the Local Shops directory.', Icon: MaterialCommunityIcons, icon: 'storefront-outline' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View><Text style={styles.title}>Business Ads</Text><Text style={styles.sub}>What would you like to advertise?</Text></View>
      </View>
      <View style={styles.content}>
        {choices.map(({ type, title, subtitle, Icon, icon }) => (
          <TouchableOpacity key={type} style={styles.card} onPress={() => navigation.navigate('AdvertiseBusiness', { adType: type })} activeOpacity={0.82}>
            <View style={styles.icon}><Icon name={icon} size={28} color={Colors.primary} /></View>
            <View style={styles.copy}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardSub}>{subtitle}</Text></View>
            <Feather name="chevron-right" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.myAds} onPress={() => navigation.navigate('MyBusinessAds')}>
          <Feather name="bar-chart-2" size={18} color={Colors.primary} />
          <Text style={styles.myAdsText}>VIEW MY ADS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 48, paddingBottom: 18, paddingHorizontal: Spacing.lg, backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { color: Colors.textPrimary, fontSize: FontSize.xl, fontWeight: '900' },
  sub: { marginTop: 3, color: Colors.textSecondary, fontSize: FontSize.xs },
  content: { padding: Spacing.lg, gap: 14 },
  card: { minHeight: 112, padding: 18, borderRadius: Radius.lg, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', gap: 14, ...Shadow.sm },
  icon: { width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  cardTitle: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '900' },
  cardSub: { marginTop: 5, color: Colors.textSecondary, fontSize: FontSize.xs, lineHeight: 17 },
  myAds: { marginTop: 6, height: 50, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  myAdsText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900' },
});
