import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { aiParseLog } from '@/lib/api';
import { useTheme } from '@/hooks/use-theme';

export function QuickLogInput({ onParsed }: { onParsed: (sets: { weight: number; reps: number }[]) => void }) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const result = await aiParseLog(text);
      if (result.sets.length === 0) {
        setError(true);
      } else {
        onParsed(result.sets);
        setText('');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            setError(false);
          }}
          placeholder='or type "3x10x135"'
          placeholderTextColor={theme.muted}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          selectionColor={theme.text}
          cursorColor={theme.text}
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !text.trim()}
          style={[styles.button, { borderColor: theme.border, opacity: text.trim() ? 1 : 0.4 }]}
        >
          {loading ? <ActivityIndicator color={theme.text} /> : <ThemedText type="small">Ask AI</ThemedText>}
        </TouchableOpacity>
      </View>
      {error && (
        <ThemedText type="small" themeColor="muted">
          Couldn&apos;t parse that - try the fields above instead.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  button: {
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
