import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import RenterHeader from '../components/RenterHeader';
import SpaceCard from '../components/SpaceCard';
import { spaces } from '../data/mockRenterData';
import { Colors, FontSize, Radius, Spacing } from '../theme/theme';

const FILTERS = ['All', 'Rent', 'Sell', 'Live', 'Review', 'Draft'];

export default function RenterListingsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSpaces = spaces.filter((space) => {
    if (activeFilter === 'All') return true;
    return space.mode === activeFilter || space.status === activeFilter;
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredSpaces.map((space) => (
          <SpaceCard
            key={space.id}
            space={space}
            onPress={() => navigation.navigate('SpaceDetail', { space })}
          />
        ))}
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
});
