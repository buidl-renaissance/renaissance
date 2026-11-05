import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../colors";
import { useTenant } from "../context/TenantContext";

const START_CITY_EMAIL = "john@dpop.tech";

export default function TenantSelectScreen() {
  const { displayName } = useTenant();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [note, setNote] = React.useState("");
  const [opened, setOpened] = React.useState(false);

  const reachOut = async () => {
    const cityName = city.trim();
    const replyTo = email.trim();
    if (!cityName || !replyTo) {
      Alert.alert("Add your city and email", "We need both so we know where to start and how to reply.");
      return;
    }
    const body = [
      "I want to learn how to start a Renaissance city.",
      "",
      `Name: ${name.trim() || "—"}`,
      `Email: ${replyTo}`,
      `City: ${cityName}`,
      "",
      note.trim() || "Tell me how to get this started.",
    ].join("\n");
    const url = `mailto:${START_CITY_EMAIL}?subject=${encodeURIComponent(`Start a city: ${cityName}`)}&body=${encodeURIComponent(body)}`;
    try {
      await Linking.openURL(url);
      setOpened(true);
    } catch {
      Alert.alert("Mail isn't available", `Write ${START_CITY_EMAIL} and include ${cityName}.`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>Now live</Text>
          <Text style={styles.liveCity}>{displayName}</Text>
          <Text style={styles.title}>Start your city</Text>
          <Text style={styles.subtitle}>
            Renaissance is running in {displayName}. Want it where you live? Send a note and we'll walk you through how to start your own city.
          </Text>

          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={theme.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="The city you want to start"
            placeholderTextColor={theme.textTertiary}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Anything we should know</Text>
          <TextInput
            style={styles.note}
            value={note}
            onChangeText={setNote}
            placeholder="Who's already gathering, what you want on the calendar, how you want to help."
            placeholderTextColor={theme.textTertiary}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={reachOut} activeOpacity={0.85}>
            <Text style={styles.buttonLabel}>Reach out</Text>
          </TouchableOpacity>
          {opened ? (
            <Text style={styles.sent}>
              Your mail app has the note. Send it and we'll reply with how to start.
            </Text>
          ) : (
            <View style={styles.footerSpace} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  kicker: {
    color: theme.textTertiary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  liveCity: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.text,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.textSecondary,
    marginTop: 8,
    marginBottom: 8,
  },
  label: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    fontSize: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  note: {
    minHeight: 110,
    borderRadius: 14,
    backgroundColor: theme.surface,
    color: theme.text,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 24,
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  sent: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },
  footerSpace: {
    height: 8,
  },
});
