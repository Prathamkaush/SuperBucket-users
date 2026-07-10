import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RenterHeader from '../components/RenterHeader';
import { getMyLeads, updateLeadStatus } from '../services/properties';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../theme/theme';

const FILTERS = ['All', 'Pending', 'Visit booked', 'Negotiating', 'Needs callback', 'Resolved'];

const STATUS_MAP = {
  'Pending': 'PENDING',
  'Visit booked': 'VISIT_BOOKED',
  'Negotiating': 'NEGOTIATING',
  'Needs callback': 'NEEDS_CALLBACK',
  'Resolved': 'RESOLVED',
};

const DISPLAY_STATUS = {
  'PENDING': 'Pending',
  'VISIT_BOOKED': 'Visit booked',
  'NEGOTIATING': 'Negotiating',
  'NEEDS_CALLBACK': 'Needs callback',
  'RESOLVED': 'Resolved',
};

export default function RenterLeadsScreen() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadLeads = useCallback(async () => {
    try {
      const data = await getMyLeads();
      setLeads(data);
    } catch (error) {
      console.log('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLeads();
    }, [loadLeads])
  );

  const handleStatusChange = (leadId, currentStatus) => {
    Alert.alert(
      'Update Lead Status',
      'Select a new status for this lead:',
      Object.keys(STATUS_MAP).map((label) => ({
        text: label,
        style: STATUS_MAP[label] === currentStatus ? 'cancel' : 'default',
        onPress: async () => {
          try {
            setLoading(true);
            await updateLeadStatus(leadId, STATUS_MAP[label]);
            loadLeads();
          } catch (error) {
            Alert.alert('Error', error.message || 'Could not update status');
            setLoading(false);
          }
        },
      })),
      { cancelable: true }
    );
  };

  const updateLead = async (leadId, nextStatus) => {
    try {
      setLoading(true);
      await updateLeadStatus(leadId, nextStatus);
      await loadLeads();
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not update status');
      setLoading(false);
    }
  };

  const handleCall = (phone) => {
    if (!phone) {
      Alert.alert('Error', 'No phone number available for this user');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Error', 'Could not initiate call');
    });
  };

  const handleEmail = (email, name) => {
    if (!email) {
      Alert.alert('Error', 'No email available for this user');
      return;
    }
    Linking.openURL(`mailto:${email}?subject=Superbucket Property Inquiry`).catch(() => {
      Alert.alert('Error', 'Could not open mail app');
    });
  };

  const filteredLeads = leads.filter((lead) => {
    if (activeFilter === 'All') return true;
    const dbStatus = STATUS_MAP[activeFilter];
    return lead.status === dbStatus;
  });

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

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <View key={lead.id} style={styles.leadCard}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(lead.user?.name || 'U').slice(0, 1)}</Text>
                  </View>
                  <View style={styles.leadBody}>
                    <Text style={styles.leadName}>{lead.user?.name || 'Anonymous User'}</Text>
                    <Text style={styles.leadSpace}>{lead.property?.title}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.statusPill}
                    onPress={() => handleStatusChange(lead.id, lead.status)}
                  >
                    <Text style={styles.statusText}>{DISPLAY_STATUS[lead.status] || lead.status}</Text>
                  </TouchableOpacity>
                </View>

                {lead.message && (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageLabel}>Inquiry message:</Text>
                    <Text style={styles.messageText}>{lead.message}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Budget / Price</Text>
                    <Text style={styles.infoValue}>
                      Rs {parseFloat(lead.property?.price || 0).toLocaleString('en-IN')}
                      {lead.property?.mode === 'RENT' ? '/mo' : ''}
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Visit Scheduled</Text>
                    <Text style={styles.infoValue}>
                      {lead.visitTime ? new Date(lead.visitTime).toLocaleString() : 'Inquiry only'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => handleEmail(lead.user?.email, lead.user?.name)}
                  >
                    <Text style={styles.secondaryActionText}>Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => handleCall(lead.user?.phone)}
                  >
                    <Text style={styles.primaryActionText}>Call now</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.workflowActions}>
                  {[
                    { label: 'Pending', value: 'PENDING' },
                    { label: 'Visit booked', value: 'VISIT_BOOKED' },
                    { label: 'Negotiating', value: 'NEGOTIATING' },
                    { label: 'Needs callback', value: 'NEEDS_CALLBACK' },
                    { label: 'Resolved', value: 'RESOLVED' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={[styles.workflowChip, lead.status === item.value && styles.workflowChipActive]}
                      disabled={lead.status === item.value}
                      onPress={() => updateLead(lead.id, item.value)}
                    >
                      <Text style={[styles.workflowChipText, lead.status === item.value && styles.workflowChipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No leads found under this filter.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  workflowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  workflowChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  workflowChipActive: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondaryLight,
  },
  workflowChipText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '900',
  },
  workflowChipTextActive: {
    color: Colors.secondary,
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
  messageBox: {
    backgroundColor: Colors.gray50,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '800',
    marginBottom: 4,
  },
  messageText: {
    color: Colors.textPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
