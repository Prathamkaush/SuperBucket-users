import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyJobs, getProfile, setAvailability } from '../services/provider';
import { Colors, card } from '../theme';

export default function DashboardScreen() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const load = useCallback(async () => {
    try { const [nextProfile, nextJobs] = await Promise.all([getProfile(), getMyJobs()]); setProfile(nextProfile); setJobs(nextJobs); }
    catch (error) { Alert.alert('Could not refresh', error.message); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const toggle = async (value) => {
    try { setChanging(true); const updated = await setAvailability(value); setProfile((current) => ({ ...current, isOnline: updated.isOnline })); }
    catch (error) { Alert.alert('Cannot go online', error.message); }
    finally { setChanging(false); }
  };
  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  const completed = jobs.filter((job) => job.status === 'COMPLETED');
  const active = jobs.filter((job) => ['ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS'].includes(job.status));
  const earnings = completed.reduce((sum, job) => sum + Number(job.providerEarning), 0);
  return (
    <ScrollView contentContainerStyle={styles.page} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Text style={styles.greeting}>Provider dashboard</Text>
      <View style={[styles.statusCard, profile?.isOnline && styles.onlineCard]}><View><Text style={styles.statusTitle}>{profile?.isOnline ? 'You are online' : 'You are offline'}</Text><Text style={styles.statusHelp}>{profile?.status === 'APPROVED' ? 'Go online to receive nearby jobs.' : `Approval status: ${profile?.status}`}</Text></View><Switch disabled={changing || profile?.status !== 'APPROVED'} value={Boolean(profile?.isOnline)} onValueChange={toggle} trackColor={{ true: Colors.success }} /></View>
      {profile?.status === 'PENDING' ? <View style={styles.notice}><Text style={styles.noticeTitle}>Approval pending</Text><Text style={styles.noticeText}>An admin is reviewing your services. You can go online after approval.</Text></View> : null}
      <View style={styles.metrics}><Metric value={active.length} label="Active jobs" /><Metric value={profile?.stats?.completedJobs || completed.length} label="Completed" /><Metric value={`★ ${profile?.stats?.averageRating || 'New'}`} label={`${profile?.stats?.ratingCount || 0} ratings`} /><Metric value={`₹${earnings.toFixed(0)}`} label="Earnings" /></View>
      <Text style={styles.heading}>Today and upcoming</Text>
      {active.slice(0, 3).map((job) => <View key={job.id} style={styles.job}><Text style={styles.jobName}>{job.serviceName}</Text><Text style={styles.jobMeta}>{job.status.replace('_', ' ')} · {new Date(job.scheduledAt).toLocaleString()}</Text></View>)}
      {!active.length ? <Text style={styles.empty}>No active jobs. Go online and check the Jobs tab.</Text> : null}
    </ScrollView>
  );
}

function Metric({ value, label }) { return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
const styles = StyleSheet.create({ page: { flexGrow: 1, backgroundColor: Colors.background, paddingTop: 55, padding: 18, paddingBottom: 100 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, greeting: { fontSize: 25, fontWeight: '900', marginBottom: 18 }, statusCard: { ...card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, onlineCard: { backgroundColor: Colors.successLight, borderColor: Colors.success }, statusTitle: { fontSize: 18, fontWeight: '900' }, statusHelp: { color: Colors.muted, marginTop: 4, fontSize: 12 }, notice: { ...card, marginTop: 12, backgroundColor: Colors.warningLight }, noticeTitle: { fontWeight: '900', color: Colors.warning }, noticeText: { color: Colors.muted, marginTop: 4, lineHeight: 18 }, metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }, metric: { ...card, width: '48%', flexGrow: 1, alignItems: 'center', paddingHorizontal: 6 }, metricValue: { fontSize: 20, fontWeight: '900', color: Colors.secondary }, metricLabel: { fontSize: 10, color: Colors.muted, marginTop: 3, textAlign: 'center' }, heading: { fontSize: 18, fontWeight: '900', marginTop: 24, marginBottom: 10 }, job: { ...card, marginBottom: 8 }, jobName: { fontWeight: '900' }, jobMeta: { color: Colors.muted, fontSize: 12, marginTop: 5 }, empty: { color: Colors.muted, backgroundColor: Colors.white, borderRadius: 12, padding: 20, textAlign: 'center' } });
