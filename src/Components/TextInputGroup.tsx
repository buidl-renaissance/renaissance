import React from 'react';
import { Text, TextInput, TextInputProps, StyleProp, TextStyle } from "react-native";
import { theme } from '../colors';

const TextInputStyles: StyleProp<TextStyle> = {
    height: 44,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    backgroundColor: theme.inputBackground,
    color: theme.text,
};

const TextLabelStyles: StyleProp<TextStyle> = {
    marginVertical: 6,
    color: theme.text,
}

interface TextInputGroupProps extends TextInputProps {
    label: string;
}

export const TextInputGroup: React.FC<TextInputGroupProps> = (props) => {
    return (
        <>
            {props.label && <Text style={TextLabelStyles}>{props.label}</Text>}
            <TextInput style={[ TextInputStyles, props.style ]} {...props} />
        </>
    )
};
