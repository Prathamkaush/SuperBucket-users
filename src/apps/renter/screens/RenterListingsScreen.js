import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RenterHeader from '../components/RenterHeader';
import SpaceCard from '../components/SpaceCard';
import { getMyProperties, normalizeSpace } from '../services/properties';
import { Colors, FontSize, Radius, Spacing } from '../theme/theme';

const FILTERS = ['All', 'Rent', 'Sell', 'Live', 'Review', 'Rejected'];

export default function RenterListingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadListings = useCallback(async () => {
    try {
      const data = await getMyProperties();
      setSpaces(data);
    } catch (error) {
      console.log('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadListings();
    }, [loadListings])
  );

  const filteredSpaces = spaces.filter((space) => {
    if (activeFilter === 'All') return true;
    const filter = activeFilter.toUpperCase();
    return (
      space.mode === filter ||
      space.status === filter
    );
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <RenterHeader
        title="Listings"
        subtitle="Spaces available for rent or selling."
        action={(
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddSpace')}>
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        )}
      />

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
          {filteredSpaces.length > 0 ? (
            filteredSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={normalizeSpace(space)}
                onPress={() => navigation.navigate('SpaceDetail', { space })}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No listings match the selected filter.</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  chipTextActive: {
    color: Colors.white,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 110,
    gap: Spacing.lg,
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
