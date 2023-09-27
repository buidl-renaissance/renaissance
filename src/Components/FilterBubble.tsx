import React from "react";
import { Text } from "react-native";
import { Button } from "react-native-paper";

const FilterBubble = ({ active, name, onPress, flat = false }) => {
  return (
    <Button
      style={
        flat
          ? {
              borderColor: active ? "blue" : "transparent",
              borderBottomWidth: 2,
              borderRadius: 0,
            }
          : {
              backgroundColor: active ? "blue" : "transparent",
              marginRight: 8,
              borderColor: "blue",
              borderWidth: 1,
            }
      }
      onPress={onPress}
    >
      <Text style={{ color: flat ? (active ? "blue" : "gray") : (active ? "white" : "gray") }}>{name}</Text>
    </Button>
  );
};

export default FilterBubble;
