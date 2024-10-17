import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailSignup = () => {
    // Implement email signup logic here
    console.log("Email signup");
  };

  const handleSocialSignup = (platform: string) => {
    // Implement social signup logic here
    console.log(`${platform} signup`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.signupButton} onPress={handleEmailSignup}>
        <Text style={styles.signupButtonText}>Sign Up with Email</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, styles.instagramButton]}
          onPress={() => handleSocialSignup("Instagram")}
        >
          <FontAwesome name="instagram" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialButton, styles.linkedinButton]}
          onPress={() => handleSocialSignup("LinkedIn")}
        >
          <FontAwesome name="linkedin" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.socialButton, styles.googleButton]}
          onPress={() => handleSocialSignup("Google")}
        >
          <FontAwesome name="google" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  signupButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  signupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    marginVertical: 20,
    fontSize: 16,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  socialButton: {
    padding: 10,
    borderRadius: 5,
    width: 50,
    alignItems: "center",
  },
  instagramButton: {
    backgroundColor: "#C13584",
  },
  linkedinButton: {
    backgroundColor: "#0077B5",
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
});

export default SignupScreen;
