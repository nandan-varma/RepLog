import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Exercise } from 'replog-shared';

import { ThemedText } from '@/components/themed-text';
import { imageUrl } from '@/data/exercises';
import { useTheme } from '@/hooks/use-theme';

export function ExerciseRow({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, { borderColor: theme.border }]}>
      <Image
        source={exercise.images[0] ? { uri: imageUrl(exercise.images[0]) } : undefined}
        style={[styles.thumb, { borderColor: theme.border, backgroundColor: theme.background }]}
        contentFit="cover"
      />
      <View style={styles.text}>
        <ThemedText type="smallBold">{exercise.name}</ThemedText>
        <ThemedText type="small" themeColor="muted">
          {[exercise.equipment, exercise.primaryMuscles[0]].filter(Boolean).join(' · ')}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  thumb: {
    width: 56,
    height: 56,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
