import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.snepr.app',
  appName: 'Snepr',
  webDir: '.output/public',
  server: {
    url: 'https://snepr.vercel.app',
    cleartext: true
  }
};

export default config;
