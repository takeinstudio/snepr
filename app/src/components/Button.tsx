import React from "react";
import { StyleSheet, Text, Pressable, PressableProps, ActivityIndicator } from "react-native";
import { theme } from "../theme";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export function Button({ title, variant = "primary", loading, style, disabled, ...props }: ButtonProps) {
  const getStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondary;
      case "outline":
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        getStyle(),
        pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? theme.colors.primary : "#FFFFFF"} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 46,
    borderRadius: theme.radii.full,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: theme.colors.borderActive,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: theme.colors.text,
  },
  outlineText: {
    color: theme.colors.primary,
  },
});
