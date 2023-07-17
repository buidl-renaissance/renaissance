import React from 'react';
import {
  Ionicons,
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  Fontisto,
  FontAwesome,
  FontAwesome5,
  Foundation,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} from '@expo/vector-icons';

export enum IconTypes {
  Ionicons = 'Ionicons',
  AntDesign = 'AntDesign',
  Entypo = 'Entypo',
  EvilIcons = 'EvilIcons',
  Feather = 'Feather',
  Fontisto = 'Fontisto',
  FontAwesome = 'FontAwesome',
  FontAwesome5 = 'FontAwesome5',
  Foundation = 'Foundation',
  MaterialCommunityIcons = 'MaterialCommunityIcons',
  MaterialIcons = 'MaterialIcons',
  Octicons = 'Octicons',
  SimpleLineIcons = 'SimpleLineIcons',
  Zocial = 'Zocial',
}

export interface IconProps {
  type: IconTypes;
  name: string;
  size: number;
  color: string;
}

const Icon: React.FC<IconProps> = ({ color, name, size, type }) => {
  switch (type) {
    case IconTypes.Ionicons:
      return <Ionicons name={name} size={size} color={color} />;

    case IconTypes.AntDesign:
      return <AntDesign name={name} size={size} color={color} />;

    case IconTypes.Entypo:
      return <Entypo name={name} size={size} color={color} />;

    case IconTypes.EvilIcons:
      return <EvilIcons name={name} size={size} color={color} />;

    case IconTypes.Feather:
      return <Feather name={name} size={size} color={color} />;

    case IconTypes.Fontisto:
      return <Fontisto name={name} size={size} color={color} />;

    case IconTypes.FontAwesome:
      return <FontAwesome name={name} size={size} color={color} />;

    case IconTypes.FontAwesome5:
      return <FontAwesome5 name={name} size={size} color={color} />;

    case IconTypes.Foundation:
      return <Foundation name={name} size={size} color={color} />;

    case IconTypes.MaterialCommunityIcons:
      return <MaterialCommunityIcons name={name} size={size} color={color} />;
    // return <Text style={{ color: color }}>{name}</Text>

    case IconTypes.MaterialIcons:
      return <MaterialIcons name={name} size={size} color={color} />;

    case IconTypes.SimpleLineIcons:
      return <SimpleLineIcons name={name} size={size} color={color} />;

    case IconTypes.Octicons:
      return <Octicons name={name} size={size} color={color} />;

    case IconTypes.Zocial:
      return <Zocial name={name} size={size} color={color} />;

    default:
      return <AntDesign name={name} size={size} color={color} />;
  }
};

export default Icon;
