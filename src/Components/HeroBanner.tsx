import React from "react";
import { Animated, ImageBackground, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getContact, Contact } from "../dpop";
import { useContact } from "../hooks/useContact";
import { useAuth } from "../context/Auth";

export const HeroBanner = ({ children, handleLogin }) => {
  const [contact] = useContact();
  const { state: authState } = useAuth();

  return (
    <View>
      <ImageBackground
        source={require("../../assets/renaissance.png")}
        resizeMode="cover"
      >
        <Animated.View
          style={{
            paddingTop: 160,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderBottomColor: "gray",
            borderBottomWidth: 1,
          }}
        >
          {/* Only show login button when user is not authenticated */}
          {!authState.isAuthenticated && (
            <View style={{ position: "absolute", top: 48, right: 16 }}>
              <TouchableOpacity onPress={handleLogin}>
                <Text
                  style={{
                    borderColor: "white",
                    borderRadius: 16,
                    borderWidth: 1,
                    color: "white",
                    fontSize: 18,
                    padding: 8,
                    marginTop: 8,
                  }}
                >
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <Text
            style={{
              color: "white",
              fontSize: 32,
              fontWeight: "bold",
              textAlign: "left",
              marginTop: 8,
            }}
          >
            Welcome to the Renaissance City
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              textAlign: "left",
              marginVertical: 4,
              marginBottom: 8,
            }}
          >
            Unlock the rich tapestry of food, arts, and culture that Detroit has
            to offer.
          </Text>
          {children}
        </Animated.View>
      </ImageBackground>
    </View>
  );
};
