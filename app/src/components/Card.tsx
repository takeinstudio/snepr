import React from "react";
import { StyleSheet, View, ViewProps, Platform } from "react-native";
import { theme } from "../theme";

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(44, 26, 14, 0.04)',
      },
      default: {
        shadowColor: theme.shadows.card.shadowColor,
        shadowOffset: theme.shadows.card.shadowOffset,
        shadowOpacity: theme.shadows.card.shadowOpacity,
        shadowRadius: theme.shadows.card.shadowRadius,
        elevation: theme.shadows.card.elevation,
      }
    })
  },
});
