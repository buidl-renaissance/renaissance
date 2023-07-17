import React from 'react';
import { Text, TextInput, TextInputProps, StyleProp, TextStyle } from "react-native";

const TextInputStyles: StyleProp<TextStyle> = {
    height: 44,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    backgroundColor: 'white',
};

const TextLabelStyles: StyleProp<TextStyle> = {
    marginVertical: 6,
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
