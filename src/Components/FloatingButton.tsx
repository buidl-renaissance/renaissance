import React from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon, { IconTypes } from "./Icon";

interface FloatingButtonProps {
  icon?: string;
  type?: IconTypes;
  onPress?: () => void;
}

export const FloatingButton = ({ icon = "add", type = IconTypes.Ionicons, onPress }: FloatingButtonProps) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, Platform.OS === "android" ? 16 : 0) + 30;
  
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, { bottom: bottomOffset }]}>
      <Icon
        type={type}
        size={36}
        color={"white"}
        name={icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#555",
    position: "absolute",
    alignContent: "center",
    textAlign: "center",
    display: "flex",
    fontWeight: "bold",
    alignItems: "center",
    padding: 10,
    right: 120,
  },
});
