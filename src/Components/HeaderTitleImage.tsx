import React from 'react';
import { Image } from 'react-native';

export const HeaderTitleImage = () => {
  return (
    <Image
        source={require('../../assets/DetroitArt-Logo.png')}
        style={{
            width: 121,
            resizeMode: 'contain',
            height: 26,
        }}
    />
  );
};
