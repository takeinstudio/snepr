import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { theme } from '../theme';
import { SneprLogo } from './SneprLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.78)).current;
  const pulseRingScale = useRef(new Animated.Value(0.8)).current;
  const pulseRingOpacity = useRef(new Animated.Value(0.7)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse ring loop animation
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseRingScale, {
          toValue: 1.35,
          duration: 1600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(pulseRingOpacity, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ])
    ).start();

    // Main entrance sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.3)),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
      Animated.parallel([
        Animated.timing(badgeFade, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleFade, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1100),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleFade, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(badgeFade, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Live Sync Status Badge */}
      <Animated.View style={[styles.badgeContainer, { opacity: badgeFade }]}>
        <View style={styles.badgePulseDot} />
        <Text style={styles.badgeText}>⚡ LIVE QUEUES SYNCED</Text>
      </Animated.View>

      {/* Main Logo & Glowing Pulse Ring */}
      <View style={styles.logoWrapper}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseRingScale }],
              opacity: pulseRingOpacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <SneprLogo fontSize={64} />
        </Animated.View>
      </View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, { opacity: subtitleFade }]}>
        <Text style={styles.taglineText}>KNOW BEFORE YOU GO</Text>
        <Text style={styles.taglineSubText}>Skip the line • Live chair wait times</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F2', // Warm cream luxury background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  badgeContainer: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    gap: 6,
  },
  badgePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 0.8,
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 120,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  logoContainer: {
    alignItems: 'center',
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 1.8,
  },
  taglineSubText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
  },
});
