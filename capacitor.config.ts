import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dripply.watersort',
  appName: 'Dripply',
  webDir: 'www',
  backgroundColor: '#0B3B5E',
  android: {
    allowMixedContent: true,
  },
};

export default config;
