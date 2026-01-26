import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { CLERK_PUBLISHABLE_KEY } from './clerk.config';

import HomeFeedScreen from './screens/HomeFeedScreen';
import AddFlyerScreen from './screens/AddFlyerScreen';
import FlyerDetailScreen from './screens/FlyerDetailScreen';
import SignInScreen from './screens/SignInScreen';
import ProfileScreen from './screens/ProfileScreen';

// Token cache for Clerk
const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Simple state-based navigation context
export const NavigationContext = {
  navigate: null,
  goBack: null,
  currentScreen: null,
  params: null,
};

export default function App() {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <AppContent />
    </ClerkProvider>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('HomeFeed');
  const [screenParams, setScreenParams] = useState({});
  const [history, setHistory] = useState(['HomeFeed']);

  const navigate = (screenName, params = {}) => {
    setHistory(prev => [...prev, screenName]);
    setCurrentScreen(screenName);
    setScreenParams(params);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
      setScreenParams({});
    }
  };

  // Create navigation object
  const navigation = {
    navigate,
    goBack,
    setOptions: () => {}, // No-op for compatibility
  };

  const route = {
    params: screenParams,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HomeFeed':
        return <HomeFeedScreen navigation={navigation} route={route} />;
      case 'AddFlyer':
        return <AddFlyerScreen navigation={navigation} route={route} />;
      case 'FlyerDetail':
        return <FlyerDetailScreen navigation={navigation} route={route} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} route={route} />;
      default:
        return <HomeFeedScreen navigation={navigation} route={route} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <SignedIn>
        {renderScreen()}
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
