import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/Auth";
import { lightGreen, theme } from "../colors";

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { state, signInWithFarcaster, signInWithWallet, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      title: "Sign In",
      headerStyle: {
        backgroundColor: theme.background,
      },
    });
  }, [navigation]);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (state.isAuthenticated && state.user) {
      navigation.goBack();
    }
  }, [state.isAuthenticated, state.user, navigation]);

  const handleFarcasterLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithFarcaster();
      // Success will be handled by the auth state change
    } catch (error: any) {
      console.error("Farcaster login error:", error);
      if (error.message !== "Farcaster not installed") {
        Alert.alert("Sign In Failed", error.message || "Failed to sign in with Farcaster");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithWallet();
      navigation.goBack();
    } catch (error: any) {
      console.error("Wallet login error:", error);
      Alert.alert("Sign In Failed", error.message || "Failed to sign in with wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      navigation.goBack();
    } catch (error: any) {
      console.error("Email login error:", error);
      Alert.alert("Sign In Failed", error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  if (state.isLoading || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Signing in...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to access all features</Text>
        </View>

        {/* Farcaster Sign In - Primary Option with Posting Permissions */}
        <TouchableOpacity
          style={styles.farcasterButton}
          onPress={handleFarcasterLogin}
          activeOpacity={0.8}
        >
          <View style={styles.farcasterIconContainer}>
            <Text style={styles.farcasterIcon}>🟣</Text>
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.farcasterButtonText}>Sign in with Farcaster</Text>
            <Text style={styles.farcasterButtonSubtext}>Includes posting permissions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Benefits of Farcaster sign-in */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.benefitText}>Post casts to Farcaster</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.benefitText}>Use mini apps</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            <Text style={styles.benefitText}>Social features</Text>
          </View>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Anonymous Wallet */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleWalletLogin}
          activeOpacity={0.8}
        >
          <Ionicons name="wallet-outline" size={24} color={theme.text} />
          <Text style={styles.secondaryButtonText}>Continue Anonymously</Text>
        </TouchableOpacity>

        {/* Email Toggle */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setShowEmailForm(!showEmailForm)}
          activeOpacity={0.8}
        >
          <Ionicons name="mail-outline" size={24} color={theme.text} />
          <Text style={styles.secondaryButtonText}>Sign in with Email</Text>
          <Ionicons
            name={showEmailForm ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        {/* Email Form */}
        {showEmailForm && (
          <View style={styles.emailForm}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.textTertiary}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={theme.textTertiary}
            />
            <TouchableOpacity
              style={styles.emailLoginButton}
              onPress={handleEmailLogin}
            >
              <Text style={styles.emailLoginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    marginTop: 8,
  },
  farcasterButton: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  farcasterIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  farcasterIcon: {
    fontSize: 24,
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  farcasterButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  farcasterButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    color: theme.textSecondary,
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: theme.surface,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  secondaryButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: theme.text,
    fontWeight: "500",
  },
  emailForm: {
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: theme.inputBackground,
    color: theme.text,
  },
  emailLoginButton: {
    backgroundColor: theme.surfaceElevated,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  emailLoginButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: theme.textTertiary,
    textAlign: "center",
    lineHeight: 18,
  },
  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  benefitText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});

export default LoginScreen;
