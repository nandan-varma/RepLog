import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { buildCoachContext } from '@/data/coach-context';
import { aiCoach } from '@/lib/api';
import { useTheme } from '@/hooks/use-theme';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function CoachScreen() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    const message = input.trim();
    if (!message) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setLoading(true);
    try {
      const context = await buildCoachContext();
      const result = await aiCoach(message, context);
      setMessages((prev) => [...prev, { role: 'assistant', text: result.text }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Couldn't reach the coach right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Coach
        </ThemedText>
        <ScrollView contentContainerStyle={styles.messages}>
          {messages.length === 0 && (
            <ThemedText type="small" themeColor="muted">
              Ask about your training - progress, next workout, form, anything.
            </ThemedText>
          )}
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubble, { borderColor: theme.border }]}>
              <ThemedText type="small" themeColor="muted">
                {m.role === 'user' ? 'You' : 'Coach'}
              </ThemedText>
              <ThemedText type="small">{m.text}</ThemedText>
            </View>
          ))}
          {loading && <ActivityIndicator color={theme.text} style={styles.loading} />}
        </ScrollView>
        <View style={[styles.inputRow, { borderColor: theme.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask the coach…"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.text }]}
            selectionColor={theme.text}
            cursorColor={theme.text}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend} disabled={loading || !input.trim()}>
            <ThemedText type="smallBold">Send</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    paddingHorizontal: 16,
    paddingTop: 60,
    marginBottom: 8,
  },
  messages: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  bubble: {
    borderWidth: 1,
    padding: 10,
    gap: 2,
  },
  loading: {
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
