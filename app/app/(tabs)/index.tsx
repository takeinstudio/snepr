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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSalons } from '../../src/api/salons';
import { apiClient } from '../../src/api/client';
import { theme } from '../../src/theme';
import { SneprLogo } from '../../src/components/SneprLogo';
import { SkeletonHomeScreen } from '../../src/components/SkeletonHomeScreen';
import { SymbolView } from 'expo-symbols';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

const API_BASE_URL = 'http://localhost:3001';

interface ActiveQueueData {
  id: string;
  tokenNumber: number;
  salonName: string;
  address: string;
  position: number;
  waitTime: number;
  status: string;
}

// ─── Haversine Distance Calculation ───
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

const SEARCH_PLACEHOLDERS = [
  'Search "Haircut"',
  'Search "Beard Trim"',
  'Search "Facial & Spa"',
  'Search "Unisex Salon"',
  'Search "Premium Salon"',
];

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [locationName, setLocationName] = useState('Patia, Bhubaneswar');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 20.3533,
    lng: 85.8266,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const localities = [
    'Patia, Bhubaneswar',
    'Silicon Institute, Bhubaneswar',
    'KIIT Square, Bhubaneswar',
    'Saheed Nagar, Bhubaneswar',
    'Jaydev Vihar, Bhubaneswar',
    'Janpath, Bhubaneswar',
  ];

  // Rotating Search Placeholder Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Live Database Salons Fetch
  const { data: dbSalons, isLoading, refetch } = useQuery({
    queryKey: ['salons'],
    queryFn: getSalons,
    refetchInterval: 10000,
  });

  // Active Queue Status Fetch
  const { data: activeQueueResponse } = useQuery<{ activeQueue: ActiveQueueData | null }>({
    queryKey: ['active-queue'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/user/active-queue`);
      if (!res.ok) return { activeQueue: null };
      return res.json();
    },
    refetchInterval: 5000,
  });

  const activeQueue = activeQueueResponse?.activeQueue;

  // Join Queue Mutation
  const joinQueueMutation = useMutation({
    mutationFn: async (salonId: number) => {
      const res = await apiClient.post('/queue/join', { salonId });
      return res.data;
    },
    onSuccess: () => {
      setSelectedSalon(null);
      queryClient.invalidateQueries({ queryKey: ['salons'] });
      queryClient.invalidateQueries({ queryKey: ['active-queue'] });
      router.push('/bookings');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to join queue');
    },
  });

  // High Accuracy Location Access Handler
  const requestLocation = async () => {
    setIsLocating(true);
    try {
      if (Platform.OS !== 'web') {
        const Location = require('expo-location');
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            const hasServices = await Location.hasServicesEnabledAsync();
            if (!hasServices) {
              await Location.enableNetworkProviderAsync();
            }
          } catch {}

          let loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          setUserCoords({ lat, lng });

          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            const data = await res.json();
            const area = data.locality || data.city || data.principalSubdivision || 'Bhubaneswar';
            setLocationName(`${area}, Bhubaneswar`);
          } catch {
            setLocationName('Patia, Bhubaneswar');
          }
        } else {
          setLocationName('Patia, Bhubaneswar');
        }
        setIsLocating(false);
      } else {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setUserCoords({ lat, lng });

              try {
                const res = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
                );
                const data = await res.json();
                const area = data.locality || data.city || data.principalSubdivision || 'Bhubaneswar';
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
        }
      }
    } catch (e) {
      setLocationName('Patia, Bhubaneswar');
      setIsLocating(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Compute live distance & formatting
  const salonList = (dbSalons || []).map((s: any) => {
    let distanceKm: number | null = null;
    if (userCoords && s.latitude && s.longitude) {
      distanceKm = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        parseFloat(s.latitude),
        parseFloat(s.longitude)
      );
    }
    return {
      ...s,
      distanceKm,
      formattedDistance: distanceKm !== null ? formatDistance(distanceKm) : 'Nearby',
    };
  });

  // Data-Driven Discovery Lists
  const fastestSalons = [...salonList].sort((a: any, b: any) => a.waitTime - b.waitTime).slice(0, 5);
  const availableNowSalons = salonList.filter((s: any) => s.waitTime === 0);
  const topRatedSalons = salonList.filter((s: any) => Number(s.rating) >= 4.7);
  const premiumSalons = salonList.filter((s: any) =>
    ['luxury', 'premium'].some((k) => (s.category || '').toLowerCase().includes(k))
  );

  const categories = [
    { id: 'haircut', name: 'Haircut', icon: 'scissors' },
    { id: 'beard', name: 'Beard Trim', icon: 'comb' },
    { id: 'facial', name: 'Facial & Spa', icon: 'sparkles' },
    { id: 'color', name: 'Hair Color', icon: 'paintpalette' },
    { id: 'styling', name: 'Styling', icon: 'wand.and.stars' },
    { id: 'premium', name: 'Premium', icon: 'crown' },
  ];

  if (isLoading) {
    return <SkeletonHomeScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ─── Compact Header ─── */}
        <View style={styles.headerRow}>
          <SneprLogo fontSize={30} />

          {/* Location Selector Pill */}
          <TouchableOpacity
            style={styles.locationPill}
            onPress={() => setLocationModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.locationPillLabel}>SALONS NEAR</Text>
            <View style={styles.locationPillNameRow}>
              <Text style={styles.locationPillName} numberOfLines={1}>
                {isLocating ? 'Locating...' : locationName.split(',')[0]}
              </Text>
              <Text style={styles.locationPillArrow}>▾</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => refetch()}>
            <SymbolView
              name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
              tintColor={theme.colors.primary}
              size={18}
            />
          </TouchableOpacity>
        </View>

        {/* ─── Active Queue Priority Card ─── */}
        {activeQueue && (
          <TouchableOpacity
            style={styles.activeQueueCard}
            onPress={() => router.push('/bookings')}
            activeOpacity={0.9}
          >
            <View style={styles.activeQueueHeader}>
              <View style={styles.livePulseDot} />
              <Text style={styles.activeQueueTitle}>YOUR LIVE QUEUE</Text>
              <Text style={styles.activeQueueBadge}>Position #{activeQueue.position}</Text>
            </View>

            <View style={styles.activeQueueBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeQueueSalonName}>{activeQueue.salonName}</Text>
                <Text style={styles.activeQueueSub}>Token #{activeQueue.tokenNumber} • {activeQueue.address}</Text>
              </View>
              <View style={styles.activeQueueWaitBox}>
                <Text style={styles.activeQueueWaitTime}>~{activeQueue.waitTime}m</Text>
                <Text style={styles.activeQueueWaitLabel}>Est. Wait</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* ─── Contextual Search Bar ─── */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/explore')}
          activeOpacity={0.88}
        >
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={theme.colors.textMuted}
            size={18}
          />
          <Text style={styles.searchPlaceholder}>
            {SEARCH_PLACEHOLDERS[placeholderIndex]}
          </Text>
        </TouchableOpacity>

        {/* ─── Live Network Status Ticker ─── */}
        <View style={styles.liveTickerBanner}>
          <View style={styles.tickerGreenDot} />
          <Text style={styles.liveTickerText}>
            <Text style={styles.tickerBold}>{salonList.length} salons live near you</Text> • Real-time chair updates
          </Text>
        </View>

        {/* ─── Service Category Grid ─── */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItemCard}
                onPress={() => router.push('/explore')}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconCircle}>
                  <Text style={styles.categoryIconText}>{cat.name.charAt(0)}</Text>
                </View>
                <Text style={styles.categoryItemLabel} numberOfLines={1}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Section: Get a Chair Fastest ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Get a chair fastest</Text>
              <Text style={styles.sectionSubtitle}>Lowest wait times available right now</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelfScrollContent}
          >
            {fastestSalons.map((item: any) => (
              <View key={item.id} style={styles.fastestCard}>
                <TouchableOpacity onPress={() => setSelectedSalon(item)} activeOpacity={0.85}>
                  <View style={styles.fastestCardTop}>
                    <View style={styles.initialAvatar}>
                      <Text style={styles.initialText}>{item.name[0]}</Text>
                    </View>
                    <View
                      style={[
                        styles.waitPillBadge,
                        item.waitTime === 0 ? styles.waitPillZero : styles.waitPillWait,
                      ]}
                    >
                      <Text
                        style={[
                          styles.waitPillText,
                          item.waitTime === 0 ? styles.waitPillTextZero : styles.waitPillTextWait,
                        ]}
                      >
                        {item.waitTime === 0 ? 'AVAILABLE NOW' : `${item.waitTime} MIN WAIT`}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.fastestSalonName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.fastestSubText} numberOfLines={1}>
                    {item.category || 'Salon'} · ⭐ {item.rating || '4.8'} · {item.formattedDistance}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.oneTapBtn,
                    item.waitTime === 0 && styles.oneTapBtnInstant,
                  ]}
                  onPress={() => joinQueueMutation.mutate(item.id)}
                  disabled={joinQueueMutation.isPending}
                  activeOpacity={0.88}
                >
                  <Text style={styles.oneTapBtnText}>
                    {joinQueueMutation.isPending
                      ? 'JOINING...'
                      : item.waitTime === 0
                      ? 'JOIN NOW'
                      : 'JOIN QUEUE'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ─── Shelf: Available Right Now ─── */}
        {availableNowSalons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Available Right Now</Text>
                <Text style={styles.sectionSubtitle}>Walk in with 0 wait time</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shelfScrollContent}
            >
              {availableNowSalons.map((item: any) => (
                <View key={item.id} style={styles.shelfCard}>
                  <TouchableOpacity onPress={() => setSelectedSalon(item)} activeOpacity={0.85}>
                    <View style={styles.shelfCardHeader}>
                      <View style={styles.initialAvatarSmall}>
                        <Text style={styles.initialTextSmall}>{item.name[0]}</Text>
                      </View>
                      <Text style={styles.readyTag}>READY</Text>
                    </View>

                    <Text style={styles.shelfSalonName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.shelfSalonSub} numberOfLines={1}>
                      {item.formattedDistance} • ⭐ {item.rating}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shelfJoinBtn}
                    onPress={() => joinQueueMutation.mutate(item.id)}
                    disabled={joinQueueMutation.isPending}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.shelfJoinBtnText}>JOIN NOW</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Shelf: Top Rated Near You ─── */}
        {topRatedSalons.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Top Rated Near You</Text>
                <Text style={styles.sectionSubtitle}>Highly rated by local customers</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shelfScrollContent}
            >
              {topRatedSalons.map((item: any) => (
                <View key={item.id} style={styles.shelfCard}>
                  <TouchableOpacity onPress={() => setSelectedSalon(item)} activeOpacity={0.85}>
                    <View style={styles.shelfCardHeader}>
                      <View style={styles.initialAvatarSmall}>
                        <Text style={styles.initialTextSmall}>{item.name[0]}</Text>
                      </View>
                      <Text style={styles.ratingBadge}>⭐ {item.rating}</Text>
                    </View>

                    <Text style={styles.shelfSalonName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.shelfSalonSub} numberOfLines={1}>
                      {item.waitTime} min wait • {item.formattedDistance}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shelfJoinBtn}
                    onPress={() => joinQueueMutation.mutate(item.id)}
                    disabled={joinQueueMutation.isPending}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.shelfJoinBtnText}>JOIN QUEUE</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── Section: All Salons Near You (Rapid Scanning Grid) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>All Salons Near You</Text>
              <Text style={styles.sectionSubtitle}>Discover all {salonList.length} verified salons</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {salonList.map((item: any) => (
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
                    <Text style={styles.gridRating}>⭐ {item.rating || '4.8'}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.gridOneTapBtn}
                  onPress={() => joinQueueMutation.mutate(item.id)}
                  disabled={joinQueueMutation.isPending}
                  activeOpacity={0.88}
                >
                  <Text style={styles.gridOneTapText} numberOfLines={1}>
                    {joinQueueMutation.isPending
                      ? 'Joining...'
                      : item.waitTime === 0
                      ? 'Join Now'
                      : 'Join Queue'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

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
                  {selectedSalon.category || 'Salon'} • ⭐ {selectedSalon.rating || '4.8'} • {selectedSalon.formattedDistance}
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
                  style={styles.joinQueueBtnModal}
                  activeOpacity={0.88}
                  onPress={() => joinQueueMutation.mutate(selectedSalon.id)}
                  disabled={joinQueueMutation.isPending}
                >
                  <Text style={styles.joinQueueTextModal}>
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
              <Text style={styles.modalTitle}>Select Salon Location</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.gpsButton}
              onPress={() => {
                setLocationModalVisible(false);
                requestLocation();
              }}
            >
              <Text style={styles.gpsButtonText}>
                Use Current GPS Location
              </Text>
            </TouchableOpacity>

            <Text style={styles.localityHeader}>
              LOCALITIES IN BHUBANESWAR
            </Text>

            {localities.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.localityRow}
                onPress={() => {
                  setLocationName(item);
                  setLocationModalVisible(false);
                }}
              >
                <Text style={styles.localityText}>{item}</Text>
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
    backgroundColor: '#FAF7F2',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#FAF7F2',
  },
  locationPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    maxWidth: 180,
  },
  locationPillLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  locationPillNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationPillName: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.text,
  },
  locationPillArrow: {
    fontSize: 10,
    color: theme.colors.primary,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeQueueCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  activeQueueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  activeQueueTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.8,
  },
  activeQueueBadge: {
    marginLeft: 'auto',
    fontSize: 10,
    fontWeight: '800',
    color: '#FAF7F2',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeQueueBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeQueueSalonName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  activeQueueSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  activeQueueWaitBox: {
    alignItems: 'flex-end',
  },
  activeQueueWaitTime: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  activeQueueWaitLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'uppercase',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  liveTickerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: '#F5EDE4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  tickerGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  liveTickerText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  tickerBold: {
    fontWeight: '800',
    color: theme.colors.text,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryItemCard: {
    alignItems: 'center',
    width: 72,
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIconText: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  categoryItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  shelfScrollContent: {
    paddingHorizontal: 20,
    gap: 14,
  },
  fastestCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'space-between',
  },
  fastestCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  initialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  waitPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  waitPillZero: {
    backgroundColor: '#E8F5E9',
  },
  waitPillWait: {
    backgroundColor: '#F5EDE4',
  },
  waitPillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  waitPillTextZero: {
    color: '#2E7D32',
  },
  waitPillTextWait: {
    color: theme.colors.primary,
  },
  fastestSalonName: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 2,
  },
  fastestSubText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  oneTapBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  oneTapBtnInstant: {
    backgroundColor: '#2E7D32',
  },
  oneTapBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  shelfCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'space-between',
  },
  shelfCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  initialAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialTextSmall: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  readyTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.text,
  },
  shelfSalonName: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  shelfSalonSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  shelfJoinBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  shelfJoinBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: COLUMN_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusDotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    marginBottom: 8,
  },
  gridWaitTime: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  gridWaitBold: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.text,
  },
  gridRating: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  gridOneTapBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  gridOneTapText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  initialAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5EDE4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialTextLarge: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  closeBtn: {
    fontSize: 18,
    color: theme.colors.textMuted,
    padding: 8,
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
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 4,
    marginBottom: 16,
  },
  modalStatsBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalStatVal: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.text,
    marginTop: 4,
  },
  joinQueueBtnModal: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  joinQueueTextModal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  gpsButton: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  gpsButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  localityHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  localityRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5EDE4',
  },
  localityText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
