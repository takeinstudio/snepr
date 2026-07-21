import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SneprWordmark } from './SneprWordmark';

interface SneprLogoProps {
  fontSize?: number;
  color?: string;
}

export function SneprLogo({ fontSize = 28, color = '#101012' }: SneprLogoProps) {
  return (
    <View style={styles.container}>
      <SneprWordmark height={fontSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
