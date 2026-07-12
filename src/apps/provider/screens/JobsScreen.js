import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { acceptJob, getAvailableJobs, getMyJobs, requestRevisit, updateJob } from '../services/provider';
import { Colors, card } from '../theme';

const nextAction = {
  ACCEPTED: ['EN_ROUTE', 'Start travel'],
  EN_ROUTE: ['IN_PROGRESS', 'Start work'],
};

export default function JobsScreen({ navigation }) {
  const [tab, setTab] = useState('available');
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpById, setOtpById] = useState({});

  const load = useCallback(async () => {
    try {
      const [availableJobs, myJobs] = await Promise.all([getAvailableJobs(), getMyJobs()]);
      setAvailable(availableJobs);
      setMine(myJobs);
    } catch (error) {
      Alert.alert('Could not load jobs', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const run = async (fn) => {
    try {
      await fn();
      await load();
    } catch (error) {
      Alert.alert('Could not update job', error.message);
    }
  };

  const markCustomerUnavailable = (job) => {
    Alert.alert(
      'Customer not available?',
      'This will notify the customer and admin that you reached the address but could not complete the service. The customer can accept a revisit request.',
      [
        { text: 'Cancel' },
        {
          text: 'Request revisit',
          onPress: () => run(() => requestRevisit(job.id, 'Customer was not available at the address')),
        },
      ],
    );
  };

  const list = tab === 'available' ? available : mine;

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Jobs</Text>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'available' && styles.tabActive]} onPress={() => setTab('available')}>
          <Text style={styles.tabText}>Nearby ({available.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'mine' && styles.tabActive]} onPress={() => setTab('mine')}>
          <Text style={styles.tabText}>My jobs ({mine.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
          {list.map((job) => (
            <View key={job.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.jobName}>{job.serviceName}</Text>
                <Text style={styles.earning}>Rs {Number(job.providerEarning).toFixed(0)}</Text>
              </View>
              <Text style={styles.meta}>{new Date(job.scheduledAt).toLocaleString()}</Text>
              <Text style={styles.address}>{job.address?.street}, {job.address?.city}, {job.address?.pincode}</Text>
              {job.customerNote ? <Text style={styles.note}>Note: {job.customerNote}</Text> : null}

              {tab === 'available' ? (
                <TouchableOpacity style={styles.primary} onPress={() => run(() => acceptJob(job.id))}>
                  <Text style={styles.primaryText}>Accept job</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.getParent()?.navigate('JobDetail', { jobId: job.id, job })}>
                    <Text style={styles.detailsText}>View customer & location details</Text>
                    <Feather name="chevron-right" size={17} color={Colors.secondary} />
                  </TouchableOpacity>
                  <Text style={styles.status}>{job.status.replace(/_/g, ' ')}</Text>
                  {job.revisitReason ? (
                    <View style={styles.revisitBox}>
                      <Text style={styles.revisitTitle}>Revisit request</Text>
                      <Text style={styles.revisitText}>{job.revisitReason}</Text>
                      {job.revisitAcceptedAt ? <Text style={styles.revisitText}>Customer accepted revisit.</Text> : null}
                    </View>
                  ) : null}
                  {job.status === 'CANCELLED' && job.cancellationReason ? (
                    <View style={styles.cancelBox}>
                      <Text style={styles.cancelTitle}>Cancellation reason</Text>
                      <Text style={styles.cancelText}>{job.cancellationReason}</Text>
                    </View>
                  ) : null}

                  {nextAction[job.status] ? (
                    <TouchableOpacity style={styles.primary} onPress={() => run(() => updateJob(job.id, nextAction[job.status][0]))}>
                      <Text style={styles.primaryText}>{nextAction[job.status][1]}</Text>
                    </TouchableOpacity>
                  ) : null}

                  {['EN_ROUTE', 'IN_PROGRESS'].includes(job.status) ? (
                    <TouchableOpacity style={styles.warningButton} onPress={() => markCustomerUnavailable(job)}>
                      <Text style={styles.warningText}>Customer not available</Text>
                    </TouchableOpacity>
                  ) : null}

                  {job.status === 'IN_PROGRESS' ? (
                    <View>
                      <TextInput
                        style={styles.otp}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholder="Customer completion OTP"
                        value={otpById[job.id] || ''}
                        onChangeText={(value) => setOtpById((all) => ({ ...all, [job.id]: value.replace(/\D/g, '') }))}
                      />
                      <TouchableOpacity style={styles.complete} onPress={() => run(() => updateJob(job.id, 'COMPLETED', otpById[job.id]))}>
                        <Text style={styles.primaryText}>Complete job</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {job.status === 'ACCEPTED' ? (
                    <TouchableOpacity style={styles.reject} onPress={() => run(() => updateJob(job.id, 'REJECTED'))}>
                      <Text style={styles.rejectText}>Release job</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </View>
          ))}
          {!list.length ? <Text style={styles.empty}>{tab === 'available' ? 'No nearby jobs right now. Make sure you are online.' : 'You have not accepted any jobs yet.'}</Text> : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background, paddingTop: 55 },
  title: { fontSize: 25, fontWeight: '900', paddingHorizontal: 18 },
  tabs: { flexDirection: 'row', padding: 18, gap: 8 },
  tab: { flex: 1, backgroundColor: Colors.white, padding: 12, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.secondaryLight, borderWidth: 1, borderColor: Colors.secondary },
  tabText: { fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 18, paddingBottom: 100, gap: 10 },
  card: { ...card },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  jobName: { fontSize: 17, fontWeight: '900', flex: 1 },
  earning: { color: Colors.success, fontSize: 18, fontWeight: '900' },
  meta: { color: Colors.secondary, fontWeight: '700', fontSize: 12, marginTop: 7 },
  address: { color: Colors.muted, lineHeight: 18, marginTop: 5 },
  note: { backgroundColor: Colors.warningLight, borderRadius: 8, padding: 9, marginTop: 8 },
  status: { fontWeight: '900', color: Colors.secondary, marginTop: 12 },
  detailsButton: { marginTop: 11, minHeight: 44, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors.secondaryLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailsText: { color: Colors.secondary, fontWeight: '900', fontSize: 12 },
  primary: { backgroundColor: Colors.primary, padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  complete: { backgroundColor: Colors.success, padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  primaryText: { color: Colors.white, fontWeight: '900' },
  warningButton: { backgroundColor: Colors.warningLight, padding: 13, borderRadius: 10, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: Colors.warning },
  warningText: { color: Colors.warning, fontWeight: '900' },
  revisitBox: { backgroundColor: Colors.warningLight, borderRadius: 10, padding: 11, marginTop: 10 },
  revisitTitle: { color: Colors.text, fontWeight: '900' },
  revisitText: { color: Colors.textSecondary, marginTop: 4, fontSize: 12 },
  cancelBox: { backgroundColor: Colors.gray50, borderRadius: 10, padding: 11, marginTop: 10, borderWidth: 1, borderColor: Colors.border },
  cancelTitle: { color: Colors.text, fontWeight: '900' },
  cancelText: { color: Colors.textSecondary, marginTop: 4, fontSize: 12 },
  otp: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 13, marginTop: 10 },
  reject: { alignItems: 'center', paddingTop: 12 },
  rejectText: { color: Colors.danger, fontWeight: '800' },
  empty: { color: Colors.muted, textAlign: 'center', padding: 35 },
});
