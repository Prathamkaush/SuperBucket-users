import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';

export default function BackButton({ onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} activeOpacity={0.72}>
      <Text style={styles.icon}>‹</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  icon: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 32,
  },
});
