import React from 'react';
import { Image, Text } from 'react-native';
import { theme } from '../colors';

export const HeaderTitleImage = () => {
  return (
    <Text style={{ color: theme.text }}>Renaissance City</Text>
  );
  // return (
  //   <Image
  //       source={require('../../assets/DetroitArt-Logo.png')}
  //       style={{
  //           width: 121,
  //           resizeMode: 'contain',
  //           height: 26,
  //       }}
  //   />
  // );
};
