import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSalons } from '../../src/api/salons';
import { apiClient } from '../../src/api/client';
import { theme } from '../../src/theme';
import { SneprLogo } from '../../src/components/SneprLogo';
import { SkeletonHomeScreen } from '../../src/components/SkeletonHomeScreen';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

type FilterType = 'all' | 'shortest' | 'top' | 'available';

interface ActiveQueue {
  salonName: string;
  position: number;
  waitTime: number;
  status: string;
}

// ─── Haversine Distance Calculation ───
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

export default function ExploreScreen() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState('Patia, Bhubaneswar');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 20.3533,
    lng: 85.8266,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any | null>(null);
  const [activeQueue, setActiveQueue] = useState<ActiveQueue | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const localities = [
    'Patia, Bhubaneswar',
    'Silicon Institute, Bhubaneswar',
    'KIIT Square, Bhubaneswar',
    'Saheed Nagar, Bhubaneswar',
    'Jaydev Vihar, Bhubaneswar',
    'Janpath, Bhubaneswar'
  ];

  // Live Database Fetch
  const { data: dbSalons, isLoading, refetch } = useQuery({
    queryKey: ['salons'],
    queryFn: getSalons,
    refetchInterval: 10000,
  });

  // Join Queue Mutation
  const joinQueueMutation = useMutation({
    mutationFn: async (salonId: number) => {
      const res = await apiClient.post('/queue/join', { salonId });
      return res.data;
    },
    onSuccess: (data, salonId) => {
      const targetSalon = salonList.find((s: any) => s.id === salonId);
      setActiveQueue({
        salonName: targetSalon?.name || 'Salon',
        position: data.position || 1,
        waitTime: data.estimatedWait || 0,
        status: 'Waiting',
      });
      setSelectedSalon(null);
      queryClient.invalidateQueries({ queryKey: ['salons'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to join queue');
    },
  });

  // Real Reverse Geocoding Location Access Handler
  const requestLocation = async () => {
    setIsLocating(true);
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserCoords({ lat, lng });

            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
              const data = await res.json();
              const area = data.address?.suburb || data.address?.neighbourhood || data.address?.road || data.address?.city_district || data.address?.city || 'Bhubaneswar';
              setLocationName(`${area}, Bhubaneswar`);
            } catch {
              setLocationName('Patia, Bhubaneswar');
            }
            setIsLocating(false);
          },
          () => {
            setLocationName('Patia, Bhubaneswar');
            setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        const Location = require('expo-location');
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let loc = await Location.getCurrentPositionAsync({});
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          setUserCoords({ lat, lng });

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const area = data.address?.suburb || data.address?.neighbourhood || data.address?.road || data.address?.city_district || data.address?.city || 'Bhubaneswar';
            setLocationName(`${area}, Bhubaneswar`);
          } catch {
            setLocationName('Patia, Bhubaneswar');
          }
        } else {
          setLocationName('Patia, Bhubaneswar');
        }
        setIsLocating(false);
      }
    } catch (e) {
      setLocationName('Patia, Bhubaneswar');
      setIsLocating(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Compute live distances for database salons
  const salonList = (dbSalons || []).map((s: any) => {
    let distanceKm: number | null = null;
    if (userCoords && s.latitude && s.longitude) {
      distanceKm = calculateDistanceKm(userCoords.lat, userCoords.lng, parseFloat(s.latitude), parseFloat(s.longitude));
    }
    return {
      ...s,
      distanceKm,
      formattedDistance: distanceKm !== null ? formatDistance(distanceKm) : 'Nearby',
    };
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'haircut', name: 'Haircut' },
    { id: 'beard', name: 'Beard Trim' },
    { id: 'facial', name: 'Facial & Spa' },
    { id: 'color', name: 'Hair Color' },
    { id: 'styling', name: 'Styling' },
  ];

  const filteredSalons = salonList.filter((s: any) => {
    if (searchQuery) {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (
      activeCategory !== 'All' &&
      s.category &&
      !s.category.toLowerCase().includes(activeCategory.toLowerCase()) &&
      !s.name.toLowerCase().includes(activeCategory.toLowerCase())
    ) {
      return false;
    }
    if (activeFilter === 'available') return s.queueStatus === 'available';
    if (activeFilter === 'shortest') return s.waitTime <= 15;
    return true;
  });

  filteredSalons.sort((a: any, b: any) => {
    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }
    return a.waitTime - b.waitTime;
  });

  const featuredSalons = [...salonList].sort((a: any, b: any) => a.waitTime - b.waitTime).slice(0, 4);

  if (isLoading) {
    return <SkeletonHomeScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* ─── Top Brand & ETA Header Bar ─── */}
        <View style={styles.topBrandHeader}>
          <SneprLogo fontSize={34} />

          {/* Quick ETA Badge */}
          <View style={styles.etaPill}>
            <View>
              <Text style={styles.etaTime}>LIVE QUEUES</Text>
              <Text style={styles.etaLabel}>{salonList.length} SALONS</Text>
            </View>
          </View>
        </View>

        {/* ─── Location Bar ─── */}
        <View style={styles.locationBarContainer}>
          <TouchableOpacity style={styles.locationSelectorFull} onPress={() => setLocationModalVisible(true)} activeOpacity={0.8}>
            <View style={styles.locationPinBadge}>
              <Text style={styles.pinIcon}>LOC</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.locationTitleRow}>
                <Text style={styles.locationTitle}>DELIVERING TO</Text>
                <Text style={styles.locationArrow}>▾</Text>
              </View>
              {isLocating ? (
                <Text style={styles.locationAddress}>Locating position...</Text>
              ) : (
                <Text style={styles.locationAddress} numberOfLines={1}>{locationName}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* ─── Search Bar ─── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search salons, services, categories..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── Live Queue Status Ticker ─── */}
        <View style={styles.tickerBanner}>
          <View style={styles.tickerLiveDot} />
          <Text style={styles.tickerText}>
            <Text style={styles.tickerBold}>Real-time chair updates</Text> • {locationName}
          </Text>
        </View>

        {/* ─── Quick Service Category Grid ─── */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPillCard,
                  activeCategory === cat.name && styles.categoryPillActive,
                ]}
                onPress={() => setActiveCategory(cat.name)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryName,
                    activeCategory === cat.name && styles.categoryNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Filter Chips ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
              All Salons ({salonList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'shortest' && styles.filterPillActive]}
            onPress={() => setActiveFilter('shortest')}
          >
            <Text style={[styles.filterText, activeFilter === 'shortest' && styles.filterTextActive]}>
              Shortest Wait
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'available' && styles.filterPillActive]}
            onPress={() => setActiveFilter('available')}
          >
            <Text style={[styles.filterText, activeFilter === 'available' && styles.filterTextActive]}>
              Available Now
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ─── Section: SHORTEST WAIT NEAR YOU ─── */}
        {featuredSalons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SHORTEST WAIT NEAR YOU</Text>
              <View style={styles.sectionDot} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            >
              {featuredSalons.map((item: any) => (
                <View key={item.id} style={styles.featuredCard}>
                  <TouchableOpacity onPress={() => setSelectedSalon(item)} activeOpacity={0.85}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.initialAvatar}>
                        <Text style={styles.initialText}>{item.name[0]}</Text>
                      </View>
                      <View style={styles.availabilityBadge}>
                        <View style={styles.badgeDot} />
                        <Text style={styles.badgeText}>{item.queueStatus || 'Available'}</Text>
                      </View>
                    </View>

                    <Text style={styles.waitTimeValue}>{item.waitTime}</Text>
                    <Text style={styles.waitTimeLabel}>min wait • {item.formattedDistance}</Text>

                    <Text style={styles.featuredSalonName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.featuredSubText} numberOfLines={1}>
                      {item.category || 'Salon'} · {item.rating || '4.8'} ★
                    </Text>

                    <Text style={styles.liveQueueSizeText}>
                      {item.waitingCount} waiting
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.oneTapBtn}
                    onPress={() => joinQueueMutation.mutate(item.id)}
                    disabled={joinQueueMutation.isPending}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.oneTapBtnText}>
                      {joinQueueMutation.isPending ? 'JOINING...' : 'JOIN QUEUE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Section: ALL SALONS NEAR YOU (2-Column Grid) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ALL SALONS NEAR YOU</Text>
            <Text style={styles.sectionCount}>{filteredSalons.length} Salons</Text>
          </View>

          {filteredSalons.length === 0 ? (
            <View style={{ padding: 30, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>No salons match your search or filter.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredSalons.map((item: any) => (
                <View key={item.id} style={styles.gridCard}>
                  <TouchableOpacity onPress={() => setSelectedSalon(item)} activeOpacity={0.85}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.initialAvatar}>
                        <Text style={styles.initialText}>{item.name[0]}</Text>
                      </View>
                      <View style={styles.statusDotIndicator} />
                    </View>

                    <Text style={styles.gridSalonName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.gridCategory} numberOfLines={1}>
                      {item.category || 'Salon'} • {item.formattedDistance}
                    </Text>

                    <View style={styles.gridFooter}>
                      <Text style={styles.gridWaitTime}>
                        <Text style={styles.gridWaitBold}>{item.waitTime}</Text> min
                      </Text>
                      <Text style={styles.gridRating}>{item.rating || '4.8'} ★</Text>
                    </View>

                    <Text style={styles.gridQueueCount}>
                      {item.waitingCount} waiting
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.gridOneTapBtn}
                    onPress={() => joinQueueMutation.mutate(item.id)}
                    disabled={joinQueueMutation.isPending}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.gridOneTapText}>
                      {joinQueueMutation.isPending ? 'Joining...' : 'Join Queue'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: activeQueue ? 120 : 40 }} />
      </ScrollView>

      {/* ─── Persistent Active Queue Bottom Bar ─── */}
      {activeQueue && (
        <View style={styles.floatingActiveBar}>
          <View style={styles.activeBarLeft}>
            <View style={styles.activeBarPulse} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBarTitle} numberOfLines={1}>
                Queue Confirmed • {activeQueue.salonName}
              </Text>
              <Text style={styles.activeBarSub}>
                Position #{activeQueue.position} • Est. Walk-in in {activeQueue.waitTime} mins
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cancelQueueBtn}
            onPress={() => setActiveQueue(null)}
          >
            <Text style={styles.cancelQueueText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Salon Detail Modal ─── */}
      <Modal
        visible={!!selectedSalon}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSalon(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSalon && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.initialAvatarLarge}>
                    <Text style={styles.initialTextLarge}>{selectedSalon.name[0]}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSalon(null)}>
                    <Text style={styles.closeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedSalon.name}</Text>
                <Text style={styles.modalAddress}>{selectedSalon.address || 'Address not listed'}</Text>
                <Text style={styles.modalCategory}>
                  {selectedSalon.category || 'Salon'} • {selectedSalon.rating || '4.8'} ★ • {selectedSalon.formattedDistance}
                </Text>

                <View style={styles.modalStatsBox}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Live Wait Time</Text>
                    <Text style={styles.modalStatVal}>{selectedSalon.waitTime} min</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Queue Size</Text>
                    <Text style={styles.modalStatVal}>{selectedSalon.waitingCount} waiting</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatLabel}>Live Distance</Text>
                    <Text style={styles.modalStatVal}>{selectedSalon.formattedDistance}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.joinQueueBtn}
                  activeOpacity={0.88}
                  onPress={() => joinQueueMutation.mutate(selectedSalon.id)}
                  disabled={joinQueueMutation.isPending}
                >
                  <Text style={styles.joinQueueText}>
                    {joinQueueMutation.isPending ? 'Joining Queue...' : 'Join Live Queue Now'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── Location Selector Modal ─── */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Location</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                padding: 14,
                borderRadius: 14,
                marginBottom: 16,
                alignItems: 'center',
              }}
              onPress={() => {
                setLocationModalVisible(false);
                requestLocation();
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFF' }}>
                Use Current GPS Location
              </Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 8, letterSpacing: 0.5 }}>
              LOCALITIES IN BHUBANESWAR
            </Text>

            {localities.map((item) => (
              <TouchableOpacity
                key={item}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F5EDE4',
                }}
                onPress={() => {
                  setLocationName(item);
                  setLocationModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.text }}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBrandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 4,
  },
  locationBarContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: 4,
    marginBottom: 6,
  },
  locationSelectorFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  locationPinBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinIcon: {
    fontSize: 9,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  locationArrow: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  etaPill: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
  },
  etaTime: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 12,
  },
  etaLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: '#F5EDE4',
    letterSpacing: 0.4,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginVertical: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  clearIcon: {
    fontSize: 12,
    color: theme.colors.textMuted,
    padding: 4,
  },
  tickerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE4',
    marginHorizontal: theme.spacing.lg,
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.md,
    gap: 8,
  },
  tickerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  tickerText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  tickerBold: {
    fontWeight: '800',
    color: theme.colors.primary,
  },
  categoriesSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  categoryPillCard: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  categoryNameActive: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  carouselContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  featuredCard: {
    width: 175,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  initialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EDE4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.full,
    gap: 4,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },
  waitTimeValue: {
    fontSize: 30,
    fontWeight: '900',
    color: theme.colors.text,
    lineHeight: 32,
  },
  waitTimeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 6,
  },
  featuredSalonName: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  featuredSubText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  liveQueueSizeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 4,
    marginBottom: 10,
  },
  oneTapBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  oneTapBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  gridCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusDotIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.primary,
  },
  gridSalonName: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 8,
    minHeight: 34,
  },
  gridCategory: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: '#F5EDE4',
    paddingTop: 8,
    marginBottom: 4,
  },
  gridWaitTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  gridWaitBold: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.text,
  },
  gridRating: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  gridQueueCount: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  gridOneTapBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  gridOneTapText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  floatingActiveBar: {
    position: 'absolute',
    bottom: 12,
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.text,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activeBarPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  activeBarTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  activeBarSub: {
    color: '#D1C4B8',
    fontSize: 11,
    marginTop: 1,
  },
  cancelQueueBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
  },
  cancelQueueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  initialAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialTextLarge: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  closeBtn: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  modalAddress: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  modalCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 2,
    marginBottom: theme.spacing.lg,
  },
  modalStatsBox: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: theme.spacing.xl,
  },
  modalStat: {
    flex: 1,
  },
  modalStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  modalStatVal: {
    fontSize: 17,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: 2,
  },
  joinQueueBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinQueueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
});
