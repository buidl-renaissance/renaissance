import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, AuthUser } from "../context/Auth";
import { lightGreen } from "../colors";

interface AccountManagementScreenProps {
  navigation: any;
}

type AuthMode = "select" | "email_login" | "email_register";

const AccountManagementScreen: React.FC<AccountManagementScreenProps> = ({
  navigation,
}) => {
  const { state, signInWithFarcaster, signInWithWallet, signInWithEmail, registerWithEmail, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      title: state.isAuthenticated ? "Account" : "Sign In",
    });
  }, [navigation, state.isAuthenticated]);

  const handleFarcasterLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithFarcaster();
      // Navigation will happen after callback
    } catch (error) {
      Alert.alert("Error", "Failed to initiate Farcaster login. Make sure Warpcast is installed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithWallet();
      Alert.alert("Success", "Signed in as guest", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create guest account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmail(email, password);
      Alert.alert("Success", "Signed in successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setIsLoading(true);
      await registerWithEmail({ email, password, name });
      Alert.alert("Success", "Account created successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          setMode("select");
        },
      },
    ]);
  };

  const getAccountTypeLabel = (user: AuthUser): string => {
    switch (user.type) {
      case "farcaster":
        return "Farcaster Account";
      case "local_wallet":
        return "Guest Account";
      case "local_email":
        return "Email Account";
      default:
        return "Account";
    }
  };

  const getAccountIcon = (user: AuthUser): string => {
    switch (user.type) {
      case "farcaster":
        return "logo-react";
      case "local_wallet":
        return "wallet-outline";
      case "local_email":
        return "mail-outline";
      default:
        return "person-outline";
    }
  };

  // Render authenticated state
  if (state.isAuthenticated && state.user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {state.user.pfpUrl ? (
                <Image
                  source={{ uri: state.user.pfpUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons
                    name={getAccountIcon(state.user) as any}
                    size={40}
                    color="#6366F1"
                  />
                </View>
              )}
            </View>

            <Text style={styles.displayName}>
              {state.user.displayName || state.user.username || "Anonymous"}
            </Text>

            {state.user.username && state.user.username !== state.user.displayName && (
              <Text style={styles.username}>@{state.user.username}</Text>
            )}

            <View style={styles.accountTypeBadge}>
              <Ionicons
                name={getAccountIcon(state.user) as any}
                size={14}
                color="#6366F1"
              />
              <Text style={styles.accountTypeText}>
                {getAccountTypeLabel(state.user)}
              </Text>
            </View>

            {state.user.type === "farcaster" && (
              <Text style={styles.fidText}>FID: {state.user.fid}</Text>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Info</Text>

            <View style={[styles.infoRow, styles.infoRowFirst]}>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{getAccountTypeLabel(state.user)}</Text>
            </View>

            {state.user.local?.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{state.user.local.email}</Text>
              </View>
            )}

            {state.user.local?.walletAddress && (
              <View style={[
                styles.infoRow,
                !state.user.farcaster?.custodyAddress && styles.infoRowLast
              ]}>
                <Text style={styles.infoLabel}>Wallet</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {`${state.user.local.walletAddress.slice(0, 10)}...${state.user.local.walletAddress.slice(-8)}`}
                </Text>
              </View>
            )}

            {state.user.farcaster?.custodyAddress && (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Custody</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {`${state.user.farcaster.custodyAddress.slice(0, 10)}...${state.user.farcaster.custodyAddress.slice(-8)}`}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render email login form
  if (mode === "email_login" || mode === "email_register") {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMode("select")}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.formHeader}>
              <Ionicons name="mail-outline" size={48} color="#6366F1" />
              <Text style={styles.formTitle}>
                {mode === "email_login" ? "Sign In" : "Create Account"}
              </Text>
              <Text style={styles.formSubtitle}>
                {mode === "email_login"
                  ? "Sign in with your email and password"
                  : "Create a new account with email"}
              </Text>
            </View>

            {mode === "email_register" && (
              <TextInput
                style={styles.input}
                placeholder="Name (optional)"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={mode === "email_login" ? handleEmailLogin : handleEmailRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === "email_login" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() =>
                setMode(mode === "email_login" ? "email_register" : "email_login")
              }
            >
              <Text style={styles.switchModeText}>
                {mode === "email_login"
                  ? "Don't have an account? Create one"
                  : "Already have an account? Sign in"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Render login options
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={80} color="#6366F1" />
          <Text style={styles.headerTitle}>Welcome</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to use mini apps and access your account
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {/* Farcaster Login */}
          <TouchableOpacity
            style={[styles.optionButton, styles.farcasterButton]}
            onPress={handleFarcasterLogin}
            disabled={isLoading}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="logo-react" size={28} color="#fff" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Sign in with Warpcast</Text>
              <Text style={[styles.optionSubtitle, styles.farcasterSubtitle]}>
                Use your Farcaster account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Guest Login */}
          <TouchableOpacity
            style={[styles.optionButton, styles.guestButton]}
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            <View style={[styles.optionIconContainer, styles.guestIcon]}>
              <Ionicons name="wallet-outline" size={28} color="#6366F1" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, styles.guestTitle]}>
                Continue as Guest
              </Text>
              <Text style={[styles.optionSubtitle, styles.guestSubtitle]}>
                Anonymous wallet-based account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6366F1" />
          </TouchableOpacity>

          {/* Email Login */}
          <TouchableOpacity
            style={[styles.optionButton, styles.emailButton]}
            onPress={() => setMode("email_login")}
            disabled={isLoading}
          >
            <View style={[styles.optionIconContainer, styles.emailIcon]}>
              <Ionicons name="mail-outline" size={28} color="#6366F1" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, styles.emailTitle]}>
                Sign in with Email
              </Text>
              <Text style={[styles.optionSubtitle, styles.emailSubtitle]}>
                Use email and password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Your account is used to authenticate with mini apps. Farcaster users
            get full functionality, while guests can still use most features.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 14,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  farcasterButton: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.3,
  },
  guestButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  emailButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  optionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  guestIcon: {
    backgroundColor: "#F3F4F6",
  },
  emailIcon: {
    backgroundColor: "#F3F4F6",
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  guestTitle: {
    color: "#111827",
  },
  emailTitle: {
    color: "#111827",
  },
  optionSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    lineHeight: 18,
  },
  farcasterSubtitle: {
    color: "rgba(255,255,255,0.85)",
  },
  guestSubtitle: {
    color: "#6B7280",
  },
  emailSubtitle: {
    color: "#6B7280",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 32,
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginTop: 28,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  // Profile styles
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EEF2FF",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#6366F1",
  },
  displayName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
    marginTop: 4,
  },
  username: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    fontWeight: "500",
  },
  accountTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  accountTypeText: {
    fontSize: 13,
    color: "#6366F1",
    marginLeft: 8,
    fontWeight: "600",
  },
  fidText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 10,
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoRowFirst: {
    paddingTop: 4,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 10,
  },
  // Form styles
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
    fontWeight: "500",
  },
  formHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 20,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    color: "#111827",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  switchModeButton: {
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 12,
  },
  switchModeText: {
    fontSize: 15,
    color: "#6366F1",
    fontWeight: "500",
  },
});

export default AccountManagementScreen;

