import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/theme';
import { logout } from '../../src/api/auth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <View style={styles.content}>
        <Text style={styles.text}>Manage your account and preferences.</Text>
        <Button 
          title="Log Out" 
          variant="outline" 
          onPress={handleLogout} 
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    ...theme.typography.h2,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  logoutButton: {
    width: '100%',
  }
});
