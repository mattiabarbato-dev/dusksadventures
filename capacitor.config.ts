import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.duskadventures.game',
  appName: 'Dusk Adventures',
  webDir: 'dist/dusk-adventures',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
