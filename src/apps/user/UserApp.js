import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SplashScreen      from './screens/SplashScreen';
import LoginScreen       from './screens/LoginScreen';
import LocationScreen    from './screens/LocationScreen';
import HomeScreen        from './screens/HomeScreen';
import CartScreen        from './screens/CartScreen';
import WalletScreen      from './screens/WalletScreen';
import ParcelScreen      from './screens/ParcelScreen';
import PrintDeliverScreen from './screens/PrintDeliverScreen';
import PennyWorksScreen  from './screens/PennyWorksScreen';
import ServiceCheckoutScreen from './screens/ServiceCheckoutScreen';
import ServiceBookingsScreen from './screens/ServiceBookingsScreen';
import RentalsScreen     from './screens/RentalsScreen';
import RentalDetailScreen from './screens/RentalDetailScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen     from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AdvertiseBusinessScreen from './screens/AdvertiseBusinessScreen';
import RenterDashboardScreen from '../renter/screens/RenterDashboardScreen';
import RenterListingsScreen from '../renter/screens/RenterListingsScreen';
import AddSpaceScreen from '../renter/screens/AddSpaceScreen';
import RenterLeadsScreen from '../renter/screens/RenterLeadsScreen';
import RenterProfileScreen from '../renter/screens/RenterProfileScreen';
import SpaceDetailScreen from '../renter/screens/SpaceDetailScreen';
import ProviderLoginScreen from '../provider/screens/LoginScreen';
import ProviderOnboardingScreen from '../provider/screens/OnboardingScreen';
import ProviderDashboardScreen from '../provider/screens/DashboardScreen';
import ProviderJobsScreen from '../provider/screens/JobsScreen';
import ProviderEarningsScreen from '../provider/screens/EarningsScreen';
import ProviderProfileScreen from '../provider/screens/ProfileScreen';
import { getToken as getProviderToken } from '../provider/services/auth';
import { getProfile as getProviderProfile } from '../provider/services/provider';

import { Colors } from './theme/theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
const RenterStack = createNativeStackNavigator();
const RenterTab = createBottomTabNavigator();
const ProviderStack = createNativeStackNavigator();
const ProviderTab = createBottomTabNavigator();

const TAB_ITEMS = [
  { name: 'Home',    icon: '🏠',  label: 'Home'    },
  { name: 'Grocery', icon: '🛒',  label: 'Grocery' },
  { name: 'Cart',    icon: '🛍️', label: 'Cart'    },
  { name: 'Wallet',  icon: '💰',  label: 'Wallet'  },
  { name: 'Profile', icon: '👤',  label: 'Profile' },
];

function TabIcon({ icon, focused, label }) {
  return (
    <View style={tabStyles.iconWrap}>
      <View style={[tabStyles.iconBg, focused && tabStyles.iconBgActive]}>
        <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icon}</Text>
      </View>
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          tabStyles.tabBar,
          {
            height: 62 + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarLabelStyle: tabStyles.label,
        tabBarItemStyle: tabStyles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Grocery"
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🛒" focused={focused} />,
          tabBarLabel: 'Shop',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={tabStyles.cartIconWrap}>
              <View style={[tabStyles.cartBubble, focused && tabStyles.cartBubbleFocused]}>
                <Text style={tabStyles.cartIcon}>🛍️</Text>
              </View>
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[tabStyles.label, { color: focused ? Colors.primary : Colors.gray500 }]}>
              Cart
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💰" focused={focused} />,
          tabBarLabel: 'Wallet',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const RENTER_TABS = {
  Dashboard: 'DB',
  Listings: 'LS',
  AddSpace: '+',
  Leads: 'LD',
  Profile: 'PR',
};

const PROVIDER_TABS = {
  Dashboard: 'DB',
  Jobs: 'JB',
  Earnings: 'Rs',
  Profile: 'PR',
};

function MiniTabIcon({ label, focused }) {
  return (
    <View style={[tabStyles.miniIcon, focused && tabStyles.miniIconActive]}>
      <Text style={[tabStyles.miniIconText, focused && tabStyles.miniIconTextActive]}>
        {label}
      </Text>
    </View>
  );
}

function RenterTabs() {
  return (
    <RenterTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: tabStyles.innerTabBar,
        tabBarLabelStyle: tabStyles.label,
        tabBarIcon: ({ focused }) => (
          <MiniTabIcon label={RENTER_TABS[route.name]} focused={focused} />
        ),
      })}
    >
      <RenterTab.Screen name="Dashboard" component={RenterDashboardScreen} />
      <RenterTab.Screen name="Listings" component={RenterListingsScreen} />
      <RenterTab.Screen
        name="AddSpace"
        component={AddSpaceScreen}
        options={{ tabBarLabel: 'Add' }}
      />
      <RenterTab.Screen name="Leads" component={RenterLeadsScreen} />
      <RenterTab.Screen name="Profile" component={RenterProfileScreen} />
    </RenterTab.Navigator>
  );
}

function RenterPortal() {
  return (
    <RenterStack.Navigator screenOptions={{ headerShown: false }}>
      <RenterStack.Screen name="RenterTabs" component={RenterTabs} />
      <RenterStack.Screen name="SpaceDetail" component={SpaceDetailScreen} />
    </RenterStack.Navigator>
  );
}

function ProviderTabs() {
  return (
    <ProviderTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: tabStyles.innerTabBar,
        tabBarLabelStyle: tabStyles.label,
        tabBarIcon: ({ focused }) => (
          <MiniTabIcon label={PROVIDER_TABS[route.name]} focused={focused} />
        ),
      })}
    >
      <ProviderTab.Screen name="Dashboard" component={ProviderDashboardScreen} />
      <ProviderTab.Screen name="Jobs" component={ProviderJobsScreen} />
      <ProviderTab.Screen name="Earnings" component={ProviderEarningsScreen} />
      <ProviderTab.Screen name="Profile" component={ProviderProfileScreen} />
    </ProviderTab.Navigator>
  );
}

function ProviderGate({ navigation }) {
  React.useEffect(() => {
    let mounted = true;

    async function resolveProviderStart() {
      const token = await getProviderToken();
      if (!mounted) return;

      if (!token) {
        navigation.replace('Login');
        return;
      }

      try {
        await getProviderProfile();
        if (mounted) navigation.replace('ProviderTabs');
      } catch {
        if (mounted) navigation.replace('Onboarding');
      }
    }

    resolveProviderStart();
    return () => { mounted = false; };
  }, [navigation]);

  return (
    <View style={tabStyles.portalLoading}>
      <ActivityIndicator color={Colors.primary} />
    </View>
  );
}

function ProviderPortal() {
  return (
    <ProviderStack.Navigator screenOptions={{ headerShown: false }}>
      <ProviderStack.Screen name="ProviderGate" component={ProviderGate} />
      <ProviderStack.Screen name="Login" component={ProviderLoginScreen} />
      <ProviderStack.Screen name="Onboarding" component={ProviderOnboardingScreen} />
      <ProviderStack.Screen name="ProviderTabs" component={ProviderTabs} />
    </ProviderStack.Navigator>
  );
}

export default function UserApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"        component={SplashScreen} />
        <Stack.Screen name="Login"         component={LoginScreen} />
        <Stack.Screen name="Location"      component={LocationScreen} />
        <Stack.Screen name="MainTabs"      component={MainTabs} />
        <Stack.Screen name="Parcel"        component={ParcelScreen} />
        <Stack.Screen name="PrintDeliver"  component={PrintDeliverScreen} />
        <Stack.Screen name="PennyWorks"    component={PennyWorksScreen} />
        <Stack.Screen name="ServiceCheckout" component={ServiceCheckoutScreen} />
        <Stack.Screen name="ServiceBookings" component={ServiceBookingsScreen} />
        <Stack.Screen name="Rentals"       component={RentalsScreen} />
        <Stack.Screen name="RentalDetail"  component={RentalDetailScreen} />
        <Stack.Screen name="Marketplace"   component={MarketplaceScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="EditProfile"   component={EditProfileScreen} />
        <Stack.Screen name="AdvertiseBusiness" component={AdvertiseBusinessScreen} />
        <Stack.Screen name="RenterPortal"  component={RenterPortal} />
        <Stack.Screen name="ProviderPortal" component={ProviderPortal} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingTop: 6,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
  tabItem: {
    paddingTop: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconBgActive: {
    backgroundColor: Colors.primaryLight,
  },
  icon: {
    fontSize: 20,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
    fontSize: 22,
  },
  cartIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  cartBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  cartBubbleFocused: {
    backgroundColor: Colors.primary,
  },
  cartIcon: {
    fontSize: 22,
  },
  innerTabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 9,
    paddingTop: 7,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  miniIcon: {
    width: 34,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniIconActive: {
    backgroundColor: Colors.primaryLight,
  },
  miniIconText: {
    color: Colors.gray500,
    fontSize: 11,
    fontWeight: '900',
  },
  miniIconTextActive: {
    color: Colors.primary,
  },
  portalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
