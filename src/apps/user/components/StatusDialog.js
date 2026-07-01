import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const toneConfig = {
  success: {
    accent: Colors.success,
    soft: Colors.successLight,
    mark: 'OK',
  },
  error: {
    accent: Colors.danger,
    soft: Colors.dangerLight,
    mark: '!',
  },
  info: {
    accent: Colors.secondary,
    soft: Colors.secondaryLight,
    mark: 'i',
  },
};

export default function StatusDialog({
  visible,
  tone = 'info',
  title,
  message,
  detail,
  primaryLabel = 'Done',
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
}) {
  const config = toneConfig[tone] || toneConfig.info;

  const close = () => {
    if (onClose) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.card}>
          <View style={[styles.topBar, { backgroundColor: config.accent }]} />
          <View style={[styles.iconWrap, { backgroundColor: config.soft }]}>
            <View style={[styles.icon, { backgroundColor: config.accent }]}>
              <Text style={styles.iconText}>{config.mark}</Text>
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {detail ? (
            <View style={[styles.detailBox, { backgroundColor: config.soft }]}>
              <Text style={[styles.detailText, { color: config.accent }]}>{detail}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {secondaryLabel ? (
              <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.82} onPress={onSecondary || close}>
                <Text style={styles.secondaryText}>{secondaryLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: config.accent }]}
              activeOpacity={0.86}
              onPress={onPrimary || close}
            >
              <Text style={styles.primaryText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: 'rgba(17, 17, 17, 0.52)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...Shadow.lg,
  },
  topBar: { height: 5 },
  iconWrap: {
    alignSelf: 'center',
    width: 82,
    height: 82,
    marginTop: 22,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  title: {
    marginTop: 18,
    paddingHorizontal: Spacing.xxl,
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: 9,
    paddingHorizontal: Spacing.xxl,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  detailBox: {
    marginTop: 16,
    marginHorizontal: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  detailText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: Spacing.xxl,
    paddingTop: 20,
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  primaryText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
