import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Text } from './ui/text';
import { workoutService } from '@/services/workoutService';
import { Workout } from '@/services/workoutService';
import WorkoutSummary from './workout/WorkoutSummary';

type MarkedDates = {
  [date: string]: {
    marked: boolean;
    dotColor?: string;
    selected?: boolean;
  };
};

export default function CalendarView() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const logs = await workoutService.getAllLogs();
    setWorkouts(logs);
  };

  const markedDates = useMemo(() => {
    const marked: MarkedDates = {};
    
    // Mark all days with workouts
    workouts.forEach((workout) => {
      const dateStr = workout.date.split('T')[0];
      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dotColor: "white",
        };
      }
    });
    
    // Mark the selected date
    if (marked[selectedDate]) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
      };
    } else {
      marked[selectedDate] = {
        marked: false,
        selected: true,
      };
    }
    
    return marked;
  }, [workouts, selectedDate]);

  const selectedWorkouts = useMemo(() => {
    return workouts.filter((workout) => {
      return workout.date.startsWith(selectedDate);
    });
  }, [workouts, selectedDate]);  return (
    <View className="flex-1 p-2.5 bg-black">
      <Calendar
        current={selectedDate}
        onDayPress={(day: {dateString: string}): void => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: "#ffffff",
          selectedDayBackgroundColor: "#555555",
          arrowColor: "#ffffff",
          dotColor: "#ffffff",
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          calendarBackground: '#000000',
          dayTextColor: "#ffffff",
          monthTextColor: "#ffffff",
          textDisabledColor: '#666666',
          selectedDayTextColor: '#ffffff',
          textSectionTitleColor: "#ffffff",
          // Borders
          calendarBorderColor: '#444444',
        }}
      />
      
      <ScrollView 
        className="flex-1 bg-black"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-5 flex-1 bg-black">
          <Text className="text-lg font-semibold mb-2.5 text-white">
            {new Date(selectedDate).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          
          {selectedWorkouts.length > 0 ? (
            <WorkoutSummary workouts={selectedWorkouts} />
          ) : (
            <View className="py-10 justify-center items-center">
              <Text className="text-gray-400">No workouts logged for this day</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

