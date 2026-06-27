import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import RenterHeader from '../components/RenterHeader';
import MetricCard from '../components/MetricCard';
import SpaceCard from '../components/SpaceCard';
import { leads, renterStats, spaces } from '../data/mockRenterData';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

export default function RenterDashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <RenterHeader
        title="Renter dashboard"
        subtitle="Manage spaces, leads, visits, and payouts."
        action={(
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.86}
            onPress={() => navigation.navigate('AddSpace')}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {renterStats.map((item) => (
            <MetricCard key={item.label} label={item.label} value={item.value} tone={item.tone} />
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Your spaces</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Listings')}>
            <Text style={styles.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        <SpaceCard
          space={spaces[0]}
          onPress={() => navigation.navigate('SpaceDetail', { space: spaces[0] })}
        />

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>New leads</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leads')}>
            <Text style={styles.linkText}>Open</Text>
          </TouchableOpacity>
        </View>

        {leads.slice(0, 2).map((lead) => (
          <View key={lead.id} style={styles.leadRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{lead.name.slice(0, 1)}</Text>
            </View>
            <View style={styles.leadBody}>
              <Text style={styles.leadName}>{lead.name}</Text>
              <Text style={styles.leadMeta}>{lead.space} - {lead.time}</Text>
            </View>
            <View style={styles.leadStatus}>
              <Text style={styles.leadStatusText}>{lead.status}</Text>
            </View>
          </View>
        ))}

        <View style={styles.actionPanel}>
          <Text style={styles.actionTitle}>Finish verification</Text>
          <Text style={styles.actionCopy}>
            Upload ownership proof and owner ID to unlock verified badges on new listings.
          </Text>
          <TouchableOpacity style={styles.primaryAction} activeOpacity={0.86}>
            <Text style={styles.primaryActionText}>Upload docs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  linkText: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
  leadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  leadMeta: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginTop: 3,
  },
  leadStatus: {
    maxWidth: 104,
    borderRadius: Radius.full,
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  leadStatusText: {
    color: Colors.secondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
    textAlign: 'center',
  },
  actionPanel: {
    backgroundColor: Colors.secondary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  actionTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  actionCopy: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 19,
  },
  primaryAction: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 4,
  },
  primaryActionText: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '900',
  },
});
