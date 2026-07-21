import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Easing } from 'react-native';
import { theme } from '../theme';
import { SneprLogo } from './SneprLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(900),
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
      ]),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <SneprLogo fontSize={60} />
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: subtitleFade }]}>
        Live salon queues near you
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  logoContainer: {
    alignItems: 'center',
  },
  tagline: {
    marginTop: theme.spacing.lg,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
});
