import React from "react";
import { TouchableOpacity } from "react-native";

import Icon from "../Components/Icon";

export const RoundButton = ({ type, name, onPress }) => {
  return (
    <TouchableOpacity
      style={{
        marginRight: 16,
        opacity: 1,
        borderColor: "white",
        borderRadius: 20,
        borderWidth: 1,
        padding: 8,
      }}
      onPress={onPress}
    >
      <Icon type={type} size={20} color="white" name={name} />
    </TouchableOpacity>
  );
};
