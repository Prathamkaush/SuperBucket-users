import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import RenterDashboardScreen from './screens/RenterDashboardScreen';
import RenterListingsScreen from './screens/RenterListingsScreen';
import AddSpaceScreen from './screens/AddSpaceScreen';
import RenterLeadsScreen from './screens/RenterLeadsScreen';
import RenterProfileScreen from './screens/RenterProfileScreen';
import SpaceDetailScreen from './screens/SpaceDetailScreen';
import { Colors } from './theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: 'DB',
  Listings: 'LS',
  AddSpace: '+',
  Leads: 'LD',
  Profile: 'PR',
};

function TabIcon({ routeName, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.iconText, focused && styles.iconTextActive]}>
        {TAB_ICONS[routeName]}
      </Text>
    </View>
  );
}

function RenterTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarIcon: ({ focused }) => <TabIcon routeName={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={RenterDashboardScreen} />
      <Tab.Screen name="Listings" component={RenterListingsScreen} />
      <Tab.Screen
        name="AddSpace"
        component={AddSpaceScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.addIcon, focused && styles.addIconActive]}>
              <Text style={styles.addIconText}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen name="Leads" component={RenterLeadsScreen} />
      <Tab.Screen name="Profile" component={RenterProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RenterApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RenterTabs" component={RenterTabs} />
        <Stack.Screen name="SpaceDetail" component={SpaceDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 0,
    height: 74,
    paddingBottom: 10,
    paddingTop: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 18,
  },
  item: {
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
  },
  iconWrap: {
    width: 34,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: Colors.secondaryLight,
  },
  iconText: {
    color: Colors.gray500,
    fontSize: 11,
    fontWeight: '900',
  },
  iconTextActive: {
    color: Colors.secondary,
  },
  addIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    marginTop: -18,
  },
  addIconActive: {
    backgroundColor: Colors.primaryDark,
  },
  addIconText: {
    color: Colors.white,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '900',
  },
});
