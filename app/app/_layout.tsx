import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';

import { QueryProvider } from '../src/providers/QueryProvider';
import { AnimatedSplashScreen } from '../src/components/SplashScreen';
import { theme } from '../src/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'custom-scrollbar-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          ::-webkit-scrollbar {
            width: 6px !important;
            height: 0px !important;
          }
          ::-webkit-scrollbar:horizontal {
            display: none !important;
            height: 0px !important;
          }
          ::-webkit-scrollbar-track {
            background: #FAF7F2 !important;
          }
          ::-webkit-scrollbar-thumb {
            background: #7A4B29 !important;
            border-radius: 9999px !important;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #5C371D !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>

        {!splashFinished && (
          <AnimatedSplashScreen onFinish={() => setSplashFinished(true)} />
        )}
      </View>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
