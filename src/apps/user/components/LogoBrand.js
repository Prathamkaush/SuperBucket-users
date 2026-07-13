import React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';

export default function LogoBrand({ size = 'md', onDark = false, style }) {
  const sizes = {
    xs: { fontSize: 17, letterSpacing: -0.6 },
    sm: { fontSize: 23, letterSpacing: -0.9 },
    md: { fontSize: 30, letterSpacing: -1.2 },
    lg: { fontSize: 39, letterSpacing: -1.5 },
    xl: { fontSize: 51, letterSpacing: -1.8 },
  };

  const { fontSize, letterSpacing } = sizes[size] || sizes.md;

  return (
    <View style={[styles.row, style]}>
      <Text
        style={[
          styles.base,
          { fontSize, letterSpacing, color: onDark ? '#FF4D57' : Colors.primary },
        ]}
      >
        SUPER
      </Text>
      <Text
        style={[
          styles.base,
          { fontSize, letterSpacing, color: onDark ? '#5B9FE0' : Colors.secondary },
        ]}
      >
        BUKET
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ scaleX: 1.06 }],
  },
  base: {
    fontWeight: '900',
    fontFamily: Platform.select({
      android: 'sans-serif-black',
      ios: 'Arial Black',
      default: 'sans-serif',
    }),
    includeFontPadding: false,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.3,
  },
});
