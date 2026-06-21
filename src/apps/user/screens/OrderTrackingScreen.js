import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';

const STEPS = [
  { key: 'received', icon: '📋', label: 'Order Received', time: '6:10 PM', done: true },
  { key: 'packed', icon: '📦', label: 'Packed & Ready', time: '6:35 PM', done: true },
  { key: 'out', icon: '🚴', label: 'Out for Delivery', time: '7:05 PM', done: true },
  { key: 'delivered', icon: '✅', label: 'Delivered', time: 'Est. 7:30 PM', done: false },
];

export default function OrderTrackingScreen({ navigation }) {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSub}>Order #SB2045</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.mapPlaceholder}>
          <Animated.Text style={[styles.riderEmoji, { transform: [{ scale: pulseAnim }] }]}>🚴</Animated.Text>
          <Text style={styles.mapText}>Rider is 1.2 km away</Text>
          <Text style={styles.mapEta}>Arriving in ~8 minutes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Status</Text>
          <View style={styles.timelineCard}>
            {STEPS.map((step, idx) => (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, step.done ? styles.dotDone : styles.dotPending]}>
                    <Text style={{ fontSize: 14 }}>{step.done ? '✓' : '○'}</Text>
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineIcon]}>{step.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.timelineLabel, step.done && styles.timelineLabelDone]}>{step.label}</Text>
                    <Text style={styles.timelineTime}>{step.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rider</Text>
          <View style={styles.riderCard}>
            <View style={styles.riderAvatar}>
              <Text style={{ fontSize: 32 }}>👷</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>Vikram Singh</Text>
              <Text style={styles.riderDetails}>2-Wheeler  •  MH 12 AB 3456</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ 4.7</Text>
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <TouchableOpacity style={styles.riderActionBtn}>
                <Text style={{ fontSize: 20 }}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.riderActionBtn, { backgroundColor: Colors.secondaryLight }]}>
                <Text style={{ fontSize: 20 }}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 12 }}>
          <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]}>
            <Text style={styles.actionBtnText}>📞 Call Rider</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline, { flex: 1 }]}>
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>🆘 Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primaryLight, flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  mapPlaceholder: { backgroundColor: Colors.primaryLight, height: 200, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
  riderEmoji: { fontSize: 56, marginBottom: 8 },
  mapText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  mapEta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  section: { paddingHorizontal: Spacing.lg, paddingTop: 20, marginBottom: 4 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  timelineCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, ...Shadow.sm },
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineLeft: { alignItems: 'center', marginRight: 12, width: 32 },
  timelineDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: Colors.primary },
  dotPending: { backgroundColor: Colors.gray200 },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.gray200, marginVertical: 4, minHeight: 24 },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 16 },
  timelineIcon: { fontSize: 20, marginRight: 10 },
  timelineLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  timelineLabelDone: { color: Colors.textPrimary },
  timelineTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  riderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16, ...Shadow.md, gap: 12 },
  riderAvatar: { width: 56, height: 56, backgroundColor: Colors.primaryLight, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  riderName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  riderDetails: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  ratingBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, alignSelf: 'flex-start', marginTop: 4 },
  ratingText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  riderActionBtn: { width: 42, height: 42, backgroundColor: Colors.primaryLight, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 16, ...Shadow.sm },
  actionBtnOutline: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
  actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.sm },
});
