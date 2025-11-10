import React from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingContext } from '@/components/OnboardingContext';
import OnboardingScreen from './(onboarding)/index';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isOnboardingCompleted, isLoading } = useOnboardingContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && isOnboardingCompleted) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isOnboardingCompleted, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isOnboardingCompleted) {
    return <OnboardingScreen />;
  }

  return null; // Will redirect to /(tabs)
}