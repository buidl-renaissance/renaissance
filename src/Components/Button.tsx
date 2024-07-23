import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { lightGreen, darkGrey } from "../colors";

type ButtonVariant = "hollow" | "solid";
type ButtonSize = "normal" | "small";

interface ButtonProps {
  onPress: () => void;
  active?: boolean;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = ({
  active,
  onPress,
  title = "Save",
  variant = "hollow",
  size = "normal",
}: ButtonProps) => {
  const textColor = variant === "hollow" ? darkGrey : lightGreen;
  const borderColor = variant === "hollow" ? darkGrey : lightGreen;
  const activeStyles = active
    ? { color: "white", backgroundColor: darkGrey }
    : {};
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: borderColor },
        size === "small" ? styles.smallButton : {},
        active ? { backgroundColor: darkGrey } : {},
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
          size === "small" ? styles.smallText : {},
          active ? { color: "white" } : {},
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    elevation: 3,
    // borderColor: '#28303d',
    borderWidth: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    // color: '#28303d',
  },
  smallButton: {
    marginVertical: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 2,
  },
  smallText: {
    fontSize: 11,
  },
});
