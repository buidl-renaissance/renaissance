import React from "react";
import { Text } from "react-native";
import { Button } from "react-native-paper";
import { theme } from "../colors";

const FilterBubble = ({ active, name, onPress, flat = false }) => {
  return (
    <Button
      style={
        flat
          ? {
              borderColor: active ? theme.primary : "transparent",
              borderBottomWidth: 2,
              borderRadius: 0,
            }
          : {
              backgroundColor: active ? theme.primary : "transparent",
              marginRight: 8,
              borderColor: theme.primary,
              borderWidth: 1,
            }
      }
      onPress={onPress}
    >
      <Text style={{ color: flat ? (active ? theme.primary : theme.textTertiary) : (active ? theme.textOnPrimary : theme.textTertiary) }}>{name}</Text>
    </Button>
  );
};

export default FilterBubble;
