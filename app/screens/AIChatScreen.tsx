import { useRef, useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { createAnthropic } from "@ai-sdk/anthropic"
import { streamText } from "ai"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { getExerciseById } from "@/services/exerciseService"
import { getProfile } from "@/services/profileService"
import { getWorkouts, type Workout } from "@/services/workoutService"
import { useAppTheme } from "@/theme/context"

interface Message {
  role: "user" | "assistant"
  content: string
}

const GOAL_LABELS: Record<string, string> = {
  build_muscle: "build muscle",
  lose_weight: "lose weight",
  improve_endurance: "improve endurance",
  stay_active: "stay active",
}

function buildSystemPrompt(workouts: Workout[]): string {
  const profile = getProfile()
  const goal = GOAL_LABELS[profile.fitnessGoal] ?? profile.fitnessGoal
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const recentSummary = workouts.slice(0, 3).map((w) => {
    const exercises = w.exercises.map((we) => {
      const ex = getExerciseById(we.exerciseId)
      const sets = we.sets.map((s) => `${s.reps}×${s.weight}${profile.weightUnit}`).join(", ")
      return `${ex?.name ?? we.exerciseId}: ${sets}`
    }).join("; ")
    return `${w.date}: ${exercises || "no exercises logged"}`
  }).join("\n")

  return [
    `You are an expert fitness coach for ${profile.name || "the user"}, who wants to ${goal}.`,
    `Today is ${today}.`,
    recentSummary ? `Recent workouts:\n${recentSummary}` : "No recent workouts yet.",
    "Be concise, practical, and motivating. Give specific exercise recommendations when asked.",
  ].join("\n\n")
}

const QUICK_ACTIONS = [
  "What should I do today?",
  "Analyze my week",
  "Suggest a push day",
  "How do I improve form?",
]

function MessageBubble({ msg, colors, spacing }: { msg: Message; colors: any; spacing: any }) {
  const isUser = msg.role === "user"
  const s = StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    bubble: {
      maxWidth: "80%",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 18,
      borderBottomRightRadius: isUser ? 4 : 18,
      borderBottomLeftRadius: isUser ? 18 : 4,
      backgroundColor: isUser ? colors.tint : colors.separator,
    },
    text: {
      fontSize: 15,
      fontFamily: "spaceGroteskRegular",
      color: isUser ? "#fff" : colors.text,
      lineHeight: 22,
    },
  })

  return (
    <View style={s.row}>
      <View style={s.bubble}>
        <Text text={msg.content} style={s.text} />
      </View>
    </View>
  )
}

export function AIChatScreen() {
  const { theme: { colors, spacing } } = useAppTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const profile = getProfile()
  const hasKey = !!profile.apiKey

  const send = async (text: string) => {
    if (!text.trim() || streaming || !hasKey) return
    const userMsg: Message = { role: "user", content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setStreaming(true)

    const assistantMsg: Message = { role: "assistant", content: "" }
    setMessages([...newMessages, assistantMsg])

    try {
      const anthropic = createAnthropic({ apiKey: profile.apiKey })
      const workouts = getWorkouts()
      const { textStream } = streamText({
        model: anthropic("claude-haiku-4-5"),
        system: buildSystemPrompt(workouts),
        messages: newMessages,
      })

      for await (const chunk of textStream) {
        assistantMsg.content += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...assistantMsg }
          return updated
        })
        scrollRef.current?.scrollToEnd({ animated: false })
      }
    } catch (err: any) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Error: ${err?.message ?? "Something went wrong. Check your API key."}`,
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  const s = StyleSheet.create({
    header: { paddingTop: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    title: { fontSize: 28, fontFamily: "spaceGroteskBold", color: colors.text },
    subtitle: { fontSize: 13, color: colors.textDim, fontFamily: "spaceGroteskRegular", marginTop: 2 },
    noKey: {
      flex: 1, alignItems: "center", justifyContent: "center",
      paddingHorizontal: spacing.xl,
    },
    noKeyEmoji: { fontSize: 48, marginBottom: spacing.md },
    noKeyTitle: { fontSize: 20, fontFamily: "spaceGroteskBold", color: colors.text, marginBottom: spacing.xs, textAlign: "center" },
    noKeyText: { fontSize: 14, color: colors.textDim, textAlign: "center", lineHeight: 21 },
    chips: {
      flexDirection: "row", paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
      gap: spacing.xs, flexWrap: "wrap",
    },
    chip: {
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs + 2,
      borderRadius: 16, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.background,
    },
    chipText: { fontSize: 13, fontFamily: "spaceGroteskMedium", color: colors.tint },
    msgList: { flex: 1 },
    emptyChat: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyChatText: { color: colors.textDim, fontSize: 14, fontFamily: "spaceGroteskRegular" },
    inputRow: {
      flexDirection: "row", alignItems: "flex-end",
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      gap: spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator,
      backgroundColor: colors.background,
    },
    textInput: {
      flex: 1, minHeight: 40, maxHeight: 100,
      borderWidth: 1, borderColor: colors.border, borderRadius: 20,
      paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
      fontSize: 15, fontFamily: "spaceGroteskRegular", color: colors.text,
      backgroundColor: colors.separator + "50",
    },
    sendBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: streaming || !input.trim() ? colors.border : colors.tint,
      alignItems: "center", justifyContent: "center",
    },
    sendText: { color: "#fff", fontSize: 16, fontFamily: "spaceGroteskBold" },
  })

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={s.header}>
        <Text text="AI Coach" style={s.title} />
        <Text text={`Powered by Claude${profile.name ? ` · ${profile.name}` : ""}`} style={s.subtitle} />
      </View>

      {!hasKey ? (
        <View style={s.noKey}>
          <Text text="🔑" style={s.noKeyEmoji} />
          <Text text="API Key Required" style={s.noKeyTitle} />
          <Text
            text={"Add your Anthropic API key in the Profile tab to start chatting with your AI fitness coach."}
            style={s.noKeyText}
          />
        </View>
      ) : (
        <>
          {/* Quick action chips */}
          <View style={s.chips}>
            {QUICK_ACTIONS.map((q) => (
              <TouchableOpacity key={q} style={s.chip} onPress={() => send(q)} disabled={streaming}>
                <Text text={q} style={s.chipText} />
              </TouchableOpacity>
            ))}
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              ref={scrollRef}
              style={s.msgList}
              contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.md, flexGrow: 1 }}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {messages.length === 0 ? (
                <View style={s.emptyChat}>
                  <Text text="Ask me anything about your training!" style={s.emptyChatText} />
                </View>
              ) : (
                messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} colors={colors} spacing={spacing} />
                ))
              )}
            </ScrollView>

            <View style={s.inputRow}>
              <TextInput
                style={s.textInput}
                value={input}
                onChangeText={setInput}
                placeholder="Ask your coach..."
                placeholderTextColor={colors.textDim}
                multiline
                returnKeyType="send"
                onSubmitEditing={() => send(input)}
                editable={!streaming}
              />
              <TouchableOpacity
                style={s.sendBtn}
                onPress={() => send(input)}
                disabled={streaming || !input.trim()}
              >
                <Text text="↑" style={s.sendText} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
    </Screen>
  )
}
