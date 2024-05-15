import React from "react";
import { TouchableOpacity } from "react-native";

import { View, Text, ScrollView } from "react-native";

import Icon, { IconTypes } from "./Icon";

import { SectionTitle } from "./SectionTitle";

const activities = [
  {
    title: "EAT",
    icon: "food-outline",
  },
  {
    title: "DRINK",
    icon: "beer-outline",
  },
  {
    title: "PLAY",
    icon: "run",
  },
  {
    title: "DANCE",
    icon: "human-female-dance",
  },
  {
    title: "LEARN",
    icon: "book-outline",
  },
  {
    title: "NETWORK",
    icon: "handshake",
  },
];

export const Activities = ({ onPress }) => {
  return (
    <View>
      <SectionTitle>What do you want to do?</SectionTitle>
      <ScrollView
        style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {activities.map((activity) => {
          return (
            <TouchableOpacity
              onPress={() => onPress(activity.title)}
              style={{
                marginRight: 8,
                width: 66,
                alignItems: "center",
                display: "flex",
              }}
            >
              <View
                style={{
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  borderColor: "black",
                  borderWidth: 1,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: 'center',
                  paddingVertical: 8,
                }}
              >
                <Icon
                  type={IconTypes.MaterialCommunityIcons}
                  // type={IconTypes.Ionicons}
                  size={36}
                  color="black"
                  name={activity.icon}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  marginBottom: 4,
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                {activity.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
