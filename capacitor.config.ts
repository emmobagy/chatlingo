import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chatlingo.app',
  appName: 'ChatLingo',
  webDir: 'out',
  server: {
    // During development: point to local Next.js server
    // Comment this out for production builds
    url: 'http://localhost:3000',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#030712', // gray-950 — matches app background
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#030712',
      showSpinner: false,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
