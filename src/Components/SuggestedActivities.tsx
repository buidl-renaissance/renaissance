import React from "react";
import { TouchableOpacity } from "react-native";

import { View, Text, ScrollView, Image } from "react-native";

import * as Linking from "expo-linking";

const activities = [
  {
    url: "https://schvitzdetroit.com/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/10202916/schwitz.png",
  },
  {
    url: "https://www.dynodetroit.com/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06185132/dyno.jpeg",
  },
  {
    url: "https://www.detroittennis.com/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06162338/detroit-indoor-tennis.jpeg",
  },
  {
    url: "https://downtowndetroit.org/experience-downtown/things-to-do/the-rink/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06162336/detroit-park-skate.jpeg",
  },
  {
    url: "https://fowlingwarehouse.com/hamtramck/",
    image:
      "https://dpop.nyc3.digitaloceanspaces.com/wp-content/uploads/2024/01/06162335/detroit-fowling.jpeg",
  },
];

export const SuggestedActivities = ({ }) => {
  return (
    <View>
      <Text style={{ padding: 16, fontSize: 18, fontWeight: 'bold', paddingBottom: 0 }}>Daily Activities</Text>
      <ScrollView
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {activities.map((activity) => {
          return (
            <TouchableOpacity
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
                }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
