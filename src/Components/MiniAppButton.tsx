import React from "react";
import { TouchableOpacity, View, Text, StyleSheet, Image, ImageSourcePropType } from "react-native";
import { theme } from "../colors";

interface MiniAppButtonProps {
  emoji?: string;
  label: string;
  backgroundColor: string;
  onPress: () => void;
  marginLeft?: number;
  image?: ImageSourcePropType;
}

export const MiniAppButton: React.FC<MiniAppButtonProps> = ({
  emoji,
  label,
  backgroundColor,
  onPress,
  marginLeft = 0,
  image,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        marginLeft > 0 && { marginLeft },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor }]}>
        {image ? (
          <Image 
            source={image}
            style={styles.iconImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 66,
    flexShrink: 0,
  },
  iconContainer: {
    borderRadius: 14,
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emoji: {
    fontSize: 30,
  },
  iconImage: {
    width: 66,
    height: 66,
    borderRadius: 14,
  },
  labelContainer: {
    width: 66,
    maxWidth: 66,
  },
  label: {
    fontSize: 9,
    fontWeight: "600",
    color: theme.text,
    textAlign: "center",
    maxWidth: 66,
  },
});

