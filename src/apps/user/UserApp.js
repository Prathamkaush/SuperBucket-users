import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
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

import { Colors } from './theme/theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

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
});
