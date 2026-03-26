import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fangrila.app',
  appName: 'Fangri-la',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Browser: {},
  },
};

export default config;
