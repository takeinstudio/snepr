import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface SneprLogoProps {
  fontSize?: number;
  color?: string;
}

export function SneprLogo({ fontSize = 28, color = theme.colors.text }: SneprLogoProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize, color }]}>
        sn<Text style={{ color: theme.colors.primary }}>≡</Text>pr
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '900',
    letterSpacing: -1,
  },
});
