import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarView from '@/components/CalendarView';

export default function CalendarScreen() {
  return (
    <SafeAreaView className='flex-1 bg-background' edges={['right', 'left']}>
      <View className="p-4 pb-2">
        <Text className="text-2xl font-bold">Workout Calendar</Text>
      </View>
      <CalendarView />
    </SafeAreaView>
  );
}