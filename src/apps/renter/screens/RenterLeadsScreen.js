import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import RenterHeader from '../components/RenterHeader';
import { leads } from '../data/mockRenterData';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const FILTERS = ['All', 'Visit booked', 'Negotiating', 'Needs callback'];

export default function RenterLeadsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filteredLeads = activeFilter === 'All'
    ? leads
    : leads.filter((lead) => lead.status === activeFilter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <RenterHeader title="Leads" subtitle="Track calls, visits, and buyer interest." />

      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.chip, activeFilter === filter && styles.chipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.chipText, activeFilter === filter && styles.chipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredLeads.map((lead) => (
          <View key={lead.id} style={styles.leadCard}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{lead.name.slice(0, 1)}</Text>
              </View>
              <View style={styles.leadBody}>
                <Text style={styles.leadName}>{lead.name}</Text>
                <Text style={styles.leadSpace}>{lead.space}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{lead.status}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Budget</Text>
                <Text style={styles.infoValue}>{lead.budget}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Follow up</Text>
                <Text style={styles.infoValue}>{lead.time}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryAction}>
                <Text style={styles.secondaryActionText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>Call now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  filterBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  chipTextActive: { color: Colors.white },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  leadCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  leadBody: { flex: 1 },
  leadName: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '900',
  },
  leadSpace: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  statusPill: {
    maxWidth: 112,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  infoBox: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.gray50,
    padding: Spacing.md,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '900',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.secondary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  primaryAction: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
});
