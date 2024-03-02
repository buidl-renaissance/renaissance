import React from "react";
import { TouchableOpacity } from "react-native";

import { View, Text, ScrollView, Image } from "react-native";

import { SectionTitle } from "./SectionTitle";

import * as Linking from "expo-linking";

const activities = [
  {
    title: 'Sweat it out',
    url: "https://schvitzdetroit.com/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/10202916/schwitz.png",
  },
  {
    title: 'Climb some steazy rocks',
    url: "https://www.dynodetroit.com/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06185132/dyno.jpeg",
  },
  {
    title: 'Spike that shit',
    url: "https://www.detroittennis.com/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06162338/detroit-indoor-tennis.jpeg",
  },
  {
    title: 'Stay on your feet',
    url: "https://downtowndetroit.org/experience-downtown/things-to-do/the-rink/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06162336/detroit-park-skate.jpeg",
  },
  {
    title: 'Knock down those pins',
    url: "https://fowlingwarehouse.com/hamtramck/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06162335/detroit-fowling.jpeg",
  },
];

export const SuggestedActivities = ({ }) => {
  return (
    <View>
      <SectionTitle>Daily Activities</SectionTitle>
      <ScrollView
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {activities.map((activity, i) => {
          return (
            <TouchableOpacity
              key={`activity-${i}`}
              onPress={() => {
                Linking.openURL(activity.url);
              }}
              style={{ marginRight: 16 }}
            >
              <Image
                source={{
                  uri: activity.image,
                }}
                style={{
                  height: 150,
                  width: 200,
                  borderRadius: 4,
                  resizeMode: "cover",
                  marginBottom: 4,
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: '500', fontStyle: 'italic', marginBottom: 4 }}>{activity.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
