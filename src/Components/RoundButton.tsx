import React from "react";
import { TouchableOpacity } from "react-native";

import Icon from "../Components/Icon";

export const RoundButton = ({ type, name, onPress, color = 'white' }) => {
  return (
    <TouchableOpacity
      style={{
        marginRight: 12,
        opacity: 1,
        borderColor: color,
        borderRadius: 20,
        borderWidth: 1,
        padding: 8,
      }}
      onPress={onPress}
    >
      <Icon type={type} size={20} color={color} name={name} />
    </TouchableOpacity>
  );
};
