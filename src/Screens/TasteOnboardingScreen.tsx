import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../colors";
import {
  DISTANCES,
  DISTANCE_LABELS,
  INTERESTS,
  INTEREST_LABELS,
  PRICE_LABELS,
  PRICE_PREFS,
  TasteProfile,
  WHEN_HINTS,
  WHEN_LABELS,
  WHEN_PREFS,
  emptyTasteProfile,
  loadTasteProfile,
  saveTasteProfile,
  summarizeTaste,
} from "../utils/tasteProfile";

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

const TasteOnboardingScreen = ({ navigation }) => {
  const [draft, setDraft] = React.useState<TasteProfile>(emptyTasteProfile());

  React.useEffect(() => {
    let cancelled = false;
    loadTasteProfile().then((stored) => {
      if (!cancelled && stored) setDraft(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const reset = React.useCallback(() => setDraft(emptyTasteProfile()), []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "For you",
      headerBackTitle: "Home",
      headerRight: () => (
        <TouchableOpacity onPress={reset} style={styles.resetHit} accessibilityRole="button">
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, reset]);

  const save = async () => {
    const next: TasteProfile = { ...draft, note: draft.note.trim(), completed: true };
    await saveTasteProfile(next);
    navigation.navigate("Calendar", { showForYou: true });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Set up your For you tab</Text>
        <Text style={styles.subtitle}>
          Pick what you want more of. We'll build a For you tab around it — nothing else gets hidden.
        </Text>

        <Section title="More of" hint="Pick any">
          <View style={styles.wrap}>
            {INTERESTS.map((interest) => (
              <Choice
                key={interest}
                label={INTEREST_LABELS[interest]}
                selected={draft.interests.includes(interest)}
                onPress={() => setDraft((current) => ({ ...current, interests: toggle(current.interests, interest) }))}
              />
            ))}
          </View>
        </Section>

        <Section title="When you're free" hint="Pick any">
          <View style={styles.wrap}>
            {WHEN_PREFS.map((when) => (
              <Choice
                key={when}
                label={WHEN_LABELS[when]}
                hint={WHEN_HINTS[when]}
                selected={draft.whens.includes(when)}
                onPress={() => setDraft((current) => ({ ...current, whens: toggle(current.whens, when) }))}
              />
            ))}
          </View>
        </Section>

        <Section title="How far you'll go">
          <View style={styles.wrap}>
            {DISTANCES.map((distance) => (
              <Choice
                key={distance}
                label={DISTANCE_LABELS[distance]}
                selected={draft.distance === distance}
                inverse
                onPress={() => setDraft((current) => ({
                  ...current,
                  distance: current.distance === distance ? null : distance,
                }))}
              />
            ))}
          </View>
        </Section>

        <Section title="Price">
          <View style={styles.wrap}>
            {PRICE_PREFS.map((price) => (
              <Choice
                key={price}
                label={PRICE_LABELS[price]}
                selected={draft.prices.includes(price)}
                onPress={() => setDraft((current) => ({ ...current, prices: toggle(current.prices, price) }))}
              />
            ))}
          </View>
        </Section>

        <Section title="Anything specific?">
          <TextInput
            style={styles.note}
            value={draft.note}
            onChangeText={(note) => setDraft((current) => ({ ...current, note }))}
            placeholder="Add a note — e.g. live jazz, all-ages shows, places I can walk to from Corktown"
            placeholderTextColor={theme.textTertiary}
            multiline
            maxLength={280}
          />
        </Section>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>YOUR FOR YOU TAB WILL LEAN TOWARD</Text>
          <Text style={styles.previewValue}>{summarizeTaste(draft)}</Text>
        </View>

        <TouchableOpacity style={styles.save} onPress={save} accessibilityRole="button">
          <Text style={styles.saveLabel}>Save and show For you</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.later} accessibilityRole="button">
          <Text style={styles.laterLabel}>Not now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Choice({
  label,
  hint,
  selected,
  inverse,
  onPress,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  inverse?: boolean;
  onPress: () => void;
}) {
  const filled = selected && !inverse;
  const light = selected && inverse;
  return (
    <TouchableOpacity
      style={[styles.choice, filled && styles.choiceOn, light && styles.choiceLight]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {filled ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      <Text style={[styles.choiceLabel, light && styles.choiceLabelDark]}>
        {label}
        {hint ? <Text style={[styles.choiceHint, light && styles.choiceLabelDark, filled && styles.choiceHintOn]}>  {hint}</Text> : null}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  resetHit: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reset: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: theme.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },
  section: {
    marginTop: 26,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionHint: {
    color: theme.textTertiary,
    fontSize: 13,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.background,
  },
  choiceOn: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  choiceLight: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  choiceLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
  },
  choiceLabelDark: {
    color: "#111",
  },
  choiceHint: {
    color: theme.textSecondary,
    fontWeight: "500",
  },
  choiceHintOn: {
    color: "rgba(255,255,255,0.85)",
  },
  note: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: theme.surface,
    color: theme.text,
    fontSize: 15,
    lineHeight: 21,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: "top",
  },
  preview: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  previewLabel: {
    color: theme.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  previewValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  save: {
    marginTop: 18,
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveLabel: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  later: {
    paddingVertical: 16,
    alignItems: "center",
  },
  laterLabel: {
    color: theme.textSecondary,
    fontSize: 16,
  },
});

export default TasteOnboardingScreen;
