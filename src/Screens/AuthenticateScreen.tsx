import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../colors";
import { authenticateQRSession } from "../api/user";

interface AuthenticateScreenProps {
  navigation: any;
  route: {
    params: {
      token: string;
    };
  };
}

type AuthStatus = "authenticating" | "success" | "error";

const AuthenticateScreen: React.FC<AuthenticateScreenProps> = ({
  navigation,
  route,
}) => {
  const { token } = route.params;
  const [status, setStatus] = useState<AuthStatus>("authenticating");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      title: "Authenticate",
      headerStyle: {
        backgroundColor: theme.background,
      },
      headerTintColor: theme.text,
    });
  }, [navigation]);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No authentication token provided");
      return;
    }

    performAuthentication();
  }, [token]);

  // Play success animation when status changes to success
  useEffect(() => {
    if (status === "success") {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        navigation.goBack();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  const performAuthentication = async () => {
    try {
      setStatus("authenticating");
      setErrorMessage("");
      
      console.log("[AuthenticateScreen] Starting authentication with token:", token);
      
      const result = await authenticateQRSession(token);
      
      console.log("[AuthenticateScreen] Authentication result:", result);
      
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Authentication failed");
      }
    } catch (error) {
      console.error("[AuthenticateScreen] Authentication error:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const handleRetry = () => {
    performAuthentication();
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderContent = () => {
    switch (status) {
      case "authenticating":
        return (
          <View style={styles.contentContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.title}>Authenticating...</Text>
            <Text style={styles.subtitle}>
              Signing request with your wallet
            </Text>
          </View>
        );

      case "success":
        return (
          <View style={styles.contentContainer}>
            <Animated.View
              style={[
                styles.iconContainer,
                styles.successIconContainer,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={theme.success}
              />
            </Animated.View>
            <Text style={styles.title}>Authentication Successful</Text>
            <Text style={styles.subtitle}>
              You can now continue on the web browser
            </Text>
            <Text style={styles.dismissText}>
              This screen will close automatically...
            </Text>
          </View>
        );

      case "error":
        return (
          <View style={styles.contentContainer}>
            <View style={[styles.iconContainer, styles.errorIconContainer]}>
              <Ionicons
                name="close-circle"
                size={80}
                color={theme.error}
              />
            </View>
            <Text style={styles.title}>Authentication Failed</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color={theme.text} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="qr-code" size={24} color={theme.primary} />
          <Text style={styles.headerText}>Web Login</Text>
        </View>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  contentContainer: {
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    marginBottom: 24,
  },
  successIconContainer: {
    // Additional success styling if needed
  },
  errorIconContainer: {
    // Additional error styling if needed
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  dismissText: {
    fontSize: 14,
    color: theme.textTertiary,
    marginTop: 16,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 14,
    color: theme.error,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: theme.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surfaceElevated,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  closeButtonText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default AuthenticateScreen;
