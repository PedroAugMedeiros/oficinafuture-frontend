import { Platform } from 'react-native';

// ─── API Base URL ───────────────────────────────────────────────────────────
// 'localhost' only works on the web/computer browser.
// On a physical Android/iOS device, use the machine's local network IP.
// On an Android Emulator, use 10.0.2.2 (it maps to host machine's localhost).

const LOCAL_IP = '192.168.1.2'; // <- Your machine's IP on the local network
const PORT = '8000';

function getBaseUrl() {
  // Web (browser on computer): localhost works fine
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}/api`;
  }

  // Android emulator: 10.0.2.2 maps to the host machine
  // Physical device: use the real local network IP
  return `http://${LOCAL_IP}:${PORT}/api`;
}

export const BASE_URL = getBaseUrl();
