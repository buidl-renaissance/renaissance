import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../colors";
import {
  TasteOption,
  TasteProfile,
  applyTasteSelection,
  emptyTasteProfile,
  finishTasteProfile,
  loadTasteProfile,
  PROFILE_TURN_URL,
  sanitizeTasteProfile,
  sanitizeTasteTurn,
  saveTasteProfile,
  scriptedTurn,
  showEverythingProfile,
} from "../utils/tasteProfile";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

async function requestTurn(
  messages: ChatMessage[],
  profile: TasteProfile,
  selection?: { optionIds: string[]; note?: string },
) {
  const fallbackProfile = selection
    ? applyTasteSelection(profile, selection.optionIds, selection.note).profile
    : profile;
  try {
    const response = await fetch(PROFILE_TURN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((message) => ({ role: message.role, text: message.text })),
        profile,
        selection,
      }),
    });
    if (!response.ok) throw new Error(`Profile turn returned ${response.status}`);
    return sanitizeTasteTurn(await response.json(), fallbackProfile);
  } catch (error) {
    console.warn("Taste onboarding fell back to the local script", error);
    return scriptedTurn(fallbackProfile);
  }
}

const TasteOnboardingScreen = ({ navigation }) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [options, setOptions] = React.useState<TasteOption[]>([]);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");
  const [profile, setProfile] = React.useState<TasteProfile>(emptyTasteProfile());
  const [busy, setBusy] = React.useState(true);
  const [done, setDone] = React.useState(false);
  const scrollRef = React.useRef<ScrollView>(null);

  const scrollToEnd = React.useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = await loadTasteProfile();
      const starting = existing ?? emptyTasteProfile();
      const turn = await requestTurn([], starting.completed ? { ...starting, answered: [], completed: false } : starting);
      if (cancelled) return;
      setProfile(turn.profile);
      setOptions(turn.options);
      setDone(turn.done);
      setMessages([{ id: "open", role: "assistant", text: turn.message }]);
      setBusy(false);
      scrollToEnd();
    })();
    return () => {
      cancelled = true;
    };
  }, [scrollToEnd]);

  const finish = React.useCallback(async (next: TasteProfile) => {
    const saved = finishTasteProfile(next);
    await saveTasteProfile(saved);
    navigation.navigate("Calendar");
  }, [navigation]);

  const send = React.useCallback(async () => {
    if (busy || done) return;
    const optionIds = selected.slice();
    const text = note.trim();
    if (!optionIds.length && !text) return;
    const labels = options.filter((option) => optionIds.includes(option.id)).map((option) => option.label);
    const reply = [...labels, text].filter(Boolean).join(", ");
    const userMessage: ChatMessage = { id: `${Date.now()}`, role: "user", text: reply };
    const history = [...messages, userMessage];
    setMessages(history);
    setSelected([]);
    setNote("");
    setBusy(true);
    scrollToEnd();
    const turn = await requestTurn(history, profile, { optionIds, note: text });
    setProfile(turn.profile);
    setOptions(turn.options);
    setDone(turn.done);
    setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: turn.message }]);
    setBusy(false);
    scrollToEnd();
  }, [busy, done, messages, note, options, profile, scrollToEnd, selected]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      <ScrollView ref={scrollRef} contentContainerStyle={styles.thread} keyboardShouldPersistTaps="handled">
        {messages.map((message) => (
          <View
            key={message.id}
            style={[styles.bubble, message.role === "user" ? styles.userBubble : styles.assistantBubble]}
          >
            <Text style={[styles.bubbleText, message.role === "user" && styles.userText]}>{message.text}</Text>
          </View>
        ))}
        {busy ? <ActivityIndicator color={theme.primary} style={styles.spinner} /> : null}
      </ScrollView>

      {done ? (
        <TouchableOpacity style={styles.primaryButton} onPress={() => finish(profile)}>
          <Text style={styles.primaryLabel}>See the calendar</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.composer}>
          <View style={styles.chips}>
            {options.map((option) => {
              const active = selected.includes(option.id);
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setSelected((current) => {
                      if (current.includes(option.id)) return current.filter((id) => id !== option.id);
                      const prefix = option.id.split(":")[0];
                      const exclusive = prefix === "when" || prefix === "price" || option.id === "area:anywhere";
                      if (!exclusive) {
                        return [...current.filter((id) => id !== "area:anywhere"), option.id];
                      }
                      if (prefix === "area") return [option.id];
                      return [...current.filter((id) => !id.startsWith(`${prefix}:`)), option.id];
                    });
                  }}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note"
              placeholderTextColor={theme.textTertiary}
              maxLength={280}
              editable={!busy}
            />
            <TouchableOpacity style={styles.send} onPress={send} disabled={busy}>
              <Text style={styles.sendLabel}>Send</Text>
            </TouchableOpacity>
          </View>
          {messages.length <= 1 ? (
            <TouchableOpacity onPress={() => finish(showEverythingProfile())}>
              <Text style={styles.skip}>Show everything</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  thread: {
    padding: 16,
    gap: 10,
  },
  bubble: {
    maxWidth: "86%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: theme.surfaceElevated,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: theme.primary,
  },
  bubbleText: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  spinner: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    padding: 12,
    backgroundColor: theme.surface,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipLabel: {
    color: theme.text,
    fontSize: 14,
  },
  chipLabelActive: {
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    color: theme.text,
    backgroundColor: theme.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  send: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  skip: {
    color: theme.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  primaryButton: {
    margin: 16,
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default TasteOnboardingScreen;
