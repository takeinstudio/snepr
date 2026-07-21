import React, { useState } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/theme';
import { login } from '../../src/api/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: () => {
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      Alert.alert("Login Failed", error.response?.data?.error || "Could not log in.");
    }
  });

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    loginMutation.mutate();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to manage your bookings</Text>
        
        <Input 
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <Input 
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Log In" 
            onPress={handleLogin} 
            isLoading={loginMutation.isPending}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xxl,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
});
