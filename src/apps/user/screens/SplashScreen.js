import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Colors, FontSize } from '../theme/theme';
import LogoBrand from '../components/LogoBrand';
import { clearAuth, getAuthToken } from '../services/auth';
import { getAddresses } from '../services/addresses';
import { registerForPushNotifications } from '../services/notifications';

const { width } = Dimensions.get('window');
const ADDRESS_CHECK_TIMEOUT_MS = 900;

function withTimeout(promise, timeoutMs, fallback) {
  let timer;
  return Promise.race([
    promise,
    new Promise((resolve) => {
      timer = setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

function DeliveryTruck() {
  return (
    <View style={styles.truck}>
      <View style={styles.truckCargo} />
      <View style={styles.truckCab}>
        <View style={styles.truckWindow} />
      </View>
      <View style={[styles.wheel, styles.wheelBack]} />
      <View style={[styles.wheel, styles.wheelFront]} />
    </View>
  );
}

export default function SplashScreen({ navigation }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(18)).current;
  const brandScale = useRef(new Animated.Value(0.96)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(8)).current;
  const truckX = useRef(new Animated.Value(-150)).current;
  const lineScale = useRef(new Animated.Value(0)).current;
  const serviceOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    let navigationTimer;

    const resolveDestination = async () => {
      const token = await getAuthToken();
      if (!token) return 'Login';
      registerForPushNotifications(token, 'user').catch(() => undefined);

      try {
        const addresses = await withTimeout(
          getAddresses(),
          ADDRESS_CHECK_TIMEOUT_MS,
          null,
        );
        if (addresses === null) return 'MainTabs';
        return Array.isArray(addresses) && addresses.length > 0
          ? 'MainTabs'
          : 'Location';
      } catch (error) {
        if (error?.status === 401 || error?.status === 403) {
          await clearAuth();
          return 'Login';
        }

        // Keep a saved session usable when the local API is temporarily offline.
        return 'MainTabs';
      }
    };

    const destinationPromise = resolveDestination();
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(brandScale, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(lineScale, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(truckX, {
          toValue: width + 120,
          duration: 620,
          easing: Easing.bezier(0.22, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(serviceOpacity, {
          toValue: 1,
          duration: 220,
          delay: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(() => {
      navigationTimer = setTimeout(async () => {
        const destination = await destinationPromise;
        if (mounted) navigation.replace(destination);
      }, 120);
    });

    return () => {
      mounted = false;
      if (navigationTimer) clearTimeout(navigationTimer);
      animation.stop();
    };
  }, [
    brandScale,
    lineScale,
    logoOpacity,
    logoY,
    navigation,
    serviceOpacity,
    taglineOpacity,
    taglineY,
    truckX,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.topAccent}>
        <View style={styles.redAccent} />
        <View style={styles.blueAccent} />
      </View>

      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoY }, { scale: brandScale }],
          },
        ]}
      >
        <LogoBrand size="xl" />
        <Animated.View
          style={[
            styles.brandLine,
            { transform: [{ scaleX: lineScale }] },
          ]}
        >
          <View style={styles.brandLineRed} />
          <View style={styles.brandLineBlue} />
        </Animated.View>
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineY }],
            },
          ]}
        >
          Your Town. Everything Delivered.
        </Animated.Text>
      </Animated.View>

      <View style={styles.routeWrap}>
        <View style={styles.routeLine} />
        <Animated.View style={[styles.truckMotion, { transform: [{ translateX: truckX }] }]}>
          <DeliveryTruck />
        </Animated.View>
      </View>

      <Animated.View style={[styles.servicesRow, { opacity: serviceOpacity }]}>
        {['Groceries', 'Parcels', 'Services', 'Rentals'].map((item) => (
          <View key={item} style={styles.servicePill}>
            <Text style={styles.serviceText}>{item}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={styles.bottomBar}>
        <View style={styles.redStripe} />
        <View style={styles.blueStripe} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 7,
    flexDirection: 'row',
  },
  redAccent: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  blueAccent: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 34,
  },
  brandLine: {
    width: 192,
    height: 4,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 16,
  },
  brandLineRed: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  brandLineBlue: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.gray700,
    fontWeight: '700',
    letterSpacing: 0,
  },
  routeWrap: {
    width: '100%',
    height: 76,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 28,
  },
  routeLine: {
    position: 'absolute',
    left: 34,
    right: 34,
    height: 2,
    backgroundColor: Colors.divider,
  },
  truckMotion: {
    width: 126,
    height: 54,
    justifyContent: 'center',
  },
  truck: {
    width: 118,
    height: 44,
    position: 'relative',
  },
  truckCargo: {
    position: 'absolute',
    left: 4,
    top: 10,
    width: 66,
    height: 24,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  truckCab: {
    position: 'absolute',
    right: 6,
    top: 14,
    width: 40,
    height: 20,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 4,
    backgroundColor: Colors.secondary,
  },
  truckWindow: {
    position: 'absolute',
    right: 8,
    top: 4,
    width: 12,
    height: 8,
    borderRadius: 2,
    backgroundColor: Colors.white,
    opacity: 0.9,
  },
  wheel: {
    position: 'absolute',
    bottom: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.gray900,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  wheelBack: {
    left: 24,
  },
  wheelFront: {
    right: 18,
  },
  servicesRow: {
    position: 'absolute',
    bottom: 84,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
  },
  servicePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceText: {
    color: Colors.gray800,
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 0,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
    flexDirection: 'row',
  },
  redStripe: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  blueStripe: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
});
