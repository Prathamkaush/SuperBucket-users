import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  PanResponder,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius, Shadow } from '../theme/theme';
import BackButton from '../components/BackButton';
import {
  getNotifications,
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notifications';

export default function NotificationsScreen({ navigation }) {
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await getNotifications();
      setNotifs(response.items || []);
      setUnreadCount(Number(response.unread || 0));
    } catch (e) {
      setError(e.message || 'Could not load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markAllRead = async () => {
    setNotifs((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    setUnreadCount(0);
    await markAllNotificationsRead().catch(() => undefined);
  };

  const openNotification = async (notif) => {
    if (!notif.readAt) {
      setNotifs((items) => items.map((item) => (
        item.id === notif.id ? { ...item, readAt: new Date().toISOString() } : item
      )));
      setUnreadCount((value) => Math.max(0, value - 1));
      markNotificationRead(notif.id).catch(() => undefined);
    }
  };

  const removeNotification = (notif) => {
    Alert.alert('Delete notification?', 'This notification will be removed from your inbox.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setNotifs((items) => items.filter((item) => item.id !== notif.id));
          if (!notif.readAt) setUnreadCount((value) => Math.max(0, value - 1));
          try {
            await deleteNotification(notif.id);
          } catch (e) {
            Alert.alert('Could not delete notification', e.message || 'Please try again.');
            load(true);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.primaryLight} />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load(true);
            }}
            tintColor={Colors.primary}
          />
        )}
      >
        {unreadCount > 0 && <Text style={styles.sectionLabel}>NEW</Text>}

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.stateText}>Loading notifications...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Could not load</Text>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity onPress={() => load()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!loading && !error && !notifs.length ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>No notifications yet</Text>
            <Text style={styles.stateText}>Order, wallet, property, and offer updates will appear here.</Text>
          </View>
        ) : null}

        {notifs.map((notif) => {
          const unread = !notif.readAt;
          const accent = accentForType(notif.type);
          return (
            <SwipeDeleteNotification
              key={notif.id}
              style={[
                styles.notifCard,
                unread && styles.notifCardUnread,
                unread && { borderLeftColor: accent },
              ]}
              activeOpacity={0.8}
              onPress={() => openNotification(notif)}
              onDelete={() => removeNotification(notif)}
            >
              <View style={[styles.notifIconWrap, { backgroundColor: `${accent}18` }]}>
                <Text style={[styles.notifIcon, { color: accent }]}>{iconForType(notif.type)}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitle, unread && { color: Colors.textPrimary }]}>
                    {notif.title}
                  </Text>
                  {unread && <View style={[styles.unreadDot, { backgroundColor: accent }]} />}
                </View>
                <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                {notif.imageUrl ? (
                  <Image source={{ uri: notif.imageUrl }} style={styles.notifImage} resizeMode="cover" />
                ) : null}
                <Text style={styles.notifTime}>{formatTime(notif.createdAt)}</Text>
              </View>
            </SwipeDeleteNotification>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SwipeDeleteNotification({ children, style, onPress, onDelete }) {
  const translateX = React.useRef(new Animated.Value(0)).current;
  const panResponder = React.useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) => gesture.dx > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderMove: (_event, gesture) => translateX.setValue(Math.min(gesture.dx, 120)),
    onPanResponderRelease: (_event, gesture) => {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      if (gesture.dx >= 95) onDelete();
    },
    onPanResponderTerminate: () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start(),
  }), [onDelete, translateX]);

  return (
    <View style={styles.swipeWrap}>
      <View style={styles.swipeDelete}><Text style={styles.swipeDeleteText}>DELETE</Text></View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <TouchableOpacity style={style} activeOpacity={0.8} onPress={onPress}>{children}</TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function accentForType(type = '') {
  if (type.includes('ORDER')) return Colors.primary;
  if (type.includes('DELIVERY')) return '#F59E0B';
  if (type.includes('WALLET')) return Colors.success;
  if (type.includes('PROPERTY')) return Colors.secondary;
  return '#E65C00';
}

function iconForType(type = '') {
  if (type.includes('ORDER')) return 'O';
  if (type.includes('DELIVERY')) return 'D';
  if (type.includes('WALLET')) return 'W';
  if (type.includes('PROPERTY')) return 'P';
  return 'N';
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  unreadBadge: {
    marginTop: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  unreadBadgeText: { fontSize: 9, color: Colors.white, fontWeight: '800' },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#F3B9BE',
  },
  markAllText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  sectionLabel: {
    fontSize: FontSize.xxs,
    fontWeight: '800',
    color: Colors.textMuted,
    marginLeft: Spacing.lg,
    marginBottom: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginBottom: 10,
    borderRadius: Radius.lg,
    padding: 14,
    ...Shadow.sm,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    backgroundColor: '#FDFCFC',
  },
  swipeWrap: { overflow: 'hidden' },
  swipeDelete: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    paddingLeft: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: 10,
    borderRadius: Radius.lg,
  },
  swipeDeleteText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '900' },
  notifIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifIcon: { fontSize: 18, fontWeight: '900' },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: 8,
    flexShrink: 0,
  },
  notifBody: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notifImage: {
    width: '100%',
    height: 118,
    borderRadius: Radius.md,
    marginTop: 10,
    backgroundColor: Colors.gray100,
  },
  notifTime: {
    fontSize: FontSize.xxs,
    color: Colors.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: 28,
    padding: 24,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  stateTitle: { fontSize: FontSize.md, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  stateText: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, marginTop: 8 },
  retryBtn: { marginTop: 14, backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.sm },
  retryText: { color: Colors.white, fontWeight: '800', fontSize: FontSize.xs },
});
