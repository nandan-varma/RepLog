import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useOnboarding } from '@/hooks/useOnboarding';

/**
 * Development tools panel for testing features
 * This component should only be visible in development mode
 */
export function DevelopmentTools() {  const { 
    resetOnboardingFlow,
    isOnboardingCompleted,
    isOnboardingAnimating,
    isLoading
  } = useOnboarding();
  const [visible, setVisible] = useState(false);
  
  if (!visible) {
    return (
      <View style={{ position: 'absolute', bottom: 10, right: 10 }}>
        <Button 
          variant="outline" 
          size="sm" 
          onPress={() => setVisible(true)}
        >
          <Text className="text-xs">Dev</Text>
        </Button>
      </View>
    );
  }
  
  return (    <View 
      style={{ 
        position: 'absolute', 
        bottom: 10, 
        right: 10, 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        borderRadius: 8,
        width: 220
      }}
    >
      <Text className="text-white font-bold mb-2">Development Tools</Text>
      <Text className="text-white text-xs mb-1">Onboarding completed: {isOnboardingCompleted ? 'Yes' : 'No'}</Text>
      <Text className="text-white text-xs mb-1">Animating: {isOnboardingAnimating ? 'Yes' : 'No'}</Text>
      <Text className="text-white text-xs mb-3">Loading: {isLoading ? 'Yes' : 'No'}</Text>
      
      <View className="mb-2">
        <Button 
          variant="destructive" 
          size="sm" 
          onPress={async () => {
            await resetOnboardingFlow();
            // Force reload the app
            setTimeout(() => {
              // This is a hacky way to reload the app - in a real app
              // you'd use a better approach
              if (__DEV__) {
                console.log('Reloading app to show onboarding');
                // In Expo, this would reload the app
                try {
                  // @ts-ignore - This is a dev-only feature
                  if (typeof DevSettings !== 'undefined' && DevSettings.reload) {
                    // @ts-ignore
                    DevSettings.reload();
                  }
                } catch (e) {
                  console.log('Could not reload app', e);
                }
              }
            }, 500);
          }}
        >
          <Text className="text-xs text-white">Reset Onboarding</Text>
        </Button>
      </View>
      
      <Button 
        variant="outline" 
        size="sm" 
        onPress={() => setVisible(false)}
      >
        <Text className="text-xs">Close</Text>
      </Button>
    </View>
  );
}
