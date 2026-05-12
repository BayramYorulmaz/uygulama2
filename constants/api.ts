import { Platform } from 'react-native';

// Backend URL konfigürasyonu
// Android emulator: 10.0.2.2 (host machine IP)
// iOS simulator: localhost
// Fiziksel cihaz: bilgisayarınızın LAN IP'si (ör. 192.168.1.5)

const ANDROID_EMULATOR = 'http://10.0.2.2:3000';
const IOS_SIMULATOR = 'http://localhost:3000';

export const BACKEND_BASE_URL = Platform.OS === 'android' ? ANDROID_EMULATOR : IOS_SIMULATOR;

console.log(`🌐 Backend URL: ${BACKEND_BASE_URL}`);