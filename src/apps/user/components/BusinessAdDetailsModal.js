import React from 'react';
import { Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function BusinessAdDetailsModal({ ad, visible, onClose, onCall }) {
  if (!ad) return null;

  const callNow = () => {
    onCall?.(ad);
    const phone = String(ad.phone || '').replace(/\D/g, '');
    if (phone) Linking.openURL(`tel:${phone}`).catch(() => undefined);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.close} onPress={onClose} accessibilityLabel="Close details">
            <Feather name="x" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          {ad.imageUrl ? <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" /> : null}
          <View style={styles.content}>
            {ad.category ? <Text style={styles.category}>{ad.category}</Text> : null}
            <Text style={styles.title}>{ad.businessName || ad.title}</Text>
            {ad.offerText ? <Text style={styles.offer}>{ad.offerText}</Text> : null}
            <Text style={styles.description}>{ad.description || ad.subtitle}</Text>
            {ad.address ? (
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={17} color={Colors.primary} />
                <Text style={styles.detailText}>{ad.address}</Text>
              </View>
            ) : null}
            {ad.phone ? (
              <View style={styles.detailRow}>
                <Feather name="phone" size={17} color={Colors.primary} />
                <Text style={styles.detailText}>{ad.phone}</Text>
              </View>
            ) : null}
            <TouchableOpacity style={styles.callButton} onPress={callNow} disabled={!ad.phone}>
              <Feather name="phone" size={18} color={Colors.white} />
              <Text style={styles.callText}>{ad.phone ? 'CALL NOW' : 'PHONE UNAVAILABLE'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: Spacing.lg, backgroundColor: 'rgba(15,23,42,0.68)', alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 430, overflow: 'hidden', borderRadius: Radius.lg, backgroundColor: Colors.white, ...Shadow.lg },
  close: { position: 'absolute', zIndex: 2, top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 190, backgroundColor: Colors.gray100 },
  content: { padding: 20 },
  category: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
  title: { marginTop: 5, color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '900' },
  offer: { marginTop: 8, color: Colors.secondary, fontSize: FontSize.sm, fontWeight: '900' },
  description: { marginTop: 9, color: Colors.textSecondary, fontSize: FontSize.sm, lineHeight: 20 },
  detailRow: { marginTop: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  detailText: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm, lineHeight: 20 },
  callButton: { marginTop: 20, height: 50, borderRadius: Radius.md, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  callText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '900' },
});
