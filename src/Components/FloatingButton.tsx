import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon, { IconTypes } from "./Icon";

interface FloatingButtonProps {
  icon?: string;
  type?: IconTypes;
  onPress?: () => void;
}

export const FloatingButton = ({ icon = "add", type = IconTypes.Ionicons, onPress }: FloatingButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
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
    bottom: 30,
    right: 10,
  },
});
