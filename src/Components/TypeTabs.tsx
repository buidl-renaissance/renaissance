import React from "react";
import { ScrollView, View } from "react-native";

import FilterBubble from "./FilterBubble";

interface TypeTabProps {
  filter: string;
  setFilter: (filter: string) => void;
}

export const TypeTabs: React.FC<TypeTabProps> = ({ filter, setFilter }) => {
  return (
    <ScrollView
      style={{
        paddingHorizontal: 16,
        paddingTop: 8,
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
      }}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      <FilterBubble
        flat={true}
        active={filter === "all"}
        name="All"
        onPress={() => setFilter("all")}
      />
      <FilterBubble
        flat={true}
        active={filter === "art"}
        name="Art"
        onPress={() => setFilter("art")}
      />
      <FilterBubble
        flat={true}
        active={filter === "music"}
        name="Music"
        onPress={() => setFilter("music")}
      />
      <FilterBubble
        flat={true}
        active={filter === "sports"}
        name="Sports"
        onPress={() => setFilter("sports")}
      />
      <FilterBubble
        flat={true}
        active={filter === "fitness"}
        name="Fitness"
        onPress={() => setFilter("fitness")}
      />
      <FilterBubble
        flat={true}
        active={filter === "tech"}
        name="Tech"
        onPress={() => setFilter("tech")}
      />
      <FilterBubble
        flat={true}
        active={filter === "networking"}
        name="Networking"
        onPress={() => setFilter("networking")}
      />
      <View style={{ width: 16, height: 16 }} />
    </ScrollView>
  );
};
