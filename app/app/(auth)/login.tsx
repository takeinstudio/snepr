import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/theme';
import { login, loginWithGoogle } from '../../src/api/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      offlineAccess: true,
    });
  }, []);

  const loginMutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: () => {
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      Alert.alert("Login Failed", error.response?.data?.error || "Could not log in.");
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) => loginWithGoogle(idToken),
    onSuccess: () => {
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      Alert.alert("Google Login Failed", error.response?.data?.error || "Could not log in with Google.");
    }
  });

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || (response as any).idToken;

      if (!idToken) {
        Alert.alert("Google Login Failed", "Could not retrieve Google ID token.");
        return;
      }
      googleLoginMutation.mutate(idToken);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // already in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Google Login Failed", "Play Services not available or outdated.");
      } else {
        Alert.alert("Google Login Failed", error.message || "An unexpected error occurred.");
      }
    }
  };

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
            loading={loginMutation.isPending}
          />
          <View style={{ height: 12 }} />
          <Button 
            title="Sign In with Google" 
            variant="outline"
            onPress={handleGoogleLogin} 
            loading={googleLoginMutation.isPending}
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
