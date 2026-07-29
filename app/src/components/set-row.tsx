import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { SetRow as SetRowData } from '@/db/types';

export function SetRow({ set, index, onDelete }: { set: SetRowData; index: number; onDelete?: () => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <ThemedText type="small" style={styles.index}>
        {index + 1}
      </ThemedText>
      <ThemedText type="small" style={styles.value}>
        {set.weight} {set.unit}
      </ThemedText>
      <ThemedText type="small" style={styles.value}>
        {set.reps} reps
      </ThemedText>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} hitSlop={8}>
          <ThemedText type="small" themeColor="muted">
            Remove
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  index: {
    width: 20,
  },
  value: {
    flex: 1,
  },
});
