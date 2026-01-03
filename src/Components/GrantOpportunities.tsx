import React from "react";
import { TouchableOpacity } from "react-native";

import { View, Text, Image } from "react-native";

import { SectionTitle } from "./SectionTitle";

import * as Linking from "expo-linking";
import { theme } from "../colors";

const grants = [
  {
    title: "Pollock-Krasner Foundation Grant",
    description:
      "Pollock-Krasner grants have enabled artists to create new work, purchase needed materials and pay for studio rent, as well as their personal expenses. Past recipients of Pollock-Krasner grants acknowledge their critical impact in allowing concentrated time for studio work, and in preparing for exhibitions and other professional opportunities such as accepting a residency.",
    url: "https://pkf.org/apply/",
  },
  {
    title: "The Gottlieb Foundation Individual Support Grant",
    description:
      "Financial assistance for individual painters, sculptors, and printmakers who have dedicated at least 20 years to their art, prioritizing maturity in intellectual, technical, and creative development, alongside demonstrating financial need.",
    url: "https://www.gottliebfoundation.org/individual-support-grant-1",
  },
  {
    title: "The Adolph & Esther Gottlieb Emergency Grant",
    description:
      "The Adolph and Esther Gottlieb Emergency Grant program is intended to provide interim financial assistance to qualified painters, printmakers, and sculptors whose needs are the result of an unforeseen, catastrophic incident, and who lack the resources to meet that situation.",
    url: "https://www.gottliebfoundation.org/emergency-grant",
  },
  {
    title: "National Theater Project",
    description:
      "The National Theater Project (NTP) supports the creation and touring of U.S. based, devised ensemble theater projects through direct funding and a cultivation of an informed, interactive network of ensembles, artists, and presenters throughout the field",
    url: "https://www.nefa.org/grants/grant-programs/national-theater-project",
  },
];

export const GrantOpportunities = ({}) => {
  return (
    <View>
      <SectionTitle>Grant Opportunities</SectionTitle>
      <View style={{ paddingHorizontal: 16 }}>
        {grants.map((grant) => {
          return (
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(grant.url);
              }}
              style={{ marginTop: 8 }}
            >
              {/* <Image
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
            /> */}
              <Text
                style={{ color: theme.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}
              >
                {grant.title}
              </Text>
              <Text style={{ color: '#333', fontSize: 12, marginBottom: 4 }}>
                {grant.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
