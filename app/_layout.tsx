import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import ErrorBoundary from './_components/ErrorBoundary';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout(): JSX.Element {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider value={theme}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.card },
              headerTintColor: theme.colors.text,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Sýralama' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}