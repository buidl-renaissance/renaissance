import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { lightGreen, darkGrey } from '../colors';

type ButtonVariant = 'hollow' | 'solid';

interface ButtonProps {
  onPress: () => void; 
  title?: string;
  variant?: ButtonVariant;
}

export const Button = ({ onPress, title = 'Save', variant = 'hollow' } ) => {
  const textColor = variant === 'hollow' ? darkGrey : lightGreen;
  const borderColor = variant === 'hollow' ? darkGrey : lightGreen;
  return (
    <Pressable style={[styles.button, { borderColor: borderColor }]} onPress={onPress}>
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: 'bold',
    letterSpacing: 0.25,
    // color: '#28303d',
  },
});