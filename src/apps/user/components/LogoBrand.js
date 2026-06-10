import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';

export default function LogoBrand({ size = 'md', onDark = false, style }) {
  const sizes = {
    xs: { fontSize: 17, letterSpacing: 0 },
    sm: { fontSize: 22, letterSpacing: 0 },
    md: { fontSize: 29, letterSpacing: 0 },
    lg: { fontSize: 38, letterSpacing: 0 },
    xl: { fontSize: 50, letterSpacing: 0 },
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
    transform: [{ scaleX: 1.04 }],
  },
  base: {
    fontWeight: '900',
    includeFontPadding: false,
  },
});
