import React from 'react';
import { TextInput as RNTextInput } from "react-native";

const TextInputStyles = {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
};

export const TextInput = (props) => (<RNTextInput style={[ TextInputStyles, props.style ]} {...props} />);
