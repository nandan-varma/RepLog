import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function SetInput({
  defaultWeight,
  defaultReps,
  unit,
  onAdd,
}: {
  defaultWeight?: number;
  defaultReps?: number;
  unit: string;
  onAdd: (set: { weight: number; reps: number }) => void;
}) {
  const theme = useTheme();
  const [weight, setWeight] = useState(defaultWeight ? String(defaultWeight) : '');
  const [reps, setReps] = useState(defaultReps ? String(defaultReps) : '');

  const weightValue = Number(weight);
  const repsValue = Number(reps);
  const canAdd = weight.length > 0 && reps.length > 0 && !Number.isNaN(weightValue) && !Number.isNaN(repsValue);

  function handleAdd() {
    if (!canAdd) return;
    onAdd({ weight: weightValue, reps: repsValue });
  }

  return (
    <View style={styles.row}>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        placeholder={unit}
        placeholderTextColor={theme.muted}
        keyboardType="decimal-pad"
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
      />
      <ThemedText type="small">×</ThemedText>
      <TextInput
        value={reps}
        onChangeText={setReps}
        placeholder="reps"
        placeholderTextColor={theme.muted}
        keyboardType="number-pad"
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
      />
      <View style={styles.button}>
        <Button title="Add Set" onPress={handleAdd} disabled={!canAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    flex: 1,
  },
});
