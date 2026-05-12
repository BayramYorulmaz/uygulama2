import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Ýleride buraya Sentry/LogRocket entegrasyonu ekleyin.
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container} accessibilityRole="alert">
          <Text style={styles.title}>Bir þeyler ters gitti</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Button title="Tekrar Dene" onPress={this.reset} />
        </View>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

const expoExtra = (Constants.manifest && (Constants.manifest as any).extra) || (Constants.expoConfig && (Constants.expoConfig as any).extra);
const ENV_BACKEND = expoExtra?.BACKEND_URL ?? (typeof process !== 'undefined' ? (process.env as any)?.BACKEND_URL : undefined);

const ANDROID_EMULATOR = 'http://10.0.2.2:3000';
const LOCALHOST = 'http://localhost:3000';

export const BACKEND_BASE_URL = ENV_BACKEND ?? (Platform.OS === 'android' ? ANDROID_EMULATOR : LOCALHOST);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  message: { marginBottom: 16, textAlign: 'center' },
});