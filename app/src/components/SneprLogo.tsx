import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SneprLogoProps {
  fontSize?: number;
  color?: string;
}

export function SneprLogo({ fontSize = 28, color = '#101012' }: SneprLogoProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { fontSize, color }]}>
        sn≡pr
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
