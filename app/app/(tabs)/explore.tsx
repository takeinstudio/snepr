import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../src/theme';
import { SymbolView } from 'expo-symbols';

const API_BASE_URL = 'http://localhost:3001';

interface Salon {
  id: string;
  name: string;
  category: string;
  rating: string | number;
  address: string;
  queueStatus: 'available' | 'finishing' | 'busy';
  waitTime: number;
  waitingCount: number;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

const CATEGORIES = [
  'All',
  'Haircut',
  'Beard Trim',
  'Facial & Spa',
  'Hair Color',
  'Styling',
  'Premium',
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'wait' | 'rating'>('wait');

  const queryClient = useQueryClient();

  const { data: salons = [], isLoading, refetch } = useQuery<Salon[]>({
    queryKey: ['salons-explore'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/salons`);
      if (!res.ok) throw new Error('Failed to fetch salons');
      return res.json();
    },
  });

  const joinQueueMutation = useMutation({
    mutationFn: async (salonId: string) => {
      const res = await fetch(`${API_BASE_URL}/api/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId }),
      });
      if (!res.ok) throw new Error('Failed to join queue');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salons-explore'] });
      queryClient.invalidateQueries({ queryKey: ['salons'] });
      queryClient.invalidateQueries({ queryKey: ['active-queue'] });
    },
  });

  const filteredSalons = salons
    .filter((salon) => {
      const matchesSearch =
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'All'
          ? true
          : salon.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'wait') return a.waitTime - b.waitTime;
      return Number(b.rating) - Number(a.rating);
    });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

      {/* Header & Search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Salons</Text>
        <Text style={styles.headerSubtitle}>Discover chairs & book in seconds</Text>

        <View style={styles.searchBarContainer}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={theme.colors.textMuted}
            size={18}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search salon, haircut, facial..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                tintColor={theme.colors.textMuted}
                size={18}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Categories */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoryListContent}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sort Bar */}
      <View style={styles.sortContainer}>
        <Text style={styles.resultCount}>
          {filteredSalons.length} {filteredSalons.length === 1 ? 'Salon' : 'Salons'} Available
        </Text>
        <View style={styles.sortToggleRow}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'wait' && styles.sortBtnActive]}
            onPress={() => setSortBy('wait')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'wait' && styles.sortBtnTextActive]}>
              Fastest Wait
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]}
            onPress={() => setSortBy('rating')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'rating' && styles.sortBtnTextActive]}>
              Top Rated
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSalons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.salonImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                  </View>
                )}

                <View style={styles.cardInfo}>
                  <Text style={styles.salonName}>{item.name}</Text>
                  <Text style={styles.salonCategory}>
                    {item.category} • ⭐ {item.rating}
                  </Text>
                  <Text style={styles.salonAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>

                <View style={styles.waitBadge}>
                  <Text style={styles.waitBadgeNumber}>
                    {item.waitTime === 0 ? 'NOW' : `${item.waitTime}m`}
                  </Text>
                  <Text style={styles.waitBadgeLabel}>
                    {item.waitTime === 0 ? 'Ready' : 'Wait'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.queueText}>
                  {item.waitingCount === 0
                    ? 'No queue right now'
                    : `${item.waitingCount} waiting in line`}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.joinBtn,
                    item.waitTime === 0 && styles.joinBtnInstant,
                  ]}
                  onPress={() => joinQueueMutation.mutate(item.id)}
                  disabled={joinQueueMutation.isPending}
                  activeOpacity={0.85}
                >
                  <Text style={styles.joinBtnText}>
                    {joinQueueMutation.isPending
                      ? 'Joining...'
                      : item.waitTime === 0
                      ? 'JOIN NOW'
                      : 'JOIN QUEUE'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Salons Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or category filter.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FAF7F2',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    padding: 0,
  },
  filterSection: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E8DC',
  },
  categoryListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#EFE7DC',
    borderRadius: 12,
    padding: 2,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sortBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  sortBtnTextActive: {
    color: theme.colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  salonImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  cardInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  salonCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  salonAddress: {
    fontSize: 11,
    color: '#9C9086',
    marginTop: 2,
  },
  waitBadge: {
    backgroundColor: '#F5EDE4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 54,
  },
  waitBadgeNumber: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  waitBadgeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5EDE4',
  },
  queueText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  joinBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinBtnInstant: {
    backgroundColor: '#2E7D32',
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});
