import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { theme } from '../theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

export function SkeletonHomeScreen() {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Header Bar Skeleton */}
      <View style={styles.topRow}>
        <Animated.View style={[styles.skeletonBlock, { width: 110, height: 32, opacity: opacityAnim }]} />
        <Animated.View style={[styles.skeletonBlock, { width: 90, height: 28, borderRadius: 14, opacity: opacityAnim }]} />
      </View>

      {/* Location Selector Skeleton */}
      <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 48, borderRadius: 16, marginVertical: 10, opacity: opacityAnim }]} />

      {/* Search Bar Skeleton */}
      <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 44, borderRadius: 14, marginBottom: 14, opacity: opacityAnim }]} />

      {/* Category Icons Row Skeleton */}
      <View style={styles.categoriesRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={{ alignItems: 'center', gap: 6 }}>
            <Animated.View style={[styles.skeletonBlock, { width: 52, height: 52, borderRadius: 26, opacity: opacityAnim }]} />
            <Animated.View style={[styles.skeletonBlock, { width: 42, height: 10, opacity: opacityAnim }]} />
          </View>
        ))}
      </View>

      {/* Featured Section Heading Skeleton */}
      <Animated.View style={[styles.skeletonBlock, { width: 160, height: 14, marginTop: 18, marginBottom: 12, opacity: opacityAnim }]} />

      {/* Featured Cards Row Skeleton */}
      <View style={styles.cardsRow}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.featuredCardSkeleton}>
            <Animated.View style={[styles.skeletonBlock, { width: 34, height: 34, borderRadius: 12, opacity: opacityAnim }]} />
            <Animated.View style={[styles.skeletonBlock, { width: 60, height: 32, marginTop: 12, opacity: opacityAnim }]} />
            <Animated.View style={[styles.skeletonBlock, { width: 100, height: 12, marginTop: 8, opacity: opacityAnim }]} />
            <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 32, borderRadius: 16, marginTop: 14, opacity: opacityAnim }]} />
          </View>
        ))}
      </View>

      {/* Grid Heading Skeleton */}
      <Animated.View style={[styles.skeletonBlock, { width: 140, height: 14, marginTop: 24, marginBottom: 12, opacity: opacityAnim }]} />

      {/* Grid Cards Skeleton */}
      <View style={styles.gridRow}>
        {[1, 2].map((i) => (
          <View key={i} style={[styles.gridCardSkeleton, { width: COLUMN_WIDTH }]}>
            <Animated.View style={[styles.skeletonBlock, { width: 30, height: 30, borderRadius: 10, opacity: opacityAnim }]} />
            <Animated.View style={[styles.skeletonBlock, { width: '80%', height: 14, marginTop: 10, opacity: opacityAnim }]} />
            <Animated.View style={[styles.skeletonBlock, { width: '50%', height: 10, marginTop: 6, opacity: opacityAnim }]} />
            <Animated.View style={[styles.skeletonBlock, { width: '100%', height: 28, borderRadius: 14, marginTop: 12, opacity: opacityAnim }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skeletonBlock: {
    backgroundColor: '#EFE7DC',
    borderRadius: 8,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featuredCardSkeleton: {
    width: 165,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCardSkeleton: {
    height: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE7DC',
  },
});
