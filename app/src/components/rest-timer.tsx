import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const REST_SECONDS = 90;

function secondsLeft(startedAt: number) {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(REST_SECONDS - elapsed, 0);
}

export function RestTimer({ startedAt, onDismiss }: { startedAt: number; onDismiss: () => void }) {
  const theme = useTheme();
  const [remaining, setRemaining] = useState(() => secondsLeft(startedAt));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(secondsLeft(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (remaining <= 0) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <TouchableOpacity onPress={onDismiss} style={[styles.container, { borderColor: theme.border }]}>
      <ThemedText type="small">
        Rest: {minutes}:{seconds.toString().padStart(2, '0')} (tap to dismiss)
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
});
